from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from ..database import get_db
from ..models import Zat, Makanan, Rule, Konsultasi, LogAktivitas, User
from ..schemas import DashboardStats, LogResponse
from ..utils.security import get_current_user, require_role

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("superadmin", "editor", "viewer")),
):
    """Get dashboard statistics (admin only)."""
    total_zat = db.query(Zat).filter(Zat.is_deleted == False).count()
    total_makanan = db.query(Makanan).filter(Makanan.is_deleted == False).count()
    total_aturan = db.query(Rule).count()
    total_konsultasi = db.query(Konsultasi).count()

    # Konsultasi per bulan (last 12 months)
    konsultasi_per_bulan = []
    for month in range(1, 13):
        count = (
            db.query(Konsultasi)
            .filter(extract("month", Konsultasi.created_at) == month)
            .filter(extract("year", Konsultasi.created_at) == func.extract("year", func.now()))
            .count()
        )
        konsultasi_per_bulan.append({"bulan": month, "jumlah": count})

    return DashboardStats(
        total_zat=total_zat,
        total_makanan=total_makanan,
        total_aturan=total_aturan,
        total_konsultasi=total_konsultasi,
        konsultasi_per_bulan=konsultasi_per_bulan,
    )


@router.get("/logs", response_model=list[LogResponse])
def get_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("superadmin", "editor", "viewer")),
):
    """Get recent activity logs (admin only)."""
    logs = (
        db.query(LogAktivitas)
        .order_by(LogAktivitas.created_at.desc())
        .limit(50)
        .all()
    )

    result = []
    for log in logs:
        user = db.query(User).filter(User.id == log.user_id).first() if log.user_id else None
        result.append(LogResponse(
            id=log.id,
            user_id=log.user_id,
            username=user.username if user else None,
            aksi=log.aksi,
            detail=log.detail,
            created_at=log.created_at,
        ))
    return result
