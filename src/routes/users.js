import {Router} from "express";
import userApi from '../data/userApi';
import passport from 'passport';
import jwt from "express-jwt/lib/index";

let router = Router();

let auth = jwt({
    secret: 'MY_SECRET',
    userProperty: 'payload'
});

router.post("/register", (req, res, next) => {
    userApi.addUser(req.body, (err, user) => {
        if (err) {
            next(err);
        } else
            res.json({
                "token": user.generateJwt()
            });
    });
});

router.post("/login", (req, res, next) => {
    passport.authenticate('local', function(err, user, info){
        if (err) {
            res.status(404).json(err);
            return;
        }
        if(user){
            res.status(200);
            res.json({
                "token" : user.generateJwt()
            });
        } else {
            res.status(401).json(info);
        }
    })(req, res);
});

router.get("/:email", auth, (req, res, next) => {
    userApi.findById(req.params.email, (err, data) => {
        if (err)
            next(err);
        else
            res.json(data);
    });
});

router.put("/:email", auth, (req, res, next) => {
    userApi.updateUser(req.params.email, req.body, (err, data) => {
        if (err)
            next(err);
        else
            res.send(data);
    });
});

router.delete("/:email", auth, (req, res, next) => {
    userApi.deleteUser(req.params.email, (err, data) => {
        if (err)
            next(err);
        else
            res.send(data);
    });
});

export default router;
