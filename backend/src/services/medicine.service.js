/**
 * Medicine Service — business logic for the medicines catalogue.
 */

const medicineRepository = require('../repositories/medicine.repository');
const { NotFoundError, BadRequestError } = require('../utils/errors');

/** Transform a DB row (snake_case) → frontend-friendly object (camelCase). */
function formatMedicine(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    genericName: row.generic_name,
    category: row.category,
    manufacturer: row.manufacturer,
    requiresPrescription: row.requires_prescription,
    price: parseFloat(row.price),
    stock: row.stock,
    description: row.description,
    imageUrl: row.image_url,
    expiryDate: row.expiry_date,
    soldCount: row.sold_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const medicineService = {
  /**
   * List medicines with search / filter / sort / pagination.
   */
  async list({ search, category, sort, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const [medicines, total] = await Promise.all([
      medicineRepository.findAll({ search, category, sort, limit, offset }),
      medicineRepository.count({ search, category }),
    ]);
    return {
      medicines: medicines.map(formatMedicine),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get a single medicine by ID.
   */
  async getById(id) {
    const medicine = await medicineRepository.findById(id);
    if (!medicine) throw new NotFoundError('Medicine not found');
    return formatMedicine(medicine);
  },

  /**
   * Create a new medicine (admin / pharmacist).
   */
  async create(data) {
    if (!data.name || !data.genericName || !data.category || !data.manufacturer || data.price == null) {
      throw new BadRequestError('name, genericName, category, manufacturer, and price are required');
    }
    return formatMedicine(await medicineRepository.create(data));
  },

  /**
   * Update an existing medicine (admin / pharmacist).
   */
  async update(id, data) {
    const existing = await medicineRepository.findById(id);
    if (!existing) throw new NotFoundError('Medicine not found');
    return formatMedicine(await medicineRepository.update(id, data));
  },

  /**
   * Delete a medicine (admin only).
   */
  async remove(id) {
    const deleted = await medicineRepository.remove(id);
    if (!deleted) throw new NotFoundError('Medicine not found');
    return deleted;
  },
};

module.exports = medicineService;
