exports.err404 = (request, response, next) => {
  response.status(404).render("404", {
    pageTitle: "Page Not found",
    url: "/404",
    isAuthenticated: request.session.loggedIn
  });
};

exports.err500 = (request, response, next) => {
  response.status(500).render("500", {
    pageTitle: "500 Error!",
    url: "/500",
    isAuthenticated: request.session.loggedIn
  });
};
