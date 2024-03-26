const mongoose =require('mongoose');

const UserSchema = new mongoose.Schema({
    email: String,
    password :String,
    restPasswordToken : String,
    restPasswordExpires : Date,
})

const User = mongoose.model('User', UserSchema ,'LoginUser')
module.exports = User;