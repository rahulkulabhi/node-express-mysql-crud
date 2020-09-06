module.exports = (request, response, next) => {
    if(request.session.loggedIn) {
        return response.redirect('/');
    }
    next();
};


