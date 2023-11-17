const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.token;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json("Token is not valid!");
      }
      req.user = user;
      next();
    });
  } else {
    return res.status(401).json("You are not authenticated!");
  }
};

const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id) {
      next();
    } else {
      return res.status(403).json("You are not allowed to do that!");
    }
  });
};

const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === "admin") {
      next();
    } else {
      res.status(403).json("You are not allowed to do that!");
    }
  });
};

const verifyTokenAndStaff = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === "admin" || req.user.role === "tailor" || req.user.role === "hairdresser") {
      next();
    } else {
      res.status(403).json("You are not allowed to do that!");
    }
  });
};

const verifyTokenAndBlogger = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === "blogger" || req.user.role === "admin") {
      next();
    } else {
      res.status(403).json("You are not allowed to do that!");
    }
  });
};

module.exports = {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
  verifyTokenAndBlogger,
  verifyTokenAndStaff
};
