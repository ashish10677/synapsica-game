const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const users = require('./routes/user');
const db = require('./config/config').get(process.env.NODE_ENV);
const { auth } = require('./middlewares/auth');

// Allow only whitelisted IPs to access the APIs.
const whitelist = ['http://localhost:8080', 'http://127.0.0.1:8080'];
const corsOptions = {
    credentials: true,
    origin: (origin, callback) => {
        if (whitelist.includes(origin))
            return callback(null, true)

        callback(new Error('Not allowed by CORS'));
    }
}

const app = express();

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser())
app.use(cors(corsOptions));
app.use(logger('dev'));

// Establish database connections
mongoose.connect(db.DATABASE, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log("Connection to database established!")
}).catch(err => {
    console.log("Connection to database could not be established!")
    console.log(err);
})

// GET calls
app.get('/', (req, res) => {
    res.status(200).send('Welcome to Synapsica challenge');
})
app.get('/user/profile', auth, users.getLoggedInUser);
app.get('/user/attempts', auth, users.getNumberOfAttempts);
app.get('/user/logout', auth, users.logOutUser);

// POST calls
app.post('/user/register', users.registerUser);
app.post('/user/login', users.loginUser);
app.post('/user/setscore', auth, users.setScore);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`App is live at ${PORT}`);
});