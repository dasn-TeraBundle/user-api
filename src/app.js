import express from 'express';
import bodyParser from 'body-parser';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';

import mongoose from 'mongoose';
import passport from 'passport';
import * as passportConfig from './config/passport';

import user from './routes/users';
import ApplicationError from "./dto/error";


let app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/UserOp")
    .then(
        () => console.log("Connected to DB"),
        err => console.log("Failed to connect")
    );

app.use(passport.initialize());
app.use('/api/user', user);


// catch 404 and forward to error handler
app.use( (req, res, next) => {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// error handler
app.use( (err, req, res, next) => {
    // set locals, only providing error in development
    //res.locals.message = err.message;
    res.locals.error =  req.app.get('env') === 'development'? err : (typeof(err) === ApplicationError) ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.send(err);
});

export default app;