from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ============ Auth ============
class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str


class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "viewer"


class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


# ============ Zat ============
class ZatCreate(BaseModel):
    kode: Optional[str] = None
    nama: str
    efek_kesehatan: str
    solusi: str


class ZatUpdate(BaseModel):
    nama: Optional[str] = None
    efek_kesehatan: Optional[str] = None
    solusi: Optional[str] = None


class ZatResponse(BaseModel):
    id: int
    kode: str
    nama: str
    efek_kesehatan: str
    solusi: str
    icon: Optional[str] = None
    is_deleted: bool = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============ Makanan ============
class MakananCreate(BaseModel):
    kode: Optional[str] = None
    nama: str
    deskripsi: Optional[str] = None


class MakananUpdate(BaseModel):
    nama: Optional[str] = None
    deskripsi: Optional[str] = None


class MakananResponse(BaseModel):
    id: int
    kode: str
    nama: str
    deskripsi: Optional[str] = None
    gambar: Optional[str] = None
    is_deleted: bool = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============ Rule ============
class AntecedentInput(BaseModel):
    zat_id: int
    operator: str = "OR"


class RuleCreate(BaseModel):
    kode: str
    makanan_id: int
    kesimpulan: str = "Berbahaya"
    antecedents: List[AntecedentInput]


class RuleUpdate(BaseModel):
    kode: Optional[str] = None
    makanan_id: Optional[int] = None
    kesimpulan: Optional[str] = None
    is_active: Optional[bool] = None
    antecedents: Optional[List[AntecedentInput]] = None


class AntecedentResponse(BaseModel):
    id: int
    zat_id: int
    zat_kode: Optional[str] = None
    zat_nama: Optional[str] = None
    operator: str

    class Config:
        from_attributes = True


class RuleResponse(BaseModel):
    id: int
    kode: str
    makanan_id: int
    makanan_nama: Optional[str] = None
    kesimpulan: str
    is_active: bool
    antecedents: List[AntecedentResponse] = []
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============ Batas Maksimum ============
class BatasCreate(BaseModel):
    zat_id: int
    makanan_id: int
    nilai_maks: float
    satuan: str = "mg"


class BatasUpdate(BaseModel):
    nilai_maks: Optional[float] = None
    satuan: Optional[str] = None


class BatasResponse(BaseModel):
    id: int
    zat_id: int
    zat_nama: Optional[str] = None
    zat_kode: Optional[str] = None
    makanan_id: int
    makanan_nama: Optional[str] = None
    nilai_maks: float
    satuan: str
    changed_by: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============ Konsultasi ============
class KonsultasiRequest(BaseModel):
    makanan_id: int
    zat_ids: List[int]
    kadar: float
    satuan: str = "mg"


class KonsultasiResult(BaseModel):
    id: Optional[int] = None
    zat_id: int
    zat_nama: str
    zat_kode: str
    makanan_id: int
    makanan_nama: str
    kadar: float
    satuan: str
    batas_maks: Optional[float] = None
    batas_satuan: Optional[str] = None
    persentase: Optional[float] = None
    hasil: str  # AMAN / BERBAHAYA
    efek_kesehatan: Optional[str] = None
    solusi: Optional[str] = None
    rules_terpenuhi: List[str] = []


class KonsultasiResponse(BaseModel):
    id: int
    makanan_id: int
    makanan_nama: Optional[str] = None
    zat_id: int
    zat_nama: Optional[str] = None
    kadar: float
    satuan: str
    batas_maks: Optional[float] = None
    hasil: str
    persentase: Optional[float] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============ Dashboard ============
class DashboardStats(BaseModel):
    total_zat: int
    total_makanan: int
    total_aturan: int
    total_konsultasi: int
    konsultasi_per_bulan: List[dict] = []


class LogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    username: Optional[str] = None
    aksi: str
    detail: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============ App Settings ============
class AppSettingsUpdate(BaseModel):
    app_name: Optional[str] = None
    app_title: Optional[str] = None
    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None


class AppSettingsResponse(BaseModel):
    app_name: str
    app_title: str
    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None


# ============ Komentar Pengunjung ============
class KomentarPengunjungCreate(BaseModel):
    nama: str
    email: Optional[str] = None
    komentar: str


class KomentarPengunjungResponse(BaseModel):
    id: int
    nama: str
    email: Optional[str] = None
    komentar: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
