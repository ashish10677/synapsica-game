const errors = require('../errors/errors.json');
const User = require('../models/user');

const registerUser = (req, res) => {
    const newUser = new User(req.body);
    User.findOne({
        email: newUser.email
    }).then((_user) => {
        if (_user) {
            return res.status(200).json({
                success: false,
                errorCode: "10001",
                message: errors["10001"]
            })
        }
        return newUser.save()
    }).then((doc) => {
        res.status(200).json({
            success: true,
            message: `${doc.firstName} registered successfully!`
        })
    }).catch((err) => {
        res.status(400).send({
            success: false,
            errorCode: "10002",
            message: `${errors['10002']}: ${err}`,
        })
    })
}

const loginUser = (req, res) => {
    let token = req.cookies.auth;
    User.findByToken(token, (err, user) => {
        if (err) return res.status(400).json({
            success: false,
            errorCode: "10003",
            message: `${errors["10003"]}: ${err}`
        })
        if (user) {
            return res.status(200).json({
                success: false,
                errorCode: "10004",
                message: errors["10004"]
            })
        } else {
            User.findOne({ 'email': req.body.email }, (err, user) => {
                if (err) {
                    return res.status(400).json({
                        success: false,
                        errorCode: "10005",
                        message: `${errors["10005"]}: ${err}`
                    })
                }

                if (!user) {
                    return res.status(200).json({
                        success: false,
                        errorCode: "10006",
                        message: errors["10006"]
                    });
                }

                user.comparePassword(req.body.password, (err, isMatch) => {
                    if (err) {
                        return res.status(400).json({
                            success: false,
                            errorCode: "10008",
                            message: errors["10008"]
                        })
                    }

                    if (!isMatch) {
                        return res.status(200).json({
                            success: false,
                            errorCode: "10007",
                            message: errors["10007"],
                        });
                    }

                    user.generateToken((err, user) => {
                        if (err) {
                            return res.status(400).json({
                                success: false,
                                errorCode: "10009",
                                message: `${errors["10009"]}: ${err}`
                            });
                        }
                        res.cookie('auth', user.token).json({
                            id: user._id,
                            email: user.email,
                            success: true
                        });
                    });
                });
            });
        }
    })
}

const getLoggedInUser = (req, res) => {
    res.status(200).json({
        success: true,
        email: req.user.email,
        name: `${req.user.firstName}`,
        highScore: req.user.highScore,
        gamesPlayed: req.user.gamesPlayed
    })
}

const logOutUser = (req, res) => {
    req.user.deleteToken(req.token, (err, user) => {
        if (err) return res.status(400).json({
            success: false,
            errorCode: "10010",
            message: `${errors["10010"]}: ${err}`
        });
        res.status(200).json({
            success: true,
        });
    });
}

const setScore = (req, res) => {
    if (!req.body.score) {
        return res.status(200).json({
            success: false,
            errorCode: "10011",
            message: errors["10011"]
        })
    }
    req.user.getNumberOfAttempts((err, attempts) => {
        if (err) {
            return res.status(400).json({
                success: false,
                errorCode: "10012",
                message: `${errors["10012"]}: ${err}`
            })
        }
        if (attempts < 10) {
            req.user.setScore(req.body.score, (err, user) => {
                if (err) return res.status(400).json({
                    success: false,
                    errorCode: "10013",
                    message: `${errors["10013"]}: ${err}`
                });
                res.status(200).json({
                    success: true,
                    name: user.firstName,
                    highScore: user.highScore
                })
            })
        } else {
            return res.status(200).json({
                success: false,
                errorCode: "10014",
                message: errors["10014"],
            })
        }
    })
}

const getNumberOfAttempts = (req, res) => {
    req.user.getNumberOfAttempts((err, attempts) => {
        if (err) return status(400).json({
            success: false,
            errorCode: "10015",
            message: `${errors["10015"]}: ${err}`
        });
        res.status(200).json({
            success: true,
            name: req.user.firstName,
            attempts: attempts,
            isAllowed: attempts >= 10 ? false : true
        })
    })
}

module.exports = {
    registerUser,
    loginUser,
    getLoggedInUser,
    logOutUser,
    setScore,
    getNumberOfAttempts
}