from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import KomentarPengunjung
from ..schemas import KomentarPengunjungCreate, KomentarPengunjungResponse

router = APIRouter(prefix="/api/komentar", tags=["Komentar Pengunjung"])


@router.post("", response_model=KomentarPengunjungResponse)
def create_komentar(
    req: KomentarPengunjungCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    """Tambah komentar pengunjung."""
    komentar = KomentarPengunjung(
        nama=req.nama,
        email=req.email,
        komentar=req.komentar,
        ip_address=request.client.host if request.client else None,
    )
    db.add(komentar)
    db.commit()
    db.refresh(komentar)
    return komentar


@router.get("", response_model=list[KomentarPengunjungResponse])
def get_komentar(
    db: Session = Depends(get_db),
):
    """Get komentar pengunjung terbaru."""
    return (
        db.query(KomentarPengunjung)
        .order_by(KomentarPengunjung.created_at.desc())
        .limit(10)
        .all()
    )
