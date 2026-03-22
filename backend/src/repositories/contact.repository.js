const { pool } = require('../database/db');

class ContactRepository {
  async createMessage({ name, email, message }) {
    const query = `
      INSERT INTO contact_messages (name, email, message)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [name, email, message];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async getAllMessages(limit = 50, offset = 0) {
    const query = `
      SELECT * FROM contact_messages
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2;
    `;
    const { rows } = await pool.query(query, [limit, offset]);
    
    const countQuery = `SELECT COUNT(*) FROM contact_messages;`;
    const { rows: countRows } = await pool.query(countQuery);
    
    return {
      messages: rows,
      total: parseInt(countRows[0].count, 10),
    };
  }

  async updateMessageStatus(id, status) {
    const query = `
      UPDATE contact_messages
      SET status = $1
      WHERE id = $2
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [status, id]);
    return rows[0];
  }
}

module.exports = new ContactRepository();
