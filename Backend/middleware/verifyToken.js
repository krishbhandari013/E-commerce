import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  try {

    // Get token from header: prefer Authorization: Bearer, fall back to legacy `token` header
    const authHeader = req.headers.authorization;
    const legacyToken = req.headers.token;

    let token = null;
    if (authHeader) {
      // Expect header format: Bearer TOKEN
      token = authHeader.split(" ")[1];
    } else if (typeof legacyToken === 'string') {
      token = legacyToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format"
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user id to request
    req.userId = decoded.id;

    next();

  } catch (error) {
    console.error("Token verification error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

export default verifyToken;