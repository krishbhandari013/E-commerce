import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  try {

    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    // Expect header format: Bearer TOKEN
    const token = authHeader.split(" ")[1];

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