const jwt = require('jsonwebtoken');

const generateToken = (user) =>
    jwt.sign(
        { id: user.id },
        process.env.Secret_Key,
        { expiresIn: '2m' }
    )

module.exports = generateToken;    