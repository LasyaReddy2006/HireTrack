const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

/**
 * Helper to generate JWT token
 */
function generateToken(user) {
  const secret = process.env.JWT_SECRET || 'super_secret_hiretrack_key_replace_in_production';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email
    },
    secret,
    { expiresIn }
  );
}

/**
 * Register a new user
 * Method: POST /api/auth/register
 */
async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    // 1. Validation: ensure all required fields are present
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    // 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    // 3. Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // 4. Check if the user already exists using parameterized query
    // SQL: SELECT id FROM Users WHERE email = ?
    const [existingUsers] = await pool.query(
      'SELECT id FROM Users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please log in.'
      });
    }

    // 5. Hash the password using bcryptjs (10 salt rounds)
    // Salt adds random string before hashing to prevent Rainbow Table attacks
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 6. Insert new user into MySQL
    // SQL: INSERT INTO Users (name, email, password) VALUES (?, ?, ?)
    const [result] = await pool.query(
      'INSERT INTO Users (name, email, password) VALUES (?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), hashedPassword]
    );

    const newUser = {
      id: result.insertId,
      name: name.trim(),
      email: email.toLowerCase().trim()
    };

    // 7. Generate JWT token
    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while registering user.',
      error: error.message
    });
  }
}

/**
 * Log in an existing user
 * Method: POST /api/auth/login
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    // 2. Find user by email using parameterized query
    // SQL: SELECT id, name, email, password FROM Users WHERE email = ?
    const [users] = await pool.query(
      'SELECT id, name, email, password FROM Users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (users.length === 0) {
      // Use generic error message for security (prevents user enumeration)
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = users[0];

    // 3. Compare provided password with bcrypt hash stored in MySQL
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // 4. Generate JWT token
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while logging in.',
      error: error.message
    });
  }
}

/**
 * Get the currently logged-in user details
 * Method: GET /api/auth/me (Protected by authMiddleware)
 */
async function getCurrentUser(req, res) {
  try {
    const userId = req.user.id;

    // Fetch fresh user data without password
    const [users] = await pool.query(
      'SELECT id, name, email, created_at FROM Users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    return res.status(200).json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: error.message
    });
  }
}

module.exports = {
  register,
  login,
  getCurrentUser
};
