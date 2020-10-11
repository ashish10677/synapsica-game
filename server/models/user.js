const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config/config').get(process.env.NODE_ENV);
const salt = 10;

const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    token: {
        type: String
    },
    highScore: {
        type: Number,
        required: true,
        default: 0
    },
    gamesPlayed: [{
        score: {
            type: Number,
            required: true
        },
        playedAt: {
            type: Date,
            required: true
        }
    }]
});

userSchema.pre('save', function (next) {
    let user = this;

    if (user.isModified('password')) {
        bcrypt.genSalt(salt, function (err, salt) {
            if (err) return next(err);

            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err);
                user.password = hash;
                next();
            })

        })
    }
    else {
        next();
    }
});

userSchema.methods.comparePassword = function (password, cb) {
    bcrypt.compare(password, this.password, (err, isMatch) => {
        if (err) return cb(err);
        cb(null, isMatch);
    })
}

userSchema.methods.generateToken = function (cb) {
    let user = this;
    let token = jwt.sign(user._id.toHexString(), config.SECRET);
    user.token = token;
    user.save().then((_user) => {
        return cb(null, _user);
    }).catch(err => {
        return cb(err);
    })
}

userSchema.statics.findByToken = function (token, cb) {
    let user = this;
    if (!token) {
        return cb();
    }
    jwt.verify(token, config.SECRET, (err, decode) => {
        user.findOne({ "_id": decode, "token": token }, function (err, user) {
            if (err) return cb(err);
            cb(null, user);
        })
    })
}

userSchema.methods.deleteToken = function (token, cb) {
    let user = this;
    user.updateOne({
        $unset: {
            token: 1
        }
    }).then((user) => {
        cb(null, user);
    }).catch((err) => {
        cb(err);
    })
}

userSchema.methods.setScore = function (score, cb) {
    score = Number(score);
    let user = this;
    let gamePlayed = {
        score: score,
        playedAt: new Date().toISOString()
    }
    user.gamesPlayed.push(gamePlayed);
    if (user.highScore < score) {
        user.highScore = score;
    }
    user.save().then(() => {
        return cb(null, user);
    }).catch((err) => {
        return cb(err);
    })
}

userSchema.methods.getNumberOfAttempts = function (cb) {
    let user = this;
    let now = new Date();
    let beginningOfDay = new Date();
    beginningOfDay.setHours(0, 0, 0, 0);
    let gamesPlayed = user.gamesPlayed;
    let count = 0;
    for (let gamePlayed of gamesPlayed) {
        if (gamePlayed.playedAt <= now && gamePlayed.playedAt >= beginningOfDay) {
            count++;
        }
    }
    cb(null, count);
}

module.exports = mongoose.model('User', userSchema);