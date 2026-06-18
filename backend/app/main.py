"""
Sistem Pakar Penggunaan Zat Kimia pada Makanan
FastAPI Backend Entry Point
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from .database import engine, Base, SessionLocal
from .models import User, LogAktivitas
from .utils.security import hash_password
from .config import settings

# Create all tables
Base.metadata.create_all(bind=engine)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Sistem Pakar Zat Kimia pada Makanan",
    description="API untuk mendeteksi bahaya zat kimia pada makanan menggunakan metode Forward Chaining",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Import routers
from .api import auth, zat, makanan, rule, batas, konsultasi, dashboard, settings, komentar

app.include_router(auth.router)
app.include_router(zat.router)
app.include_router(makanan.router)
app.include_router(rule.router)
app.include_router(batas.router)
app.include_router(konsultasi.router)
app.include_router(dashboard.router)
app.include_router(settings.router)
app.include_router(komentar.router)


@app.on_event("startup")
def startup():
    """Initialize database with seed data on first run."""
    db = SessionLocal()
    try:
        # Check if admin user exists
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            # Create default admin
            admin = User(
                username="admin",
                password_hash=hash_password("admin123"),
                role="superadmin",
            )
            db.add(admin)
            db.commit()

            log = LogAktivitas(
                user_id=admin.id,
                aksi="SYSTEM",
                detail="System initialized with default admin account",
            )
            db.add(log)
            db.commit()
    finally:
        db.close()


@app.get("/")
def root():
    return {
        "message": "Sistem Pakar Penggunaan Zat Kimia pada Makanan",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Terjadi kesalahan internal server", "error": str(exc)},
    )
