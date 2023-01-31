const User = require('../models/user');


module.exports.renderRegister = (req, res) => {

    res.render('users/register')
}

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body
        const user = new User({ email, username })
        const registeredUser = await User.register(user, password);
        // console.log(registeredUser);
        req.login(registeredUser, function (err) {
            if (err) return next(err);
            req.flash('succes', 'Welcome to Yelp camp!');
            res.redirect('/campgrounds')
        })

    }
    catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }



}

module.exports.renderLogin = (req, res) => {

    res.render('users/login');
}

module.exports.login = async (req, res) => {
    req.flash('success', `Welcome in !`)
    // console.log(req.session.returnTo);
    const reddirectUrl = req.session.returnTo || '/campgrounds';
    res.redirect(reddirectUrl)


}

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); }

        req.flash('success', 'Goodbye!')
        res.redirect('/campgrounds')


    });



}