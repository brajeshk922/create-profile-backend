const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());

dotenv.config({ path: './config.env' });
const PORT = process.env.PORT || 3000;
require('./db/conn');


// it means json me jo bhi data aye consume krle
app.use(express.json());
//we link the route file to make our route easy
app.use(require('./router/auth'));

// MIDDLEWARE
const middleware = (req, res, next) => {
    console.log("hi middlewar   e");
    next(); //  IT IS EXECUTED THEN /ABOUT EXECUTE OTHERWISE LOADING.....
}

// compiler never reach below bcoz we already give route for auth file above
app.get('/about', middleware, (req, res) => {
    console.log("about");
    res.send("hello world about");
});

app.get('/contact', (req, res) => {
    res.send("hello world contact");
});

app.get('/signin', (req, res) => {
    res.send("hello world signin");
});

app.get('/signup', (req, res) => {
    res.send("hello world singup");
});

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
})

