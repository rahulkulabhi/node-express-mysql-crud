const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Sequelize = require("sequelize");
const { validationResult } = require('express-validator');


const User = require('../models/user');
const transport = require('../util/email');

const salt = bcrypt.genSaltSync(12);
const Op = Sequelize.Op;

exports.signup = (request, response, next) => {
    if (request.method === 'POST') {
        // console.log(request.body);
        const name = request.body.name;
        const email = request.body.email;
        const password = request.body.password;
        const errors = validationResult(request);
        if(!errors.isEmpty()) {
            // console.log(errors.array());
            response.status(422).render('authentication/signup', {
                pageTitle: "Signup!",
                url: '/signup',
                errorMsg: errors.array()[0].msg,
                oldValues: { name: name, email: email},
                validationErrors: errors.array()
            });
        } else {
            const hash = bcrypt.hashSync(password, salt);
            const newUser = new User({
                name: name,
                email: email,
                password: hash,
                status: 'active'
            });
            newUser.save().then(result => {
                transport.sendMail({
                    to: email,
                    from: 'Admin <rahul.kulabhi@codeclouds.in>',
                    subject: 'Signup Successfully!',
                    html: `<h2>Welcome ${name}</h2>`
                });
                response.redirect('/login');
            })
            .catch(err => {console.log(err);});
        }
        /*
        User.findOne({where: {email: email}})
        .then(user => {
            if (user) {
                // console.log(user);
                // throw "duplicate email found";
                request.flash('error', 'User already exist with same email');
                return response.redirect('/signup');
            }
            const hash = bcrypt.hashSync(password, salt);
            // console.log("HASH PASSWORD::: ", hash);
            const newUser = new User({
                name: name,
                email: email,
                password: hash,
                status: 'active'
            });
            return newUser.save();
            
        })
        .then(result => {
            transport.sendMail({
                to: email,
                from: 'Admin <rahul.kulabhi@codeclouds.in>',
                subject: 'Signup Successfully!',
                html: `<h2>Welcome ${name}</h2>`
            });
            response.redirect('/login');
        })
        .catch(err => {console.log(err);});
        */
    } else if (request.method === 'GET') {
        let errmsg = request.flash('error');
        if (errmsg.length > 0) {
            errmsg = errmsg[0];
        } else {
            errmsg = null;
        }
        response.render('authentication/signup', {
            pageTitle: "Signup!",
            url: '/signup',
            errorMsg: errmsg,
            oldValues: { name: '', email: ''},
            validationErrors: []
        });
    }
};

exports.login = (request, response, next) => {
    if (request.method === 'POST') {
        // console.log(request.body);
        const email = request.body.email;
        const password = request.body.password;
        const errors = validationResult(request);
        if(!errors.isEmpty()) {
            // console.log(errors.array());
            response.status(422).render('authentication/login', {
                pageTitle: "Login!",
                url: '/login',
                errorMsg: errors.array()[0].msg,
                oldValues: { email: email },
                validationErrors: errors.array()
            });
        } else {
            User.findOne({where: {email: email}})
            .then(user => {
                request.session.loggedIn = true;
                request.session.user = user;
                request.session.save(err => {
                    console.log(err);
                    response.redirect('/');
                });
            })
            .catch(err => {console.log(err);});
        }
        /*
        User.findOne({where: {email: email}})
        .then(user => {
            if (!user) {
                request.flash('error', 'Invalid email or password');
                return response.redirect('/login');
            }
            if (bcrypt.compareSync(password, user.password)) {
                request.session.loggedIn = true;
                request.session.user = user;
                return request.session.save(err => {
                    console.log(err);
                    response.redirect('/');
                });
            } else {
                request.flash('error', 'Invalid email or password');
                return response.redirect('/login');
            }
        })
        .catch(err => {console.log(err);});
        */
    } else if (request.method === 'GET') {
        let errmsg = request.flash('error');
        if (errmsg.length > 0) {
            errmsg = errmsg[0];
        } else {
            errmsg = null;
        }
        response.render('authentication/login', {
            pageTitle: "Login!",
            url: '/login',
            errorMsg: errmsg,
            oldValues: { email: ''},
            validationErrors: []
        });
    }
};

exports.logout = (request, response, next) => {
    if (request.method === 'POST') {
        request.session.destroy(err => {
            console.log(err);
            response.redirect('/');
        });
    }
};

exports.resetPassword = (request, response, next) => {
    if (request.method === 'POST') {
        const errors = validationResult(request);
        if(!errors.isEmpty()) {
            // console.log(errors.array());
            response.status(422).render('authentication/reset_password', {
                pageTitle: "Reset Password!",
                url: '/reset-password',
                errorMsg: errors.array()[0].msg,
                oldValues: { email: request.body.email },
                validationErrors: errors.array()
            });
        } else {
            crypto.randomBytes(32, (error, buffer) => {
                if (error) {
                    console.log(err);
                    request.flash('error', 'Something wrong, please try again');
                    return response.redirect('/reset-password');
                }
                const token = buffer.toString('hex');
                User.findOne({where: {email: request.body.email}})
                .then(user => {
                    user.resetToken = token;
                    user.resetTokenExpire = Date.now()+3600000;
                    return user.save();
                })
                .then(result => {
                    transport.sendMail({
                        to: request.body.email,
                        from: 'Admin <rahul.kulabhi@codeclouds.in>',
                        subject: 'Password Reset Request!',
                        html: `<h3>Want to password reset?</h3><p>To reset Password <a href="http://localhost:3000/reset-password/${token}">click here</a> to proceed.</p>`
                    });
                    response.redirect('/');
                })
                .catch(err => {console.log(err);});
            });
        }
        /*
        crypto.randomBytes(32, (error, buffer) => {
            if (error) {
                console.log(err);
                request.flash('error', 'Something wrong, please try again');
                return response.redirect('/reset-password');
            }
            const token = buffer.toString('hex');
            User.findOne({where: {email: request.body.email}})
            .then(user => {
                if (!user) {
                    request.flash('error', 'No account found for this email');
                    return response.redirect('/reset-password');
                }
                user.resetToken = token;
                user.resetTokenExpire = Date.now()+3600000;
                return user.save();
            })
            .then(result => {
                transport.sendMail({
                    to: request.body.email,
                    from: 'Admin <rahul.kulabhi@codeclouds.in>',
                    subject: 'Password Reset Request!',
                    html: `<h3>Want to password reset?</h3><p>To reset Password <a href="http://localhost:3000/reset-password/${token}">click here</a> to proceed.</p>`
                });
                response.redirect('/');
            })
            .catch(err => {console.log(err);});
        });
        */
    } else if (request.method === 'GET') {
        let errmsg = request.flash('error');
        if (errmsg.length > 0) {
            errmsg = errmsg[0];
        } else {
            errmsg = null;
        }
        response.render('authentication/reset_password', {
            pageTitle: "Reset Password!",
            url: '/reset-password',
            errorMsg: errmsg,
            oldValues: { email: '' },
            validationErrors: []
        });
    }
};

exports.changePassword = (request, response, next) => {
    const token = request.params.token;
    User.findOne({where: 
        {
            resetToken: token, 
            resetTokenExpire: {[Op.gt]: Date.now()}
        }
    })
    .then(user => {
        if (!user) {
            request.flash('error', `${token} is not valid token`);
            return response.redirect('/reset-password');
        }
        let errmsg = request.flash('error');
        if (errmsg.length > 0) {
            errmsg = errmsg[0];
        } else {
            errmsg = null;
        }
        response.render('authentication/password_change', {
            pageTitle: "Change Your Password!",
            url: '/new-password',
            errorMsg: errmsg,
            userId: user.id,
            passwordToken: token,
            validationErrors: []
        });
    })
    .catch(err => {console.log(err);});
};

exports.newPassword = (request, response, next) => {
    const userId = request.body.userId;
    const passwordToken = request.body.passwordToken;
    const password  = request.body.password;
    // console.log(userId, passwordToken, password);
    const errors = validationResult(request);
    if(!errors.isEmpty()) {
        // console.log(errors.array());
        response.status(422).render('authentication/password_change', {
            pageTitle: "Change Your Password!",
            url: '/new-password',
            errorMsg: errors.array()[0].msg,
            userId: userId,
            passwordToken: passwordToken,
            validationErrors: errors.array()
        });
    }
    else{
        User.findOne({where: 
            {
                resetToken: passwordToken, 
                resetTokenExpire: {[Op.gt]: Date.now()},
                id: userId
            }
        })
        .then(user => {
            if (!user) {
                request.flash('error', 'Something wrong.');
                return response.redirect('/reset-password');
            }
            const hash = bcrypt.hashSync(password, salt);
            user.password = hash;
            user.resetToken = '';
            return user.save();
        })
        .then(result => {
            response.redirect('/login');
        })
        .catch(err => {console.log(err);});
    }
    
};
