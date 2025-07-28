const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    console.log("req authorization", req.headers.authorization);
    const token = req.headers.authorization.split(" ")[1];
    console.log("Token", token);
    const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Verified Token", verifiedToken);
    req.userId = verifiedToken.userId;
    next();
  } catch (error) {}
};

module.exports = auth;
