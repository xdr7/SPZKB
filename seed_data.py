"""
Seed data script for Sistem Pakar Penggunaan Zat Kimia pada Makanan.
Run this script to populate the database with initial knowledge base data.
Data berdasarkan PerBPOM No. 11 Tahun 2019 tentang Bahan Tambahan Pangan.
"""
from backend.app.database import SessionLocal, engine, Base
from backend.app.models import User, Zat, Makanan, Rule, RuleAntecedent, BatasMaksimum, LogAktivitas
from backend.app.utils.security import hash_password


def seed_database():
    """Seed the database with initial data."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # ============ Create Admin User ============
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            admin = User(
                username="admin",
                password_hash=hash_password("admin123"),
                role="superadmin",
            )
            db.add(admin)
            db.flush()
            print("[OK] Admin user created (admin / admin123)")

        # ============ Zat Kimia (Chemicals) ============
        # Data berdasarkan PerBPOM No. 11 Tahun 2019
        zat_data = [
            {
                "kode": "Z001",
                "nama": "Kalsium Benzoat",
                "efek_kesehatan": (
                    "Kalsium Benzoat (Calcium Benzoate) adalah pengawet makanan yang diizinkan "
                    "dalam batas tertentu. Namun, konsumsi berlebihan dapat menyebabkan efek "
                    "kesehatan negatif seperti: reaksi alergi (urtikaria, asma), gangguan "
                    "saluran pencernaan, hiperaktivitas pada anak-anak, dan dapat membentuk "
                    "benzena (karsinogen) jika bereaksi dengan vitamin C. Penggunaan harus "
                    "sesuai dengan batas maksimum yang ditetapkan PerBPOM No. 11/2019."
                ),
                "solusi": (
                    "Jika terdeteksi mengandung Kalsium Benzoat melebihi batas: Hentikan "
                    "konsumsi produk tersebut. Perbanyak minum air putih. Konsumsi makanan "
                    "segar dan alami. Jika muncul reaksi alergi, segera konsultasi ke dokter. "
                    "Laporkan produk ke BPOM untuk pengujian lebih lanjut."
                ),
            },
            {
                "kode": "Z002",
                "nama": "Kalium Nitrit",
                "efek_kesehatan": (
                    "Kalium Nitrit (Potassium Nitrite) adalah pengawet yang digunakan pada "
                    "daging olahan untuk mengikat warna dan menghambat bakteri Clostridium "
                    "botulinum. Konsumsi berlebihan dapat menyebabkan: methemoglobinemia "
                    "(gangguan pengangkutan oksigen dalam darah), sakit kepala, pusing, "
                    "gangguan pernapasan, dan dapat membentuk nitrosamin yang bersifat "
                    "karsinogenik jika bereaksi dengan protein pada suhu tinggi."
                ),
                "solusi": (
                    "Jika terdeteksi mengandung Kalium Nitrit melebihi batas: Hentikan "
                    "konsumsi produk daging olahan tersebut. Perbanyak konsumsi vitamin C "
                    "yang dapat menghambat pembentukan nitrosamin. Minum air putih yang "
                    "cukup. Jika mengalami gejala seperti sesak napas atau pusing berat, "
                    "segera ke fasilitas kesehatan. Laporkan ke BPOM."
                ),
            },
            {
                "kode": "Z003",
                "nama": "Kalsium Propionat",
                "efek_kesehatan": (
                    "Kalsium Propionat (Calcium Propionate) adalah pengawet antikapang yang "
                    "umum digunakan pada produk roti dan bakery. Meskipun relatif aman, "
                    "konsumsi berlebihan dapat menyebabkan: sakit kepala migrain, gangguan "
                    "tidur, iritasi saluran pencernaan, dan reaksi alergi pada individu "
                    "sensitif. Pada beberapa studi, propionat dapat mempengaruhi metabolisme "
                    "glukosa dan meningkatkan risiko obesitas."
                ),
                "solusi": (
                    "Jika terdeteksi mengandung Kalsium Propionat melebihi batas: Kurangi "
                    "konsumsi produk bakery olahan. Pilih roti dan kue dari sumber terpercaya. "
                    "Perbanyak konsumsi makanan segar. Jika mengalami sakit kepala atau "
                    "gangguan pencernaan, konsultasi ke dokter. Laporkan ke BPOM."
                ),
            },
            {
                "kode": "Z004",
                "nama": "Natrium Metasulfat",
                "efek_kesehatan": (
                    "Natrium Metasulfat (Sodium Metabisulfite) adalah pengawet, antioksidan, "
                    "dan pemutih yang digunakan dalam makanan. Konsumsi berlebihan dapat "
                    "menyebabkan: reaksi alergi berat pada penderita asma (bronkospasme), "
                    "sakit kepala, mual, muntah, diare, iritasi saluran pencernaan, dan "
                    "defisiensi tiamin (vitamin B1) karena sulfit dapat memecah vitamin B1. "
                    "Batas maksimum dihitung sebagai residu SO2."
                ),
                "solusi": (
                    "Jika terdeteksi mengandung Natrium Metasulfat melebihi batas: Hentikan "
                    "konsumsi produk tersebut. Bagi penderita asma, waspada terhadap reaksi "
                    "alergi. Perbanyak konsumsi makanan kaya vitamin B1 (tiamin). Jika "
                    "mengalami sesak napas atau reaksi alergi, segera ke fasilitas kesehatan. "
                    "Laporkan ke BPOM."
                ),
            },
        ]

        zat_map = {}
        for z in zat_data:
            existing = db.query(Zat).filter(Zat.kode == z["kode"]).first()
            if not existing:
                zat = Zat(**z)
                db.add(zat)
                db.flush()
                zat_map[z["kode"]] = zat
                print(f"[OK] Zat created: {z['kode']} - {z['nama']}")
            else:
                # Update existing zat with new data
                for key, value in z.items():
                    setattr(existing, key, value)
                zat_map[z["kode"]] = existing
                print(f"  Zat updated: {z['kode']} - {z['nama']}")

        # ============ Makanan (Foods) ============
        # Makanan yang relevan dengan zat kimia berdasarkan PerBPOM No. 11/2019
        makanan_data = [
            {
                "kode": "M001",
                "nama": "Saus Tomat",
                "deskripsi": "Saus tomat adalah produk olahan tomat yang sering ditambahkan "
                             "pengawet seperti Kalsium Benzoat untuk memperpanjang masa simpan. "
                             "Batas maksimum Kalsium Benzoat pada saus tomat adalah 1000 mg/kg "
                             "sesuai PerBPOM No. 11/2019 kategori 12.4.",
            },
            {
                "kode": "M002",
                "nama": "Minuman Ringan Berkarbonasi",
                "deskripsi": "Minuman ringan berkarbonasi sering mengandung pengawet Kalsium "
                             "Benzoat dan Natrium Metasulfat. Batas maksimum Kalsium Benzoat "
                             "600 mg/kg dan Natrium Metasulfat 70 mg/kg sesuai PerBPOM No. 11/2019.",
            },
            {
                "kode": "M003",
                "nama": "Selai dan Jeli",
                "deskripsi": "Selai dan jeli adalah produk olahan buah yang memerlukan pengawet "
                             "untuk memperpanjang masa simpan. Kalsium Benzoat digunakan sebagai "
                             "pengawet dengan batas maksimum 1000 mg/kg sesuai PerBPOM No. 11/2019.",
            },
            {
                "kode": "M004",
                "nama": "Aneka Olahan Ikan",
                "deskripsi": "Produk perikanan olahan seperti ikan asin, udang beku, dan olahan "
                             "ikan lainnya sering menggunakan Natrium Metasulfat sebagai pengawet "
                             "dan pemutih. Batas maksimum bervariasi sesuai jenis olahan.",
            },
            {
                "kode": "M005",
                "nama": "Jajanan Anak (Ciki/Makaron)",
                "deskripsi": "Jajanan anak seperti ciki dan makaron termasuk kategori camilan "
                             "siap saji yang dapat mengandung berbagai bahan tambahan pangan "
                             "termasuk pengawet. Perlu pengawasan ketat terhadap penggunaannya.",
            },
            {
                "kode": "M006",
                "nama": "Tahu",
                "deskripsi": "Tahu adalah produk kedelai olahan yang memerlukan pengawet untuk "
                             "memperpanjang masa simpan. Kalsium Benzoat dan Natrium Metasulfat "
                             "dapat digunakan dengan batas maksimum sesuai PerBPOM No. 11/2019.",
            },
            {
                "kode": "M007",
                "nama": "Mie Basah",
                "deskripsi": "Mie basah adalah mie yang belum dikeringkan dengan kadar air tinggi. "
                             "Pengawet seperti Kalsium Benzoat dan Kalsium Propionat digunakan "
                             "untuk mencegah pertumbuhan kapang dan memperpanjang masa simpan.",
            },
        ]

        makanan_map = {}
        for m in makanan_data:
            existing = db.query(Makanan).filter(Makanan.kode == m["kode"]).first()
            if not existing:
                makanan = Makanan(**m)
                db.add(makanan)
                db.flush()
                makanan_map[m["kode"]] = makanan
                print(f"[OK] Makanan created: {m['kode']} - {m['nama']}")
            else:
                # Update existing makanan with new data
                for key, value in m.items():
                    setattr(existing, key, value)
                makanan_map[m["kode"]] = existing
                print(f"  Makanan updated: {m['kode']} - {m['nama']}")

        # ============ Rules (Forward Chaining) ============
        # Aturan berdasarkan data validasi PerBPOM No. 11/2019
        rules_data = [
            {
                "kode": "R1",
                "makanan_kode": "M001",  # Saus Tomat
                "kesimpulan": "Berbahaya",
                "antecedents": [
                    {"zat_kode": "Z001", "operator": "OR"},  # Kalsium Benzoat
                ],
            },
            {
                "kode": "R2",
                "makanan_kode": "M002",  # Minuman Ringan Berkarbonasi
                "kesimpulan": "Berbahaya",
                "antecedents": [
                    {"zat_kode": "Z001", "operator": "OR"},  # Kalsium Benzoat
                    {"zat_kode": "Z004", "operator": "OR"},  # Natrium Metasulfat
                ],
            },
            {
                "kode": "R3",
                "makanan_kode": "M003",  # Selai dan Jeli
                "kesimpulan": "Berbahaya",
                "antecedents": [
                    {"zat_kode": "Z001", "operator": "OR"},  # Kalsium Benzoat
                ],
            },
            {
                "kode": "R4",
                "makanan_kode": "M004",  # Aneka Olahan Ikan
                "kesimpulan": "Berbahaya",
                "antecedents": [
                    {"zat_kode": "Z004", "operator": "OR"},  # Natrium Metasulfat
                ],
            },
            {
                "kode": "R5",
                "makanan_kode": "M005",  # Jajanan Anak
                "kesimpulan": "Berbahaya",
                "antecedents": [
                    {"zat_kode": "Z001", "operator": "OR"},  # Kalsium Benzoat
                    {"zat_kode": "Z002", "operator": "OR"},  # Kalium Nitrit
                    {"zat_kode": "Z003", "operator": "OR"},  # Kalsium Propionat
                    {"zat_kode": "Z004", "operator": "OR"},  # Natrium Metasulfat
                ],
            },
            {
                "kode": "R6",
                "makanan_kode": "M006",  # Tahu
                "kesimpulan": "Berbahaya",
                "antecedents": [
                    {"zat_kode": "Z001", "operator": "OR"},  # Kalsium Benzoat
                    {"zat_kode": "Z004", "operator": "OR"},  # Natrium Metasulfat
                ],
            },
            {
                "kode": "R7",
                "makanan_kode": "M007",  # Mie Basah
                "kesimpulan": "Berbahaya",
                "antecedents": [
                    {"zat_kode": "Z001", "operator": "OR"},  # Kalsium Benzoat
                    {"zat_kode": "Z003", "operator": "OR"},  # Kalsium Propionat
                ],
            },
        ]

        # Delete existing rules and antecedents first to avoid conflicts
        existing_rules = db.query(Rule).all()
        for rule in existing_rules:
            db.query(RuleAntecedent).filter(RuleAntecedent.rule_id == rule.id).delete()
            db.delete(rule)
        db.flush()

        for r in rules_data:
            rule = Rule(
                kode=r["kode"],
                makanan_id=makanan_map[r["makanan_kode"]].id,
                kesimpulan=r["kesimpulan"],
            )
            db.add(rule)
            db.flush()

            for ant in r["antecedents"]:
                antecedent = RuleAntecedent(
                    rule_id=rule.id,
                    zat_id=zat_map[ant["zat_kode"]].id,
                    operator=ant["operator"],
                )
                db.add(antecedent)

            print(f"[OK] Rule created: {r['kode']}")

        # ============ Batas Maksimum (Max Limits) ============
        # Data berdasarkan validasi_bpom.json (PerBPOM No. 11/2019)
        batas_data = [
            # Kalsium Benzoat (Z001)
            {"zat_kode": "Z001", "makanan_kode": "M001", "nilai_maks": 1000, "satuan": "mg/kg"},  # Saus Tomat
            {"zat_kode": "Z001", "makanan_kode": "M002", "nilai_maks": 600, "satuan": "mg/kg"},   # Minuman Ringan Berkarbonasi
            {"zat_kode": "Z001", "makanan_kode": "M003", "nilai_maks": 1000, "satuan": "mg/kg"},  # Selai dan Jeli
            {"zat_kode": "Z001", "makanan_kode": "M004", "nilai_maks": 1000, "satuan": "mg/kg"},  # Aneka Olahan Ikan
            {"zat_kode": "Z001", "makanan_kode": "M005", "nilai_maks": 1000, "satuan": "mg/kg"},  # Jajanan Anak
            {"zat_kode": "Z001", "makanan_kode": "M006", "nilai_maks": 1000, "satuan": "mg/kg"},  # Tahu
            {"zat_kode": "Z001", "makanan_kode": "M007", "nilai_maks": 1000, "satuan": "mg/kg"},  # Mie Basah
            # Kalium Nitrit (Z002)
            {"zat_kode": "Z002", "makanan_kode": "M005", "nilai_maks": 150, "satuan": "mg/kg"},   # Jajanan Anak
            # Kalsium Propionat (Z003)
            {"zat_kode": "Z003", "makanan_kode": "M005", "nilai_maks": 2000, "satuan": "mg/kg"},  # Jajanan Anak
            {"zat_kode": "Z003", "makanan_kode": "M007", "nilai_maks": 2000, "satuan": "mg/kg"},  # Mie Basah
            # Natrium Metasulfat (Z004)
            {"zat_kode": "Z004", "makanan_kode": "M002", "nilai_maks": 70, "satuan": "mg/kg"},    # Minuman Ringan Berkarbonasi
            {"zat_kode": "Z004", "makanan_kode": "M004", "nilai_maks": 100, "satuan": "mg/kg"},   # Aneka Olahan Ikan
            {"zat_kode": "Z004", "makanan_kode": "M005", "nilai_maks": 50, "satuan": "mg/kg"},    # Jajanan Anak
            {"zat_kode": "Z004", "makanan_kode": "M006", "nilai_maks": 100, "satuan": "mg/kg"},   # Tahu
        ]

        # Delete existing batas_maksimum first
        db.query(BatasMaksimum).delete()
        db.flush()

        for b in batas_data:
            zat_id = zat_map[b["zat_kode"]].id
            makanan_id = makanan_map[b["makanan_kode"]].id
            batas = BatasMaksimum(
                zat_id=zat_id,
                makanan_id=makanan_id,
                nilai_maks=b["nilai_maks"],
                satuan=b["satuan"],
                changed_by=admin.id if admin else None,
            )
            db.add(batas)
            print(f"[OK] Batas created: {b['zat_kode']} - {b['makanan_kode']} = {b['nilai_maks']} {b['satuan']}")

        # Log seed activity
        log = LogAktivitas(
            user_id=admin.id if admin else None,
            aksi="SEED_DATA",
            detail="Database seeded with validated knowledge base data (PerBPOM No. 11/2019)",
        )
        db.add(log)

        db.commit()
        print("\n[OK] Database seeding completed successfully!")
        print(f"   - {len(zat_data)} chemicals (Zat Kimia)")
        print(f"   - {len(makanan_data)} foods (Makanan)")
        print(f"   - {len(rules_data)} rules (Aturan)")
        print(f"   - {len(batas_data)} max limits (Batas Maksimum)")

    except Exception as e:
        db.rollback()
        print(f"\n[ERROR] Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 50)
    print("Seeding Database - SPZKB")
    print("=" * 50)
    seed_database()
