from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..models import Rule, RuleAntecedent, Makanan, Zat, LogAktivitas, User
from ..schemas import RuleCreate, RuleUpdate, RuleResponse, AntecedentResponse
from ..utils.security import get_current_user, require_role
from ..services.inference_engine import test_rule

router = APIRouter(prefix="/api/rules", tags=["Rules"])


@router.get("", response_model=list[RuleResponse])
def get_all_rules(
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Get all rules (public)."""
    query = db.query(Rule)
    if search:
        query = query.filter(Rule.kode.ilike(f"%{search}%"))

    rules = query.all()
    result = []
    for rule in rules:
        makanan = db.query(Makanan).filter(Makanan.id == rule.makanan_id).first()
        antecedents = []
        for ant in rule.antecedents:
            zat = db.query(Zat).filter(Zat.id == ant.zat_id).first()
            antecedents.append(AntecedentResponse(
                id=ant.id,
                zat_id=ant.zat_id,
                zat_kode=zat.kode if zat else None,
                zat_nama=zat.nama if zat else None,
                operator=ant.operator,
            ))
        result.append(RuleResponse(
            id=rule.id,
            kode=rule.kode,
            makanan_id=rule.makanan_id,
            makanan_nama=makanan.nama if makanan else None,
            kesimpulan=rule.kesimpulan,
            is_active=rule.is_active,
            antecedents=antecedents,
            created_at=rule.created_at,
        ))
    return result


@router.get("/{rule_id}", response_model=RuleResponse)
def get_rule(rule_id: int, db: Session = Depends(get_db)):
    """Get detail rule (public)."""
    rule = db.query(Rule).filter(Rule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule tidak ditemukan")

    makanan = db.query(Makanan).filter(Makanan.id == rule.makanan_id).first()
    antecedents = []
    for ant in rule.antecedents:
        zat = db.query(Zat).filter(Zat.id == ant.zat_id).first()
        antecedents.append(AntecedentResponse(
            id=ant.id,
            zat_id=ant.zat_id,
            zat_kode=zat.kode if zat else None,
            zat_nama=zat.nama if zat else None,
            operator=ant.operator,
        ))

    return RuleResponse(
        id=rule.id,
        kode=rule.kode,
        makanan_id=rule.makanan_id,
        makanan_nama=makanan.nama if makanan else None,
        kesimpulan=rule.kesimpulan,
        is_active=rule.is_active,
        antecedents=antecedents,
        created_at=rule.created_at,
    )


@router.post("", response_model=RuleResponse)
def create_rule(
    req: RuleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("superadmin", "editor")),
):
    """Create rule baru (admin)."""
    existing = db.query(Rule).filter(Rule.kode == req.kode).first()
    if existing:
        raise HTTPException(status_code=400, detail="Kode rule sudah digunakan")

    makanan = db.query(Makanan).filter(Makanan.id == req.makanan_id).first()
    if not makanan:
        raise HTTPException(status_code=404, detail="Makanan tidak ditemukan")

    rule = Rule(
        kode=req.kode,
        makanan_id=req.makanan_id,
        kesimpulan=req.kesimpulan,
    )
    db.add(rule)
    db.flush()

    for ant in req.antecedents:
        zat = db.query(Zat).filter(Zat.id == ant.zat_id).first()
        if not zat:
            raise HTTPException(status_code=404, detail=f"Zat id {ant.zat_id} tidak ditemukan")
        antecedent = RuleAntecedent(
            rule_id=rule.id,
            zat_id=ant.zat_id,
            operator=ant.operator,
        )
        db.add(antecedent)

    db.commit()
    db.refresh(rule)

    log = LogAktivitas(
        user_id=current_user.id,
        aksi="CREATE_RULE",
        detail=f"Membuat rule baru: {rule.kode}",
    )
    db.add(log)
    db.commit()

    # Return the created rule
    return get_rule(rule.id, db)


@router.put("/{rule_id}", response_model=RuleResponse)
def update_rule(
    rule_id: int,
    req: RuleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("superadmin", "editor")),
):
    """Update rule (admin)."""
    rule = db.query(Rule).filter(Rule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule tidak ditemukan")

    if req.kode is not None:
        rule.kode = req.kode
    if req.makanan_id is not None:
        makanan = db.query(Makanan).filter(Makanan.id == req.makanan_id).first()
        if not makanan:
            raise HTTPException(status_code=404, detail="Makanan tidak ditemukan")
        rule.makanan_id = req.makanan_id
    if req.kesimpulan is not None:
        rule.kesimpulan = req.kesimpulan
    if req.is_active is not None:
        rule.is_active = req.is_active

    # Update antecedents if provided
    if req.antecedents is not None:
        # Delete old antecedents
        db.query(RuleAntecedent).filter(RuleAntecedent.rule_id == rule.id).delete()
        # Add new antecedents
        for ant in req.antecedents:
            zat = db.query(Zat).filter(Zat.id == ant.zat_id).first()
            if not zat:
                raise HTTPException(status_code=404, detail=f"Zat id {ant.zat_id} tidak ditemukan")
            antecedent = RuleAntecedent(
                rule_id=rule.id,
                zat_id=ant.zat_id,
                operator=ant.operator,
            )
            db.add(antecedent)

    db.commit()

    log = LogAktivitas(
        user_id=current_user.id,
        aksi="UPDATE_RULE",
        detail=f"Update rule: {rule.kode}",
    )
    db.add(log)
    db.commit()

    return get_rule(rule.id, db)


@router.delete("/{rule_id}")
def delete_rule(
    rule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("superadmin")),
):
    """Delete rule (superadmin only)."""
    rule = db.query(Rule).filter(Rule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule tidak ditemukan")

    db.delete(rule)
    db.commit()

    log = LogAktivitas(
        user_id=current_user.id,
        aksi="DELETE_RULE",
        detail=f"Menghapus rule: {rule.kode}",
    )
    db.add(log)
    db.commit()

    return {"message": "Rule berhasil dihapus"}


@router.post("/{rule_id}/test")
def test_rule_endpoint(
    rule_id: int,
    zat_ids: list[int],
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("superadmin", "editor")),
):
    """Test rule dengan zat_ids tertentu (admin)."""
    result = test_rule(db, rule_id, zat_ids)
    return result
