from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, LogAktivitas
from ..schemas import LoginRequest, TokenResponse, UserCreate, UserResponse, ChangePasswordRequest
from ..utils.security import (
    hash_password, verify_password, create_access_token,
    get_current_user, require_role,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, request: Request, db: Session = Depends(get_db)):
    """Login untuk mendapatkan JWT token."""
    user = db.query(User).filter(User.username == req.username, User.is_active == True).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username atau password salah",
        )

    token = create_access_token(data={"sub": user.username, "role": user.role.value})

    # Log aktivitas login
    log = LogAktivitas(
        user_id=user.id,
        aksi="LOGIN",
        detail=f"User {user.username} login",
        ip_address=request.client.host if request.client else None,
    )
    db.add(log)
    db.commit()

    return TokenResponse(access_token=token, role=user.role.value)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get current user info."""
    return current_user


@router.post("/register", response_model=UserResponse)
def register(
    req: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("superadmin")),
):
    """Register admin baru (hanya superadmin)."""
    existing = db.query(User).filter(User.username == req.username).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username sudah digunakan",
        )

    user = User(
        username=req.username,
        password_hash=hash_password(req.password),
        role=req.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.put("/change-password")
def change_password(
    req: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ganti password sendiri."""
    if not verify_password(req.old_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password lama salah",
        )

    current_user.password_hash = hash_password(req.new_password)
    db.commit()
    return {"message": "Password berhasil diubah"}


@router.get("/users", response_model=list[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("superadmin")),
):
    """Get all users (superadmin only)."""
    return db.query(User).all()
