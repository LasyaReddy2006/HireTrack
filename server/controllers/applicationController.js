const { pool } = require('../config/db');

/**
 * Create a new job application
 * Method: POST /api/applications
 * Protected: Yes (req.user.id from JWT)
 */
async function createApplication(req, res) {
  try {
    const userId = req.user.id;
    const {
      company_name,
      job_title,
      location,
      job_type = 'Full-time',
      status = 'Applied',
      application_date,
      job_url = null,
      salary = null,
      notes = null
    } = req.body;

    // 1. Validation
    if (!company_name || !job_title || !location || !application_date) {
      return res.status(400).json({
        success: false,
        message: 'Company name, job title, location, and application date are required.'
      });
    }

    // Validate enum values
    const validJobTypes = ['Full-time', 'Part-time', 'Internship'];
    const validStatuses = ['Applied', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];

    if (!validJobTypes.includes(job_type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid job_type. Allowed: ${validJobTypes.join(', ')}`
      });
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${validStatuses.join(', ')}`
      });
    }

    // 2. Parameterized INSERT Query
    // Important: user_id is taken from authenticated token, ensuring ownership
    const insertSql = `
      INSERT INTO Applications 
        (user_id, company_name, job_title, location, job_type, status, application_date, job_url, salary, notes)
      VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      userId,
      company_name.trim(),
      job_title.trim(),
      location.trim(),
      job_type,
      status,
      application_date,
      job_url ? job_url.trim() : null,
      salary ? salary.trim() : null,
      notes ? notes.trim() : null
    ];

    const [result] = await pool.query(insertSql, values);

    return res.status(201).json({
      success: true,
      message: 'Job application created successfully!',
      applicationId: result.insertId
    });
  } catch (error) {
    console.error('Create application error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create application.',
      error: error.message
    });
  }
}

/**
 * Get all applications for the logged-in user
 * Supports: Search by company/title, Filter by status/job_type, Sorting, Pagination
 * Method: GET /api/applications
 * Protected: Yes
 */
async function getApplications(req, res) {
  try {
    const userId = req.user.id;
    const {
      search = '',
      status = 'All',
      job_type = 'All',
      sortBy = 'date_desc',
      page = 1,
      limit = 10
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const offset = (pageNum - 1) * limitNum;

    // 1. Build dynamic WHERE clause safely using parameters
    // Always start with user_id to enforce user isolation
    let whereClauses = ['user_id = ?'];
    let queryParams = [userId];

    // Search filter (company name or job title)
    if (search.trim()) {
      whereClauses.push('(company_name LIKE ? OR job_title LIKE ?)');
      const searchTerm = `%${search.trim()}%`;
      queryParams.push(searchTerm, searchTerm);
    }

    // Status filter
    if (status && status !== 'All') {
      whereClauses.push('status = ?');
      queryParams.push(status);
    }

    // Job type filter
    if (job_type && job_type !== 'All') {
      whereClauses.push('job_type = ?');
      queryParams.push(job_type);
    }

    const whereSql = whereClauses.join(' AND ');

    // 2. Count total matching rows for pagination
    const countSql = `SELECT COUNT(*) AS total FROM Applications WHERE ${whereSql}`;
    const [countResult] = await pool.query(countSql, queryParams);
    const totalCount = countResult[0].total;

    // 3. Determine ORDER BY clause using a safe whitelist
    let orderBySql = 'application_date DESC, id DESC';
    if (sortBy === 'date_asc') orderBySql = 'application_date ASC, id ASC';
    else if (sortBy === 'company_asc') orderBySql = 'company_name ASC';
    else if (sortBy === 'company_desc') orderBySql = 'company_name DESC';
    else if (sortBy === 'status_asc') orderBySql = 'status ASC';

    // 4. Fetch the paginated rows
    // Using LIMIT ? OFFSET ?
    const selectSql = `
      SELECT id, user_id, company_name, job_title, location, job_type, status,
             DATE_FORMAT(application_date, '%Y-%m-%d') AS application_date,
             job_url, salary, notes, created_at, updated_at
      FROM Applications
      WHERE ${whereSql}
      ORDER BY ${orderBySql}
      LIMIT ? OFFSET ?
    `;

    // Note: limit and offset must be numbers passed to query
    const [applications] = await pool.query(selectSql, [...queryParams, limitNum, offset]);

    return res.status(200).json({
      success: true,
      applications,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum) || 1
      }
    });
  } catch (error) {
    console.error('Get applications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch applications.',
      error: error.message
    });
  }
}

/**
 * Get a single application by ID
 * Method: GET /api/applications/:id
 * Protected: Yes (Strict check: WHERE id = ? AND user_id = ?)
 */
async function getApplicationById(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Enforce ownership: query requires both application id AND user_id
    const querySql = `
      SELECT id, user_id, company_name, job_title, location, job_type, status,
             DATE_FORMAT(application_date, '%Y-%m-%d') AS application_date,
             job_url, salary, notes, created_at, updated_at
      FROM Applications
      WHERE id = ? AND user_id = ?
    `;

    const [rows] = await pool.query(querySql, [id, userId]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or you do not have permission to view it.'
      });
    }

    return res.status(200).json({
      success: true,
      application: rows[0]
    });
  } catch (error) {
    console.error('Get application by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch application details.',
      error: error.message
    });
  }
}

/**
 * Update an existing application
 * Method: PUT /api/applications/:id
 * Protected: Yes (Checks user ownership)
 */
async function updateApplication(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const {
      company_name,
      job_title,
      location,
      job_type,
      status,
      application_date,
      job_url,
      salary,
      notes
    } = req.body;

    // 1. Validation
    if (!company_name || !job_title || !location || !application_date) {
      return res.status(400).json({
        success: false,
        message: 'Company name, job title, location, and application date are required.'
      });
    }

    // 2. Parameterized UPDATE Query with strict user_id check
    const updateSql = `
      UPDATE Applications
      SET 
        company_name = ?,
        job_title = ?,
        location = ?,
        job_type = ?,
        status = ?,
        application_date = ?,
        job_url = ?,
        salary = ?,
        notes = ?
      WHERE id = ? AND user_id = ?
    `;

    const values = [
      company_name.trim(),
      job_title.trim(),
      location.trim(),
      job_type,
      status,
      application_date,
      job_url ? job_url.trim() : null,
      salary ? salary.trim() : null,
      notes ? notes.trim() : null,
      id,
      userId
    ];

    const [result] = await pool.query(updateSql, values);

    // If affectedRows is 0, either record doesn't exist or it doesn't belong to this user
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or you do not have permission to modify it.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Application updated successfully!'
    });
  } catch (error) {
    console.error('Update application error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update application.',
      error: error.message
    });
  }
}

/**
 * Delete an application
 * Method: DELETE /api/applications/:id
 * Protected: Yes (Checks user ownership)
 */
async function deleteApplication(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Parameterized DELETE query with user ownership enforcement
    const deleteSql = 'DELETE FROM Applications WHERE id = ? AND user_id = ?';
    const [result] = await pool.query(deleteSql, [id, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or you do not have permission to delete it.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Application deleted successfully!'
    });
  } catch (error) {
    console.error('Delete application error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete application.',
      error: error.message
    });
  }
}

/**
 * Get dashboard statistics for the logged-in user
 * Calculates: Total, Applied (awaiting response), Interview, Offer, Rejected, Withdrawn,
 * and retrieves the 5 most recent applications.
 * Method: GET /api/applications/dashboard/stats
 * Protected: Yes
 */
async function getDashboardStats(req, res) {
  try {
    const userId = req.user.id;

    // 1. Total applications count
    const [totalRows] = await pool.query(
      'SELECT COUNT(*) AS total FROM Applications WHERE user_id = ?',
      [userId]
    );
    const total = totalRows[0].total || 0;

    // 2. Group by status query (demonstrating SQL GROUP BY and COUNT)
    const [statusRows] = await pool.query(
      `SELECT status, COUNT(*) AS count
       FROM Applications
       WHERE user_id = ?
       GROUP BY status`,
      [userId]
    );

    // Format counts into a simple object
    const statusCounts = {
      Applied: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
      Withdrawn: 0
    };

    statusRows.forEach(row => {
      if (statusCounts[row.status] !== undefined) {
        statusCounts[row.status] = row.count;
      }
    });

    // 3. Job type breakdown (demonstrating another GROUP BY query)
    const [jobTypeRows] = await pool.query(
      `SELECT job_type, COUNT(*) AS count
       FROM Applications
       WHERE user_id = ?
       GROUP BY job_type`,
      [userId]
    );

    // 4. Five most recent applications (demonstrating ORDER BY and LIMIT)
    const [recentApplications] = await pool.query(
      `SELECT id, company_name, job_title, location, job_type, status,
              DATE_FORMAT(application_date, '%Y-%m-%d') AS application_date,
              salary
       FROM Applications
       WHERE user_id = ?
       ORDER BY application_date DESC, id DESC
       LIMIT 5`,
      [userId]
    );

    // 5. User summary using JOIN (demonstrating SQL JOIN concept for interview prep)
    const [userStats] = await pool.query(
      `SELECT u.name, u.email, COUNT(a.id) AS total_recorded
       FROM Users u
       LEFT JOIN Applications a ON u.id = a.user_id
       WHERE u.id = ?
       GROUP BY u.id, u.name, u.email`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      stats: {
        total,
        awaitingResponse: statusCounts.Applied,
        interviews: statusCounts.Interview,
        offers: statusCounts.Offer,
        rejected: statusCounts.Rejected,
        withdrawn: statusCounts.Withdrawn,
        statusCounts,
        jobTypeBreakdown: jobTypeRows,
        recentApplications,
        userSummary: userStats[0] || null
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate dashboard statistics.',
      error: error.message
    });
  }
}

module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  getDashboardStats
};
