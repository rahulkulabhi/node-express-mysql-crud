exports.homeCtrl = (request, response, next) => {
    //response.sendFile(path.join(rootDir, "views", "home.html"));
    response.render('home', {
        pageTitle: "Home page!",
        url: '/'
    });
};

