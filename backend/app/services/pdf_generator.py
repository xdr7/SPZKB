"""
PDF Generator menggunakan ReportLab
"""
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, red, green, black
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    Image, PageBreak
)
from reportlab.lib import colors
from typing import List
from ..schemas import KonsultasiResult


def generate_konsultasi_pdf(
    results: List[KonsultasiResult],
    nama_makanan: str,
) -> BytesIO:
    """Generate PDF laporan hasil konsultasi."""
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "CustomTitle",
        parent=styles["Title"],
        fontSize=20,
        spaceAfter=12,
        textColor=HexColor("#1a56db"),
    )
    subtitle_style = ParagraphStyle(
        "CustomSubtitle",
        parent=styles["Heading2"],
        fontSize=14,
        spaceAfter=8,
        textColor=HexColor("#374151"),
    )
    normal_style = ParagraphStyle(
        "CustomNormal",
        parent=styles["Normal"],
        fontSize=10,
        spaceAfter=6,
        leading=14,
    )
    danger_style = ParagraphStyle(
        "DangerStyle",
        parent=normal_style,
        textColor=red,
        fontSize=12,
        bold=1,
    )
    safe_style = ParagraphStyle(
        "SafeStyle",
        parent=normal_style,
        textColor=green,
        fontSize=12,
        bold=1,
    )

    elements = []

    # Title
    elements.append(Paragraph("LAPORAN HASIL KONSULTASI", title_style))
    elements.append(Paragraph("Sistem Pakar Penggunaan Zat Kimia pada Makanan", subtitle_style))
    elements.append(Spacer(1, 12))

    # Makanan info
    elements.append(Paragraph(f"<b>Makanan:</b> {nama_makanan}", normal_style))
    elements.append(Spacer(1, 12))

    # Results table
    for i, r in enumerate(results, 1):
        elements.append(Paragraph(f"<b>Hasil Analisis #{i}</b>", subtitle_style))
        elements.append(Spacer(1, 6))

        status_text = f"Status: {r.hasil}"
        if r.hasil == "BERBAHAYA":
            elements.append(Paragraph(status_text, danger_style))
        else:
            elements.append(Paragraph(status_text, safe_style))

        data = [
            ["Zat Kimia", r.zat_nama],
            ["Kode Zat", r.zat_kode],
            ["Kadar", f"{r.kadar} {r.satuan}"],
        ]

        if r.batas_maks is not None:
            data.append(["Batas Maksimum", f"{r.batas_maks} {r.batas_satuan}"])
            data.append(["Persentase", f"{r.persentase}%"])

        if r.hasil == "BERBAHAYA":
            if r.efek_kesehatan:
                data.append(["Efek Kesehatan", r.efek_kesehatan])
            if r.solusi:
                data.append(["Solusi", r.solusi])
            if r.rules_terpenuhi:
                data.append(["Aturan Terpenuhi", ", ".join(r.rules_terpenuhi)])

        table = Table(data, colWidths=[120, 350])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), HexColor("#f3f4f6")),
            ("TEXTCOLOR", (0, 0), (-1, -1), black),
            ("ALIGN", (0, 0), (-1, -1), "LEFT"),
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#d1d5db")),
        ]))
        elements.append(table)
        elements.append(Spacer(1, 12))

    # Footer
    elements.append(Spacer(1, 24))
    elements.append(Paragraph(
        "<i>Laporan ini dihasilkan oleh Sistem Pakar Penggunaan Zat Kimia pada Makanan.</i>",
        ParagraphStyle("Footer", parent=normal_style, fontSize=8, textColor=HexColor("#9ca3af")),
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer
