from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import AppSetting, LogAktivitas, User
from ..schemas import AppSettingsUpdate, AppSettingsResponse
from ..utils.security import get_current_user, require_role

router = APIRouter(prefix="/api/settings", tags=["Settings"])

DEFAULT_SETTINGS = {
    "app_name": "SPZKB",
    "app_title": "Sistem Pakar Zat Kimia pada Makanan",
    "logo_url": "",
    "favicon_url": "",
}


def get_settings_map(db: Session) -> dict[str, str]:
    rows = db.query(AppSetting).all()
    settings = {row.key: row.value for row in rows}
    for key, value in DEFAULT_SETTINGS.items():
        settings.setdefault(key, value)
    return settings


def upsert_setting(db: Session, key: str, value: str) -> None:
    setting = db.query(AppSetting).filter(AppSetting.key == key).first()
    if setting:
        setting.value = value
    else:
        setting = AppSetting(key=key, value=value)
        db.add(setting)


@router.get("", response_model=AppSettingsResponse)
def get_settings(db: Session = Depends(get_db)):
    """Get application branding settings."""
    return AppSettingsResponse(**get_settings_map(db))


@router.put("", response_model=AppSettingsResponse)
def update_settings(
    req: AppSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("superadmin")),
):
    """Update application branding settings."""
    values = req.model_dump(exclude_unset=True)
    allowed_keys = set(DEFAULT_SETTINGS.keys())
    for key, value in values.items():
        if key not in allowed_keys:
            raise HTTPException(status_code=400, detail="Key pengaturan tidak valid")
        upsert_setting(db, key, value or DEFAULT_SETTINGS[key])
    db.commit()

    log = LogAktivitas(
        user_id=current_user.id,
        aksi="UPDATE_SETTINGS",
        detail="Update pengaturan aplikasi",
    )
    db.add(log)
    db.commit()

    return AppSettingsResponse(**get_settings_map(db))
