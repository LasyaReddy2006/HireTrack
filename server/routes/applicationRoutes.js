const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const authMiddleware = require('../middleware/authMiddleware');

// All application routes are strictly protected by authentication
router.use(authMiddleware);

// Dashboard statistics (placed before :id route)
router.get('/dashboard/stats', applicationController.getDashboardStats);

// Application CRUD & Search/Filter
router.post('/', applicationController.createApplication);
router.get('/', applicationController.getApplications);
router.get('/:id', applicationController.getApplicationById);
router.put('/:id', applicationController.updateApplication);
router.delete('/:id', applicationController.deleteApplication);

module.exports = router;
