const jwt = require('jsonwebtoken');
const User = require('../model/index')


const verifytoken = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;

  // Check if no token
  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.Secret_Key,async (err, decode) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    const user = await User.findOne({ _id: decode.id })

    if(!user){
      return res.status(404).json({ message: 'User not found' });
    }

    req.user =user;
    next();
  })
};

module.exports = verifytoken;