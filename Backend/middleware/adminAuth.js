import jwt from 'jsonwebtoken'

const adminAuth = async (req, res, next) => {
  try {
    const { token } = req.headers
    
    if (!token) {
      return res.json({ success: false, message: "Not authorized Login Again" })
    }
    
    const token_decode = jwt.verify(token, process.env.JWT_SECRET)

    // Current format: { role: 'admin', email, iat, exp }
    // Legacy format (deprecated): plain "email+password" string — still accepted so
    // existing sessions keep working until they expire/re-login.
    const isAdmin = typeof token_decode === 'object'
      ? token_decode.role === 'admin'
      : token_decode === process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD;

    if (!isAdmin) {
      return res.json({ success: false, message: "Not authorized Login Again" })
    }
    
    next()
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Not authorized Login Again" })
  }
}

export default adminAuth