
const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose');
const { emit } = require('./review');
const Schema = mongoose.Schema;



const userSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true
        }


    }
);

userSchema.plugin(passportLocalMongoose);
//add to useSchema an field for pass, username etc!

module.exports = mongoose.model('User', userSchema);