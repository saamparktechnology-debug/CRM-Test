const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUser, toggleUserStatus, deleteUser, createUser } = require('../controllers/userController');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');
const { handleMultipartForm } = require('../middlewares/uploadMiddleware');
const { errorResponse } = require('../utils/apiResponse');

const userMultipart = handleMultipartForm({
  file: 'avatar_url',
  avatar: 'avatar_url',
  avatarUrl: 'avatar_url',
});

// GET all users (requires authentication)
router.get('/', authenticate, getAllUsers);

// CREATE user (Admin / Super Admin only)
router.post('/', authenticate, requireRole(1, 2), userMultipart, createUser);

// GET single user
router.get('/:id', authenticate, getUserById);

// UPDATE user (Admin / Super Admin, or Team Member updating their own profile / KYC)
router.put('/:id', authenticate, userMultipart, (req, res, next) => {
  const isSuperOrAdmin = req.user.role_id === 1 || req.user.role_id === 2;
  const targetId = String(req.params.id).toLowerCase().trim();
  const reqUserId = String(req.user.id).toLowerCase().trim();
  const reqUserEmail = String(req.user.email || '').toLowerCase().trim();
  const isSelf = reqUserId === targetId || (reqUserEmail && reqUserEmail === targetId);

  if (isSuperOrAdmin || isSelf) {
    return updateUser(req, res, next);
  }
  return errorResponse(res, 403, 'Access denied: Insufficient permissions');
});

// TOGGLE status (Admin / Super Admin)
router.patch('/:id/status', authenticate, requireRole(1, 2), toggleUserStatus);

// DELETE user (soft) (Admin / Super Admin)
router.delete('/:id', authenticate, requireRole(1, 2), deleteUser);

module.exports = router;