const mongoose = require('mongoose'),
    bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
});

// authenticate input

UserSchema.statics.authenticate = function(email, password, callback){
    User.findOne({email: email})
        .exec(function (error, user) {
            if(error) {
                return callback(error)
            } else if (!user) {
                let err = new Error('User not found');
                err.status = 401;
                return callback(err);
            }
            bcrypt.compare(password, user.password, function (error, result) {
                if(result === true) {
                    return callback(null, user);
                } else {
                    return callback();
                }
            })

        })
};

// hash password when saving user object to MongoDB

UserSchema.pre('save', function (next){
    let user = this;
    bcrypt.hash(user.password, 10, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
    })
});

let User = mongoose.model('User', UserSchema);
module.exports = User;