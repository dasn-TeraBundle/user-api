import passport from 'passport';
import * as passportLocal from 'passport-local';
import UserApi from "../data/userApi";


let LocalStrategy = passportLocal.Strategy;

passport.use(new LocalStrategy({
        usernameField: 'email'
    },
    function (username, password, done) {
        UserApi.login(username, password, (err, msg, user) => {
            if (err) { return done(err); }
            if (msg) {
                return done(null, false, {
                    message: msg
                });
            }
            return done(null, user);
        });
    }
));