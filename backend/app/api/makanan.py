from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
import re
from ..database import get_db
from ..models import Makanan, Zat, BatasMaksimum, LogAktivitas, User
from ..schemas import MakananCreate, MakananUpdate, MakananResponse
from ..utils.security import get_current_user, require_role

router = APIRouter(prefix="/api/makanan", tags=["Makanan"])


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


@router.get("", response_model=list[MakananResponse])
def get_all_makanan(
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Get all makanan (public)."""
    query = db.query(Makanan).filter(Makanan.is_deleted == False)
    if search:
        query = query.filter(
            Makanan.nama.ilike(f"%{search}%") | Makanan.kode.ilike(f"%{search}%")
        )
    return query.all()


@router.get("/{makanan_id}", response_model=MakananResponse)
def get_makanan(makanan_id: int, db: Session = Depends(get_db)):
    """Get detail makanan (public)."""
    makanan = db.query(Makanan).filter(Makanan.id == makanan_id, Makanan.is_deleted == False).first()
    if not makanan:
        raise HTTPException(status_code=404, detail="Makanan tidak ditemukan")
    return makanan


@router.get("/{makanan_id}/zat")
def get_zat_by_makanan(makanan_id: int, db: Session = Depends(get_db)):
    """Get zat kimia yang terkait dengan makanan (public)."""
    makanan = db.query(Makanan).filter(Makanan.id == makanan_id, Makanan.is_deleted == False).first()
    if not makanan:
        raise HTTPException(status_code=404, detail="Makanan tidak ditemukan")

    batas_list = db.query(BatasMaksimum).filter(BatasMaksimum.makanan_id == makanan_id).all()
    result = []
    for b in batas_list:
        zat = db.query(Zat).filter(Zat.id == b.zat_id).first()
        if zat:
            result.append({
                "zat_id": zat.id,
                "zat_kode": zat.kode,
                "zat_nama": zat.nama,
                "batas_maks": b.nilai_maks,
                "satuan": b.satuan,
            })
    return result


@router.post("", response_model=MakananResponse)
def create_makanan(
    req: MakananCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("superadmin", "editor")),
):
    """Create makanan baru (admin)."""
    kode = generate_next_code(db, Makanan, "M") if not req.kode or req.kode.strip().upper() in {"AUTO", "OTOMATIS"} else req.kode.strip().upper()
    existing = db.query(Makanan).filter(Makanan.kode == kode, Makanan.is_deleted == False).first()
    if existing:
        raise HTTPException(status_code=400, detail="Kode makanan sudah digunakan")

    deleted_existing = db.query(Makanan).filter(Makanan.kode == kode, Makanan.is_deleted == True).first()
    if deleted_existing:
        makanan = deleted_existing
        makanan.nama = req.nama
        makanan.deskripsi = req.deskripsi
        makanan.is_deleted = False
    else:
        makanan = Makanan(
            kode=kode,
            nama=req.nama,
            deskripsi=req.deskripsi,
        )
        db.add(makanan)
    db.commit()
    db.refresh(makanan)

    log = LogAktivitas(
        user_id=current_user.id,
        aksi="CREATE_MAKANAN",
        detail=f"Membuat makanan baru: {makanan.kode} - {makanan.nama}",
    )
    db.add(log)
    db.commit()

    return makanan


@router.put("/{makanan_id}", response_model=MakananResponse)
def update_makanan(
    makanan_id: int,
    req: MakananUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("superadmin", "editor")),
):
    """Update makanan (admin)."""
    makanan = db.query(Makanan).filter(Makanan.id == makanan_id, Makanan.is_deleted == False).first()
    if not makanan:
        raise HTTPException(status_code=404, detail="Makanan tidak ditemukan")

    for key, value in req.model_dump(exclude_unset=True).items():
        setattr(makanan, key, value)

    db.commit()
    db.refresh(makanan)

    log = LogAktivitas(
        user_id=current_user.id,
        aksi="UPDATE_MAKANAN",
        detail=f"Update makanan: {makanan.kode} - {makanan.nama}",
    )
    db.add(log)
    db.commit()

    return makanan


@router.delete("/{makanan_id}")
def delete_makanan(
    makanan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("superadmin")),
):
    """Soft delete makanan (superadmin only)."""
    makanan = db.query(Makanan).filter(Makanan.id == makanan_id, Makanan.is_deleted == False).first()
    if not makanan:
        raise HTTPException(status_code=404, detail="Makanan tidak ditemukan")

    makanan.is_deleted = True
    db.commit()

    log = LogAktivitas(
        user_id=current_user.id,
        aksi="DELETE_MAKANAN",
        detail=f"Menghapus makanan: {makanan.kode} - {makanan.nama}",
    )
    db.add(log)
    db.commit()

    return {"message": "Makanan berhasil dihapus"}
