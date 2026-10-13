const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware
 * 
 * Purpose in Interview & System Architecture:
 * - Intercepts incoming requests to protected routes.
 * - Extracts and validates the JSON Web Token (JWT) from the 'Authorization' header.
 * - Decodes the token to obtain the user's ID and attaches it to `req.user`.
 * - If the token is missing or invalid, blocks the request immediately with a 401 Unauthorized status,
 *   preventing unauthenticated users from executing controller logic or accessing private data.
 */
function authMiddleware(req, res, next) {
  try {
    // 1. Retrieve the Authorization header from the incoming request
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.'
      });
    }

    // 2. Token is expected in the format: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format. Format must be "Bearer <token>".'
      });
    }

    const token = parts[1];
    const secret = process.env.JWT_SECRET || 'super_secret_hiretrack_key_replace_in_production';

    // 3. Verify the token using the secret key
    // jwt.verify checks signature and expiration date
    const decoded = jwt.verify(token, secret);

    // 4. Attach decoded user payload (id, email, name) to request object
    req.user = decoded;

    // 5. Pass control to the next middleware or controller function
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.'
    });
  }
}

module.exports = authMiddleware;
