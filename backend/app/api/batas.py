from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..models import BatasMaksimum, Zat, Makanan, LogAktivitas, User
from ..schemas import BatasCreate, BatasUpdate, BatasResponse
from ..utils.security import get_current_user, require_role

router = APIRouter(prefix="/api/batas", tags=["Batas Maksimum"])


@router.get("", response_model=list[BatasResponse])
def get_all_batas(
    zat_id: Optional[int] = Query(None),
    makanan_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    """Get all batas maksimum (public)."""
    query = db.query(BatasMaksimum)
    if zat_id:
        query = query.filter(BatasMaksimum.zat_id == zat_id)
    if makanan_id:
        query = query.filter(BatasMaksimum.makanan_id == makanan_id)

    batas_list = query.all()
    result = []
    for b in batas_list:
        zat = db.query(Zat).filter(Zat.id == b.zat_id).first()
        makanan = db.query(Makanan).filter(Makanan.id == b.makanan_id).first()
        result.append(BatasResponse(
            id=b.id,
            zat_id=b.zat_id,
            zat_nama=zat.nama if zat else None,
            zat_kode=zat.kode if zat else None,
            makanan_id=b.makanan_id,
            makanan_nama=makanan.nama if makanan else None,
            nilai_maks=b.nilai_maks,
            satuan=b.satuan,
            changed_by=b.changed_by,
            created_at=b.created_at,
        ))
    return result


@router.get("/{batas_id}", response_model=BatasResponse)
def get_batas(batas_id: int, db: Session = Depends(get_db)):
    """Get detail batas maksimum (public)."""
    b = db.query(BatasMaksimum).filter(BatasMaksimum.id == batas_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Batas maksimum tidak ditemukan")

    zat = db.query(Zat).filter(Zat.id == b.zat_id).first()
    makanan = db.query(Makanan).filter(Makanan.id == b.makanan_id).first()
    return BatasResponse(
        id=b.id,
        zat_id=b.zat_id,
        zat_nama=zat.nama if zat else None,
        zat_kode=zat.kode if zat else None,
        makanan_id=b.makanan_id,
        makanan_nama=makanan.nama if makanan else None,
        nilai_maks=b.nilai_maks,
        satuan=b.satuan,
        changed_by=b.changed_by,
        created_at=b.created_at,
    )


@router.post("", response_model=BatasResponse)
def create_batas(
    req: BatasCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("superadmin", "editor")),
):
    """Create batas maksimum baru (admin)."""
    # Check if already exists
    existing = db.query(BatasMaksimum).filter(
        BatasMaksimum.zat_id == req.zat_id,
        BatasMaksimum.makanan_id == req.makanan_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Batas untuk pasangan zat-makanan ini sudah ada")

    zat = db.query(Zat).filter(Zat.id == req.zat_id).first()
    if not zat:
        raise HTTPException(status_code=404, detail="Zat tidak ditemukan")

    makanan = db.query(Makanan).filter(Makanan.id == req.makanan_id).first()
    if not makanan:
        raise HTTPException(status_code=404, detail="Makanan tidak ditemukan")

    batas = BatasMaksimum(
        zat_id=req.zat_id,
        makanan_id=req.makanan_id,
        nilai_maks=req.nilai_maks,
        satuan=req.satuan,
        changed_by=current_user.id,
    )
    db.add(batas)
    db.commit()
    db.refresh(batas)

    log = LogAktivitas(
        user_id=current_user.id,
        aksi="CREATE_BATAS",
        detail=f"Membuat batas maksimum: {zat.nama} - {makanan.nama} = {batas.nilai_maks} {batas.satuan}",
    )
    db.add(log)
    db.commit()

    return BatasResponse(
        id=batas.id,
        zat_id=batas.zat_id,
        zat_nama=zat.nama,
        zat_kode=zat.kode,
        makanan_id=batas.makanan_id,
        makanan_nama=makanan.nama,
        nilai_maks=batas.nilai_maks,
        satuan=batas.satuan,
        changed_by=batas.changed_by,
        created_at=batas.created_at,
    )


@router.put("/{batas_id}", response_model=BatasResponse)
def update_batas(
    batas_id: int,
    req: BatasUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("superadmin", "editor")),
):
    """Update batas maksimum (admin)."""
    batas = db.query(BatasMaksimum).filter(BatasMaksimum.id == batas_id).first()
    if not batas:
        raise HTTPException(status_code=404, detail="Batas maksimum tidak ditemukan")

    if req.nilai_maks is not None:
        batas.nilai_maks = req.nilai_maks
    if req.satuan is not None:
        batas.satuan = req.satuan
    batas.changed_by = current_user.id

    db.commit()
    db.refresh(batas)

    zat = db.query(Zat).filter(Zat.id == batas.zat_id).first()
    makanan = db.query(Makanan).filter(Makanan.id == batas.makanan_id).first()

    log = LogAktivitas(
        user_id=current_user.id,
        aksi="UPDATE_BATAS",
        detail=f"Update batas maksimum: {zat.nama if zat else ''} - {makanan.nama if makanan else ''} = {batas.nilai_maks} {batas.satuan}",
    )
    db.add(log)
    db.commit()

    return BatasResponse(
        id=batas.id,
        zat_id=batas.zat_id,
        zat_nama=zat.nama if zat else None,
        zat_kode=zat.kode if zat else None,
        makanan_id=batas.makanan_id,
        makanan_nama=makanan.nama if makanan else None,
        nilai_maks=batas.nilai_maks,
        satuan=batas.satuan,
        changed_by=batas.changed_by,
        created_at=batas.created_at,
    )


@router.delete("/{batas_id}")
def delete_batas(
    batas_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("superadmin")),
):
    """Delete batas maksimum (superadmin only)."""
    batas = db.query(BatasMaksimum).filter(BatasMaksimum.id == batas_id).first()
    if not batas:
        raise HTTPException(status_code=404, detail="Batas maksimum tidak ditemukan")

    db.delete(batas)
    db.commit()

    log = LogAktivitas(
        user_id=current_user.id,
        aksi="DELETE_BATAS",
        detail=f"Menghapus batas maksimum id: {batas_id}",
    )
    db.add(log)
    db.commit()

    return {"message": "Batas maksimum berhasil dihapus"}
