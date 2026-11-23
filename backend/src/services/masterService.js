const masterModel = require('../models/masterModel');

const masterService = {
  async listTypes(includeInactive) {
    return masterModel.getAllTypes(includeInactive);
  },

  async createType(payload) {
    if (!payload.code || !payload.name) {
      const err = new Error('Both code and name are required for a master type');
      err.statusCode = 400;
      throw err;
    }
    return masterModel.createType(payload);
  },

  async updateType(id, payload) {
    const updated = await masterModel.updateType(id, payload);
    if (!updated) {
      const err = new Error('Master type not found or no fields provided');
      err.statusCode = 404;
      throw err;
    }
    return updated;
  },

  async getBundle(query) {
    const companyId = query.company_id && query.company_id !== 'all' ? query.company_id : null;
    const includeInactive = query.include_inactive === 'true' || query.include_inactive === '1';
    return masterModel.getBundle({ companyId, includeInactive });
  },

  async getOptionsByType(typeCode, query) {
    const companyId = query.company_id && query.company_id !== 'all' ? query.company_id : null;
    const includeInactive = query.include_inactive === 'true' || query.include_inactive === '1';
    return masterModel.getOptionsByType(typeCode, { companyId, includeInactive });
  },

  async createOption(payload, userId) {
    if (!payload.type_code || !payload.label) {
      const err = new Error('type_code and label are required');
      err.statusCode = 400;
      throw err;
    }
    return masterModel.createOption({ ...payload, created_by: userId });
  },

  async updateOption(id, payload) {
    const updated = await masterModel.updateOption(id, payload);
    if (!updated) {
      const err = new Error('Master option not found or no fields provided');
      err.statusCode = 404;
      throw err;
    }
    return updated;
  },

  async deleteOption(id) {
    const deleted = await masterModel.deleteOption(id);
    if (!deleted) {
      const err = new Error('Master option not found');
      err.statusCode = 404;
      throw err;
    }
    return { deleted: true, id: Number(id) };
  },

  async reorderOptions(items) {
    if (!Array.isArray(items)) {
      const err = new Error('items array is required');
      err.statusCode = 400;
      throw err;
    }
    await masterModel.reorderOptions(items);
    return { reordered: items.length };
  },
};

module.exports = masterService;
