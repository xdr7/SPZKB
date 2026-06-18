from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
import re
from ..database import get_db
from ..models import Zat, LogAktivitas, User
from ..schemas import ZatCreate, ZatUpdate, ZatResponse
from ..utils.security import get_current_user, require_role

router = APIRouter(prefix="/api/zat", tags=["Zat Kimia"])


def generate_next_code(db: Session, model, prefix: str) -> str:
    numbers = set()
    for item in db.query(model).filter(model.is_deleted == False).all():
        match = re.match(rf"^{prefix}(\d+)$", item.kode or "")
        if match:
            numbers.add(int(match.group(1)))
    if not numbers:
        return f"{prefix}001"
    for number in range(1, max(numbers) + 2):
        if number not in numbers:
            return f"{prefix}{number:03d}"
    return f"{prefix}{max(numbers) + 1:03d}"


@router.get("", response_model=list[ZatResponse])
def get_all_zat(
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Get all zat kimia (public)."""
    query = db.query(Zat).filter(Zat.is_deleted == False)
    if search:
        query = query.filter(
            Zat.nama.ilike(f"%{search}%") | Zat.kode.ilike(f"%{search}%")
        )
    return query.all()


@router.get("/{zat_id}", response_model=ZatResponse)
def get_zat(zat_id: int, db: Session = Depends(get_db)):
    """Get detail zat kimia (public)."""
    zat = db.query(Zat).filter(Zat.id == zat_id, Zat.is_deleted == False).first()
    if not zat:
        raise HTTPException(status_code=404, detail="Zat tidak ditemukan")
    return zat


@router.post("", response_model=ZatResponse)
def create_zat(
    req: ZatCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("superadmin", "editor")),
):
    """Create zat kimia baru (admin)."""
    kode = generate_next_code(db, Zat, "Z") if not req.kode or req.kode.strip().upper() in {"AUTO", "OTOMATIS"} else req.kode.strip().upper()
    existing = db.query(Zat).filter(Zat.kode == kode, Zat.is_deleted == False).first()
    if existing:
        raise HTTPException(status_code=400, detail="Kode zat sudah digunakan")

    deleted_existing = db.query(Zat).filter(Zat.kode == kode, Zat.is_deleted == True).first()
    if deleted_existing:
        zat = deleted_existing
        zat.nama = req.nama
        zat.efek_kesehatan = req.efek_kesehatan
        zat.solusi = req.solusi
        zat.is_deleted = False
    else:
        zat = Zat(
            kode=kode,
            nama=req.nama,
            efek_kesehatan=req.efek_kesehatan,
            solusi=req.solusi,
        )
        db.add(zat)
    db.commit()
    db.refresh(zat)

    log = LogAktivitas(
        user_id=current_user.id,
        aksi="CREATE_ZAT",
        detail=f"Membuat zat baru: {zat.kode} - {zat.nama}",
    )
    db.add(log)
    db.commit()

    return zat


@router.put("/{zat_id}", response_model=ZatResponse)
def update_zat(
    zat_id: int,
    req: ZatUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("superadmin", "editor")),
):
    """Update zat kimia (admin)."""
    zat = db.query(Zat).filter(Zat.id == zat_id, Zat.is_deleted == False).first()
    if not zat:
        raise HTTPException(status_code=404, detail="Zat tidak ditemukan")

    for key, value in req.model_dump(exclude_unset=True).items():
        setattr(zat, key, value)

    db.commit()
    db.refresh(zat)

    log = LogAktivitas(
        user_id=current_user.id,
        aksi="UPDATE_ZAT",
        detail=f"Update zat: {zat.kode} - {zat.nama}",
    )
    db.add(log)
    db.commit()

    return zat


@router.delete("/{zat_id}")
def delete_zat(
    zat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("superadmin")),
):
    """Soft delete zat kimia (superadmin only)."""
    zat = db.query(Zat).filter(Zat.id == zat_id, Zat.is_deleted == False).first()
    if not zat:
        raise HTTPException(status_code=404, detail="Zat tidak ditemukan")

    zat.is_deleted = True
    db.commit()

    log = LogAktivitas(
        user_id=current_user.id,
        aksi="DELETE_ZAT",
        detail=f"Menghapus zat: {zat.kode} - {zat.nama}",
    )
    db.add(log)
    db.commit()

    return {"message": "Zat berhasil dihapus"}
