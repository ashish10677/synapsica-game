const errors = require('../errors/errors.json');
const User = require('../models/user');

const auth = (req, res, next) => {
    let token = req.cookies.auth;
    if (!token) {
        return res.json({
            success: false,
            errorCode: "10016",
            message: errors["10016"]
        })
    }
    User.findByToken(token, (err, user) => {
        if (err) throw err;
        if (!user) return res.json({
            success: false,
            errorCode: "10016",
            message: errors["10016"]
        })
        req.token = token;
        req.user = user;
        next();
    })
}

module.exports = { auth };