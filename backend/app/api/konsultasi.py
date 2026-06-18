from fastapi import APIRouter, Depends, HTTPException, Request, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..models import Konsultasi, Makanan, Zat, LogAktivitas, User, Rule, RuleAntecedent, BatasMaksimum
from ..schemas import KonsultasiRequest, KonsultasiResult, KonsultasiResponse
from ..utils.security import get_current_user, require_role
from ..services.inference_engine import analisis_konsultasi
from ..services.pdf_generator import generate_konsultasi_pdf
import openpyxl
from io import BytesIO

router = APIRouter(prefix="/api/konsultasi", tags=["Konsultasi"])


@router.post("", response_model=list[KonsultasiResult])
def create_konsultasi(
    req: KonsultasiRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Melakukan konsultasi analisis zat kimia pada makanan.
    Endpoint publik - tidak perlu login.
    """
    ip_address = request.client.host if request.client else None

    # Validasi makanan
    makanan = db.query(Makanan).filter(Makanan.id == req.makanan_id, Makanan.is_deleted == False).first()
    if not makanan:
        raise HTTPException(status_code=404, detail="Makanan tidak ditemukan")

    # Validasi zat
    for zat_id in req.zat_ids:
        zat = db.query(Zat).filter(Zat.id == zat_id, Zat.is_deleted == False).first()
        if not zat:
            raise HTTPException(status_code=404, detail=f"Zat id {zat_id} tidak ditemukan")

    # Validasi kadar
    if req.kadar <= 0:
        raise HTTPException(status_code=400, detail="Kadar harus lebih dari 0")

    # Lakukan analisis
    results = analisis_konsultasi(
        db=db,
        makanan_id=req.makanan_id,
        zat_ids=req.zat_ids,
        kadar=req.kadar,
        satuan=req.satuan,
        ip_address=ip_address,
    )

    return results


@router.get("/{konsultasi_id}/pdf")
def get_konsultasi_pdf(
    konsultasi_id: int,
    db: Session = Depends(get_db),
):
    """Get PDF laporan hasil konsultasi."""
    k = db.query(Konsultasi).filter(Konsultasi.id == konsultasi_id).first()
    if not k:
        raise HTTPException(status_code=404, detail="Konsultasi tidak ditemukan")

    makanan = db.query(Makanan).filter(Makanan.id == k.makanan_id).first()
    zat = db.query(Zat).filter(Zat.id == k.zat_id).first()
    if not makanan or not zat:
        raise HTTPException(status_code=404, detail="Data konsultasi tidak lengkap")

    batas = db.query(BatasMaksimum).filter(
        BatasMaksimum.zat_id == k.zat_id,
        BatasMaksimum.makanan_id == k.makanan_id,
    ).first()

    rules = (
        db.query(Rule)
        .join(RuleAntecedent, Rule.id == RuleAntecedent.rule_id)
        .filter(
            Rule.makanan_id == k.makanan_id,
            RuleAntecedent.zat_id == k.zat_id,
        )
        .all()
    )

    result = KonsultasiResult(
        id=k.id,
        zat_id=k.zat_id,
        zat_nama=zat.nama,
        zat_kode=zat.kode,
        makanan_id=k.makanan_id,
        makanan_nama=makanan.nama,
        kadar=k.kadar,
        satuan=k.satuan,
        batas_maks=k.batas_maks,
        batas_satuan=batas.satuan if batas else None,
        persentase=k.persentase,
        hasil=k.hasil,
        efek_kesehatan=zat.efek_kesehatan if k.hasil == "BERBAHAYA" else None,
        solusi=zat.solusi if k.hasil == "BERBAHAYA" else None,
        rules_terpenuhi=[rule.kode for rule in rules],
    )

    pdf_buffer = generate_konsultasi_pdf([result], makanan.nama)
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=hasil_konsultasi_{makanan.kode}.pdf"},
    )


@router.get("", response_model=list[KonsultasiResponse])
def get_all_konsultasi(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("superadmin", "editor", "viewer")),
):
    """Get all konsultasi (admin only)."""
    offset = (page - 1) * limit
    konsultasi_list = (
        db.query(Konsultasi)
        .order_by(Konsultasi.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    result = []
    for k in konsultasi_list:
        makanan = db.query(Makanan).filter(Makanan.id == k.makanan_id).first()
        zat = db.query(Zat).filter(Zat.id == k.zat_id).first()
        result.append(KonsultasiResponse(
            id=k.id,
            makanan_id=k.makanan_id,
            makanan_nama=makanan.nama if makanan else None,
            zat_id=k.zat_id,
            zat_nama=zat.nama if zat else None,
            kadar=k.kadar,
            satuan=k.satuan,
            batas_maks=k.batas_maks,
            hasil=k.hasil,
            persentase=k.persentase,
            created_at=k.created_at,
        ))
    return result


@router.get("/export/pdf")
def export_konsultasi_pdf(
    makanan_id: int,
    zat_ids: str = Query(..., description="Comma-separated zat IDs"),
    kadar: float = Query(...),
    satuan: str = Query("mg"),
    db: Session = Depends(get_db),
):
    """Export hasil konsultasi ke PDF."""
    zat_id_list = [int(x) for x in zat_ids.split(",")]
    makanan = db.query(Makanan).filter(Makanan.id == makanan_id).first()
    if not makanan:
        raise HTTPException(status_code=404, detail="Makanan tidak ditemukan")

    results = analisis_konsultasi(
        db=db,
        makanan_id=makanan_id,
        zat_ids=zat_id_list,
        kadar=kadar,
        satuan=satuan,
    )

    pdf_buffer = generate_konsultasi_pdf(results, makanan.nama)
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=hasil_konsultasi_{makanan.kode}.pdf"},
    )


@router.get("/export/excel")
def export_konsultasi_excel(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("superadmin", "editor", "viewer")),
):
    """Export semua data konsultasi ke Excel (admin only)."""
    konsultasi_list = db.query(Konsultasi).order_by(Konsultasi.created_at.desc()).all()

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Data Konsultasi"
    ws.append(["ID", "Makanan", "Zat", "Kadar", "Satuan", "Batas Maks", "Hasil", "Persentase", "IP Address", "Tanggal"])

    for k in konsultasi_list:
        makanan = db.query(Makanan).filter(Makanan.id == k.makanan_id).first()
        zat = db.query(Zat).filter(Zat.id == k.zat_id).first()
        ws.append([
            k.id,
            makanan.nama if makanan else "",
            zat.nama if zat else "",
            k.kadar,
            k.satuan,
            k.batas_maks,
            k.hasil,
            k.persentase,
            k.ip_address,
            str(k.created_at) if k.created_at else "",
        ])

    excel_buffer = BytesIO()
    wb.save(excel_buffer)
    excel_buffer.seek(0)

    return StreamingResponse(
        excel_buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=data_konsultasi.xlsx"},
    )
