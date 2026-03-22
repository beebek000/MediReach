/**
 * MediReach — Database Seed Script
 *
 * Creates a default admin user and populates the medicines catalogue
 * with 10 common Nepal pharmacy medicines.
 * Run with: npm run seed
 */

const bcrypt = require("bcrypt");
const { pool } = require("./db");
const medicines = require("./medicines-seed.json");

const SALT_ROUNDS = 12;

const seed = async () => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // ── 1. Default admin account ─────────────────────────────────────
    const adminPassword = await bcrypt.hash("Admin@1234", SALT_ROUNDS);

    await client.query(
      `INSERT INTO users (name, email, password, role, status)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING`,
      [
        "System Admin",
        "admin@gmail.com",
        adminPassword,
        "admin",
        "active",
      ],
    );

    // ── 1b. Default pharmacist account ───────────────────────────────
    const pharmacistPassword = await bcrypt.hash("Pharmacist@1234", SALT_ROUNDS);

    await client.query(
      `INSERT INTO users (name, email, password, role, status)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING`,
      [
        "Amit Sharma",
        "pharmacist@gmail.com",
        pharmacistPassword,
        "pharmacist",
        "active",
      ],
    );

    // ── 2. Medicines catalogue ───────────────────────────────────────
    const insertMedicine = `
      INSERT INTO medicines
        (name, generic_name, category, manufacturer,
         requires_prescription, price, stock, description,
         image_url, expiry_date, sold_count)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      ON CONFLICT (name) DO NOTHING`;

    for (const m of medicines) {
      await client.query(insertMedicine, [
        m.name,
        m.genericName,
        m.category,
        m.manufacturer,
        m.requiresPrescription,
        m.priceNPR,
        m.stock,
        m.description,
        m.imageUrl,
        m.expiryDate,
        m.soldCount,
      ]);
    }

    await client.query("COMMIT");
    console.log(
      `Seed completed — admin + pharmacist users + ${medicines.length} medicines inserted.`,
    );
    console.log("    Admin login:      admin@gmail.com / Admin@1234");
    console.log("    Pharmacist login: pharmacist@gmail.com / Pharmacist@1234");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seed failed:", err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

seed().catch(() => process.exit(1));
