const { successResponse, errorResponse } = require('../utils/apiResponse');
const masterService = require('../services/masterService');

const masterController = {
  async getTypes(req, res) {
    try {
      const includeInactive = req.query.include_inactive === 'true' || req.query.include_inactive === '1';
      const types = await masterService.listTypes(includeInactive);
      return successResponse(res, 200, 'Master types retrieved', types);
    } catch (err) {
      return errorResponse(res, err.statusCode || 500, err.message);
    }
  },

  async createType(req, res) {
    try {
      const created = await masterService.createType(req.body);
      return successResponse(res, 201, 'Master type created', created);
    } catch (err) {
      return errorResponse(res, err.statusCode || 500, err.message);
    }
  },

  async updateType(req, res) {
    try {
      const updated = await masterService.updateType(req.params.id, req.body);
      return successResponse(res, 200, 'Master type updated', updated);
    } catch (err) {
      return errorResponse(res, err.statusCode || 500, err.message);
    }
  },

  async getBundle(req, res) {
    try {
      const bundle = await masterService.getBundle(req.query);
      return successResponse(res, 200, 'Master bundle retrieved', bundle);
    } catch (err) {
      return errorResponse(res, err.statusCode || 500, err.message);
    }
  },

  async getOptionsByType(req, res) {
    try {
      const options = await masterService.getOptionsByType(req.params.typeCode, req.query);
      return successResponse(res, 200, 'Master options retrieved', options);
    } catch (err) {
      return errorResponse(res, err.statusCode || 500, err.message);
    }
  },

  async createOption(req, res) {
    try {
      const created = await masterService.createOption(req.body, req.user?.id || null);
      return successResponse(res, 201, 'Master option created', created);
    } catch (err) {
      return errorResponse(res, err.statusCode || 500, err.message);
    }
  },

  async updateOption(req, res) {
    try {
      const updated = await masterService.updateOption(req.params.id, req.body);
      return successResponse(res, 200, 'Master option updated', updated);
    } catch (err) {
      return errorResponse(res, err.statusCode || 500, err.message);
    }
  },

  async deleteOption(req, res) {
    try {
      const result = await masterService.deleteOption(req.params.id);
      return successResponse(res, 200, 'Master option deleted', result);
    } catch (err) {
      return errorResponse(res, err.statusCode || 500, err.message);
    }
  },

  async reorderOptions(req, res) {
    try {
      const result = await masterService.reorderOptions(req.body.items);
      return successResponse(res, 200, 'Master options reordered', result);
    } catch (err) {
      return errorResponse(res, err.statusCode || 500, err.message);
    }
  },
};

module.exports = masterController;
