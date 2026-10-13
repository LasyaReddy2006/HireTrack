const { pool } = require('../config/db');

/**
 * Get curated job listings
 * Supports search (company, title, skills) and filters (job_type, location)
 * Method: GET /api/jobs
 * Protected: No (or Yes, depending on route; accessible to students)
 */
async function getJobListings(req, res) {
  try {
    const { search = '', job_type = 'All', location = 'All' } = req.query;

    let whereClauses = [];
    let queryParams = [];

    // Search filter across company, title, and required skills
    if (search.trim()) {
      whereClauses.push('(company_name LIKE ? OR job_title LIKE ? OR required_skills LIKE ?)');
      const term = `%${search.trim()}%`;
      queryParams.push(term, term, term);
    }

    // Job type filter
    if (job_type && job_type !== 'All') {
      whereClauses.push('job_type = ?');
      queryParams.push(job_type);
    }

    // Location filter
    if (location && location !== 'All') {
      whereClauses.push('location LIKE ?');
      queryParams.push(`%${location}%`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const selectSql = `
      SELECT id, company_name, job_title, location, job_type, required_skills, application_url, created_at
      FROM JobListings
      ${whereSql}
      ORDER BY id ASC
    `;

    const [listings] = await pool.query(selectSql, queryParams);

    return res.status(200).json({
      success: true,
      listings
    });
  } catch (error) {
    console.error('Get job listings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch job listings.',
      error: error.message
    });
  }
}

/**
 * Get single job listing by ID
 * Method: GET /api/jobs/:id
 */
async function getJobListingById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM JobListings WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job listing not found.'
      });
    }

    return res.status(200).json({
      success: true,
      listing: rows[0]
    });
  } catch (error) {
    console.error('Get job listing by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch job listing details.',
      error: error.message
    });
  }
}

/**
 * Directly add a curated job listing into user's own application tracker
 * Method: POST /api/jobs/:id/track
 * Protected: Yes (requires auth)
 */
async function addJobToTracker(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // 1. Fetch the listing
    const [rows] = await pool.query('SELECT * FROM JobListings WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job listing not found.'
      });
    }

    const listing = rows[0];

    // 2. Check if already tracked by this user
    const [alreadyTracked] = await pool.query(
      'SELECT id FROM Applications WHERE user_id = ? AND company_name = ? AND job_title = ?',
      [userId, listing.company_name, listing.job_title]
    );

    if (alreadyTracked.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You are already tracking this position in your applications.'
      });
    }

    // 3. Insert into Applications table with status 'Applied' and today's date
    const today = new Date().toISOString().split('T')[0];
    const insertSql = `
      INSERT INTO Applications 
        (user_id, company_name, job_title, location, job_type, status, application_date, job_url, notes)
      VALUES 
        (?, ?, ?, ?, ?, 'Applied', ?, ?, ?)
    `;

    const notes = `Imported from HireTrack Job Listings. Required Skills: ${listing.required_skills}`;

    const [insertResult] = await pool.query(insertSql, [
      userId,
      listing.company_name,
      listing.job_title,
      listing.location,
      listing.job_type,
      today,
      listing.application_url,
      notes
    ]);

    return res.status(201).json({
      success: true,
      message: `Added ${listing.company_name} - ${listing.job_title} to your application tracker!`,
      applicationId: insertResult.insertId
    });
  } catch (error) {
    console.error('Add job to tracker error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add job to tracker.',
      error: error.message
    });
  }
}

module.exports = {
  getJobListings,
  getJobListingById,
  addJobToTracker
};
