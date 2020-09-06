const express = require('express');
const { body } = require('express-validator');
const bcrypt = require('bcryptjs');

const authController = require('../controllers/authentication');
const User = require('../models/user');
const isGuestMiddleware = require('../middleware/is-guest');

const salt = bcrypt.genSaltSync(12);
const router = express.Router();

router.use('/signup', isGuestMiddleware,
[   
    body('name').isLength({min: 3}).withMessage('Valid name is require'),
    body('email').isEmail()
    .withMessage('Valid email is require')
    .custom((value, {req}) => {
        return User.findOne({where: {email: value}})
        .then(user => {
            if (user) {
                return Promise.reject('User already exist with same email');
            }
        })
    }),
    body(
        'password',
        'Password should be minimum 5 charecters'
    ).isLength({min: 5}),
    body(
        're_password',
        'Confirm password cannot be emty'
    )
    .isLength({min: 5})
    .custom((value, {req}) => {
        if(value !== req.body.password){
            throw new Error('Confirm password have to be matched');
        }
        return true;
    })
], 
authController.signup);
router.use('/login', isGuestMiddleware,
[
    body('email').isEmail()
    .withMessage('Valid email is require')
    .custom((value, {req}) => {
        return User.findOne({where: {email: value}})
        .then(user => {
            if (!user) {
                return Promise.reject('User is not found with this email');
            }
        })
    }),
    body(
        'password',
        'Password should be minimum 5 charecters'
    ).isLength({min: 5})
    .custom((value, {req}) => {
        return User.findOne({where: {email: req.body.email}})
        .then(user => {
            if (user && !bcrypt.compareSync(value, user.password)) {
                return Promise.reject('Invalid password');
            }
        }) 
    })
],
authController.login);
router.post('/logout', authController.logout);
router.get('/reset-password/:token', isGuestMiddleware, authController.changePassword);
router.post('/new-password', 
[
    body(
        'password',
        'Password should be minimum 5 charecters'
    ).isLength({min: 5}),
    body(
        're_password',
        'Confirm password cannot be emty'
    )
    .isLength({min: 5})
    .custom((value, {req}) => {
        if(value !== req.body.password){
            throw new Error('Confirm password have to be matched');
        }
        return true;
    })
],
authController.newPassword);
router.use('/reset-password', isGuestMiddleware,
[
    body('email').isEmail()
    .withMessage('Valid email is require')
    .custom((value, {req}) => {
        return User.findOne({where: {email: value}})
        .then(user => {
            if (!user) {
                return Promise.reject('User is not found with this email');
            }
        })
    })
], 
authController.resetPassword);

module.exports = router;

