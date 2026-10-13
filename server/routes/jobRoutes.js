const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const authMiddleware = require('../middleware/authMiddleware');

// Public or student-accessible job listings
router.get('/', jobController.getJobListings);
router.get('/:id', jobController.getJobListingById);

// Protected: Add a job listing directly into logged-in user's applications
router.post('/:id/track', authMiddleware, jobController.addJobToTracker);

module.exports = router;
