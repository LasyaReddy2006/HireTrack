const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

/**
 * Get user profile with application summary statistics
 * Method: GET /api/profile
 * Protected: Yes
 */
async function getProfile(req, res) {
  try {
    const userId = req.user.id;

    // 1. Fetch user data
    const [users] = await pool.query(
      'SELECT id, name, email, created_at FROM Users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    const user = users[0];

    // 2. Fetch user's application count metrics using SQL COUNT
    const [counts] = await pool.query(
      `SELECT 
         COUNT(*) AS total_applications,
         SUM(CASE WHEN status = 'Interview' THEN 1 ELSE 0 END) AS total_interviews,
         SUM(CASE WHEN status = 'Offer' THEN 1 ELSE 0 END) AS total_offers,
         SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) AS total_rejected
       FROM Applications 
       WHERE user_id = ?`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      profile: {
        ...user,
        stats: {
          totalApplications: counts[0].total_applications || 0,
          totalInterviews: Number(counts[0].total_interviews) || 0,
          totalOffers: Number(counts[0].total_offers) || 0,
          totalRejected: Number(counts[0].total_rejected) || 0
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile.',
      error: error.message
    });
  }
}

/**
 * Update user profile (Name and/or Password)
 * Method: PUT /api/profile
 * Protected: Yes
 */
async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, currentPassword, newPassword } = req.body;

    // 1. Validate name
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name cannot be empty.'
      });
    }

    // 2. If changing password, verify current password first
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to set a new password.'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long.'
        });
      }

      // Fetch existing password hash from DB
      const [users] = await pool.query('SELECT password FROM Users WHERE id = ?', [userId]);
      if (users.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, users[0].password);
      if (!isCurrentPasswordCorrect) {
        return res.status(400).json({
          success: false,
          message: 'Incorrect current password.'
        });
      }

      // Hash the new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update both name and password
      await pool.query(
        'UPDATE Users SET name = ?, password = ? WHERE id = ?',
        [name.trim(), hashedNewPassword, userId]
      );
    } else {
      // Update name only
      await pool.query(
        'UPDATE Users SET name = ? WHERE id = ?',
        [name.trim(), userId]
      );
    }

    // Fetch updated record to return
    const [updatedUsers] = await pool.query(
      'SELECT id, name, email, created_at FROM Users WHERE id = ?',
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUsers[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile.',
      error: error.message
    });
  }
}

module.exports = {
  getProfile,
  updateProfile
};
