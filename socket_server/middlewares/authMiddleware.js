const jwt = require("jsonwebtoken");

const isAuthenticated = (req, res, next) => {
  const token = req.session.token;

  console.log("Authentication token:", token);

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = decoded;
    next();
  });
};

module.exports = { isAuthenticated };
