from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from .database import Base


class UserRole(str, enum.Enum):
    SUPERADMIN = "superadmin"
    EDITOR = "editor"
    VIEWER = "viewer"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), default=UserRole.VIEWER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Zat(Base):
    __tablename__ = "zat"

    id = Column(Integer, primary_key=True, index=True)
    kode = Column(String(10), unique=True, index=True, nullable=False)
    nama = Column(String(100), nullable=False)
    efek_kesehatan = Column(Text, nullable=False)
    solusi = Column(Text, nullable=False)
    icon = Column(String(255), nullable=True)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # relationships
    rules_as_antecedent = relationship("RuleAntecedent", back_populates="zat")
    batas_list = relationship("BatasMaksimum", back_populates="zat")


class Makanan(Base):
    __tablename__ = "makanan"

    id = Column(Integer, primary_key=True, index=True)
    kode = Column(String(10), unique=True, index=True, nullable=False)
    nama = Column(String(100), nullable=False)
    deskripsi = Column(Text, nullable=True)
    gambar = Column(String(255), nullable=True)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # relationships
    rules_as_consequent = relationship("Rule", back_populates="makanan")
    batas_list = relationship("BatasMaksimum", back_populates="makanan")


class Rule(Base):
    __tablename__ = "rules"

    id = Column(Integer, primary_key=True, index=True)
    kode = Column(String(10), unique=True, index=True, nullable=False)
    makanan_id = Column(Integer, ForeignKey("makanan.id"), nullable=False)
    kesimpulan = Column(String(50), default="Berbahaya")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # relationships
    makanan = relationship("Makanan", back_populates="rules_as_consequent")
    antecedents = relationship("RuleAntecedent", back_populates="rule", cascade="all, delete-orphan")


class RuleAntecedent(Base):
    __tablename__ = "rule_antecedents"

    id = Column(Integer, primary_key=True, index=True)
    rule_id = Column(Integer, ForeignKey("rules.id"), nullable=False)
    zat_id = Column(Integer, ForeignKey("zat.id"), nullable=False)
    operator = Column(String(10), default="OR")  # OR / AND

    # relationships
    rule = relationship("Rule", back_populates="antecedents")
    zat = relationship("Zat", back_populates="rules_as_antecedent")


class BatasMaksimum(Base):
    __tablename__ = "batas_maksimum"

    id = Column(Integer, primary_key=True, index=True)
    zat_id = Column(Integer, ForeignKey("zat.id"), nullable=False)
    makanan_id = Column(Integer, ForeignKey("makanan.id"), nullable=False)
    nilai_maks = Column(Float, nullable=False)
    satuan = Column(String(20), default="mg")  # mg or gram
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    changed_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    # relationships
    zat = relationship("Zat", back_populates="batas_list")
    makanan = relationship("Makanan", back_populates="batas_list")


class Konsultasi(Base):
    __tablename__ = "konsultasi"

    id = Column(Integer, primary_key=True, index=True)
    makanan_id = Column(Integer, ForeignKey("makanan.id"), nullable=False)
    zat_id = Column(Integer, ForeignKey("zat.id"), nullable=False)
    kadar = Column(Float, nullable=False)
    satuan = Column(String(20), default="mg")
    batas_maks = Column(Float, nullable=True)
    hasil = Column(String(20), nullable=False)  # "AMAN" or "BERBAHAYA"
    persentase = Column(Float, nullable=True)  # kadar / batas_maks * 100
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # relationships
    makanan = relationship("Makanan")
    zat = relationship("Zat")


class LogAktivitas(Base):
    __tablename__ = "log_aktivitas"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    aksi = Column(String(100), nullable=False)
    detail = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AppSetting(Base):
    __tablename__ = "app_settings"

    key = Column(String(100), primary_key=True, index=True)
    value = Column(Text, nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class KomentarPengunjung(Base):
    __tablename__ = "komentar_pengunjung"

    id = Column(Integer, primary_key=True, index=True)
    nama = Column(String(100), nullable=False)
    email = Column(String(150), nullable=True)
    komentar = Column(Text, nullable=False)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
