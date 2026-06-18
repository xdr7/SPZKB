"""
Forward Chaining Inference Engine
==================================
Mendeteksi bahaya zat kimia pada makanan berdasarkan aturan IF-THEN.

Alur Forward Chaining:
1. User memilih makanan dan zat kimia
2. Engine mencari aturan yang cocok (makanan_id match)
3. Engine mengecek apakah zat kimia yang dipilih memenuhi antecedents aturan
4. Jika ya, aturan terpenuhi -> hasil BERBAHAYA
5. Engine juga memeriksa batas maksimum penggunaan
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from ..models import Rule, RuleAntecedent, BatasMaksimum, Zat, Makanan, Konsultasi
from ..schemas import KonsultasiResult


def konversi_ke_mg(nilai: float, satuan: str) -> float:
    """Konversi gram ke mg untuk perbandingan yang konsisten."""
    if satuan.lower() == "gram":
        return nilai * 1000
    return nilai


def analisis_konsultasi(
    db: Session,
    makanan_id: int,
    zat_ids: List[int],
    kadar: float,
    satuan: str,
    ip_address: Optional[str] = None,
) -> List[KonsultasiResult]:
    """
    Melakukan analisis menggunakan Forward Chaining.
    
    1. Cari semua aturan aktif yang terkait dengan makanan_id
    2. Untuk setiap aturan, cek apakah zat yang dipilih memenuhi antecedents
    3. Jika aturan terpenuhi, tandai sebagai BERBAHAYA
    4. Cek batas maksimum untuk setiap zat
    5. Simpan hasil konsultasi ke database
    """
    results = []
    makanan = db.query(Makanan).filter(Makanan.id == makanan_id).first()
    if not makanan:
        return results

    # Ambil semua aturan aktif untuk makanan ini
    rules = (
        db.query(Rule)
        .filter(Rule.makanan_id == makanan_id, Rule.is_active == True)
        .all()
    )

    # Ambil semua batas maksimum untuk makanan ini
    batas_list = (
        db.query(BatasMaksimum)
        .filter(BatasMaksimum.makanan_id == makanan_id)
        .all()
    )

    # Buat mapping batas per zat_id
    batas_map = {}
    for b in batas_list:
        batas_map[b.zat_id] = b

    # Untuk setiap zat yang dipilih user
    for zat_id in zat_ids:
        zat = db.query(Zat).filter(Zat.id == zat_id).first()
        if not zat:
            continue

        # Cek batas maksimum
        batas = batas_map.get(zat_id)
        batas_maks = None
        batas_satuan = None
        persentase = None
        hasil = "AMAN"
        rules_terpenuhi = []

        if batas:
            batas_maks = batas.nilai_maks
            batas_satuan = batas.satuan

            # Konversi ke mg untuk perbandingan
            kadar_mg = konversi_ke_mg(kadar, satuan)
            batas_mg = konversi_ke_mg(batas_maks, batas_satuan)

            if batas_mg > 0:
                persentase = round((kadar_mg / batas_mg) * 100, 2)

            # Cek Forward Chaining Rules
            for rule in rules:
                antecedents = rule.antecedents
                if not antecedents:
                    continue

                # Forward Chaining: IF (zat1 OR zat2) AND makanan THEN Berbahaya
                # Cek apakah zat_id ini ada di antecedents
                zat_ids_in_rule = [a.zat_id for a in antecedents]
                if zat_id in zat_ids_in_rule:
                    rules_terpenuhi.append(rule.kode)
                    hasil = "BERBAHAYA"

        # Simpan konsultasi ke database
        konsultasi = Konsultasi(
            makanan_id=makanan_id,
            zat_id=zat_id,
            kadar=kadar,
            satuan=satuan,
            batas_maks=batas_maks,
            hasil=hasil,
            persentase=persentase,
            ip_address=ip_address,
        )
        db.add(konsultasi)
        db.commit()
        db.refresh(konsultasi)

        result = KonsultasiResult(
            id=konsultasi.id,
            zat_id=zat_id,
            zat_nama=zat.nama,
            zat_kode=zat.kode,
            makanan_id=makanan_id,
            makanan_nama=makanan.nama,
            kadar=kadar,
            satuan=satuan,
            batas_maks=batas_maks,
            batas_satuan=batas_satuan,
            persentase=persentase,
            hasil=hasil,
            efek_kesehatan=zat.efek_kesehatan if hasil == "BERBAHAYA" else None,
            solusi=zat.solusi if hasil == "BERBAHAYA" else None,
            rules_terpenuhi=rules_terpenuhi,
        )
        results.append(result)

    return results


def test_rule(db: Session, rule_id: int, zat_ids: List[int]) -> dict:
    """
    Test apakah suatu aturan terpenuhi dengan zat_ids tertentu.
    Digunakan untuk simulasi sebelum menyimpan aturan.
    """
    rule = db.query(Rule).filter(Rule.id == rule_id).first()
    if not rule:
        return {"terpenuhi": False, "message": "Aturan tidak ditemukan"}

    antecedents = rule.antecedents
    zat_ids_in_rule = [a.zat_id for a in antecedents]

    # Forward Chaining: cek apakah ada zat yang cocok
    terpenuhi = any(zid in zat_ids_in_rule for zid in zat_ids)

    return {
        "terpenuhi": terpenuhi,
        "rule": rule.kode,
        "makanan_id": rule.makanan_id,
        "zat_dibutuhkan": zat_ids_in_rule,
        "zat_dipilih": zat_ids,
        "message": f"Aturan {rule.kode} {'TERPENUHI' if terpenuhi else 'TIDAK TERPENUHI'}",
    }
