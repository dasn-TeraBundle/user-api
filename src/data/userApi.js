import mongoose from 'mongoose';
import crypto from 'crypto';
import jsonwebtoken from 'jsonwebtoken';

let UserSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    _id: String,
    hash: String,
    salt: String
});

UserSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
};

UserSchema.methods.validPassword = function (password) {
    let hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
    return this.hash === hash;
};

UserSchema.methods.generateJwt = function () {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 30);

    return jsonwebtoken.sign({
        _id: this._id,
        firstname: this.firstname,
        lastname: this.lastname,
        exp: Math.floor(expiry.getTime() / 1000),
    }, "MY_SECRET");
};


let User = mongoose.model('User', UserSchema);

let UserApi = {
    findById: (email, callback) => {
        User.find({_id: email}, (err, user) => {
            if (err)
                callback(err, null);
            else
                callback(null, user);
        });
    },
    login: (id, password, callback) => {
        User.findOne({_id: id}, (err, user) => {
            if (err)
                callback(err, null, null);
            else if (!user)
                callback(null, 'User Not Found', null);
            else if (!user.validPassword(password))
                callback(null, 'Wrong Password', null);
            else
                callback(null, null, user);
        });
    },
    updateUser: (email, userDTO, callback) => {
        let user = new User();
        user.firstname = userDTO.firstname;
        user.lastname = userDTO.lastname;
        user._id = userDTO.email;
        user.setPassword(userDTO.password);

        User.findOneAndUpdate({_id: email}, user, {new: false, upsert: false}, (err, updUser) => {
            if (err)
                callback(err, null);
            else
                callback(null, updUser);
        });
    },
    deleteUser: (email, callback) => {
        User.remove({_id: email}, (err, data) => {
            if (err)
                callback(err, null);
            else
                callback(null, data);
        });
    },
    addUser: (userDTO, callback) => {
        let user = new User();
        user.firstname = userDTO.firstname;
        user.lastname = userDTO.lastname;
        user._id = userDTO.email;
        user.setPassword(userDTO.password);

        User.create(user, (err, userCreated) => {
            if (err) {
                if(err.code === 11000)
                    callback(new ApplicationError(500, "Email ID already registered"), null);
                else
                    callback(err, null);
            } else
                callback(null, userCreated);
        });
    }
};

export default UserApi;