if (process.env.NODE_ENV !== "production") {

    require('dotenv').config()
}
console.log(process.env.secret)

const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp';


const express = require("express");
const app = express();
const path = require('path')
const Campground = require('./models/campground')
const mongoose = require('mongoose')
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError');
const Joi = require('joi');
const { campgroundSchema } = require('./schemas.js');
const { reviewSchema } = require('./schemas.js');
const Review = require('./models/review');
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const User = require('./models/user');
const session = require('express-session')
const flash = require('connect-flash');
const MongoStore = require('connect-mongo');
const monogoSanitize = require('express-mongo-sanitize');
app.engine('ejs', ejsMate)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
const passport = require('passport')
const LocalStrategy = require('passport-local');
const { stopCoverage } = require('v8');
const SECRET = process.env.SECRET || 'thisshouldbeabettersecret';
const store = new MongoStore({
    mongoUrl: dbUrl,
    secret: SECRET,
    touchAfter: 24 * 3600
})
store.on("error", function (e) {
    console.log("Session store error", e)
})
const sessionConfig = {
    store: store,
    name: 'session',
    secret: SECRET,
    resave: false,

    saveUninitalized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        HttpOnly: true
    }

}

app.use(flash());
app.use(session(sessionConfig))
app.use(passport.initialize());
app.use(passport.session());
app.use(monogoSanitize())
passport.use(new LocalStrategy(User.authenticate()));
//USE LOCAL STRATEGY ,AUTHENTICATEION ON USER MODEL

passport.serializeUser(User.serializeUser());
//how we store the data coming from machine code into a session
passport.deserializeUser(User.deserializeUser());



//'mongodb://127.0.0.1:27017/yelp-camp'
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.set('strictQuery', true);
// .then(() => {
//     console.log("MONGO CONNECTION OPEN!")

// })
// .catch(err => {

//     console.log('OH NO MONGO CONNECTION ERROR:')
//     console.log(err)
// })
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once("open", () => {
    console.log("MONGO CONNECTION OPEN!")
});

app.use((req, res, next) => {
    if (!['/login', '/', '/sdfsd', '/register'].includes(req.originalUrl)) {
        req.session.returnTo = req.originalUrl;

    }
    console.log(req.query)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();

})



app.get('/', (req, res) => {
    res.render('home')
})
//FOR USER!!!
app.use('/', userRoutes);
// ROUTE FOR CAMPS!!
app.use('/campgrounds', campgroundsRoutes)

//ROUTE FOR REVIEWS!!!
app.use('/campgrounds/:id/reviews', reviewsRoutes)


app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh no ,Something went wrong!'
    res.status(statusCode).render('error', { err })

})
app.listen(3000, () => {

    console.log("Serving on port 3000")
})