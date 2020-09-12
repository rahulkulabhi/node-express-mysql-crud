const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const session = require('express-session');
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const csrf = require('csurf');
const flash = require('connect-flash');

const sequelize = require("./util/database");
const frontRoutes = require('./routes/frontend');
const authRoutes = require('./routes/authentication');
const errorCtrl = require('./controllers/error404');

const Product = require('./models/product');
const User = require('./models/user');
const { response } = require('express');

const app = express();

const sessionStore = new SequelizeStore({
    db: sequelize,
});
                
const csrfProtection = csrf();

// setting app variables
app.set('view engine', 'ejs');
app.set('views', 'views');
// middlewares goes here
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: 'mysecret', store: sessionStore, resave: false, saveUninitialized: false}));
app.use(flash());
app.use(csrfProtection);

app.use((request, response, next) => {
    // console.log("LOGGEDIN?? ", request.session.loggedIn);
    // console.log("CSRF?? ", request.csrfToken());
    response.locals.isUserLoggedIn = request.session.loggedIn;
    response.locals.csrfToken = request.csrfToken();
    next();
});
app.use((request, response, next) => {
    if (!request.session.user) {
        return next();
    }
    User.findByPk(request.session.user.id)
    .then(user => {
        if (!user) {
            return next();
        }
        request.user = user;
        next();
    })
    .catch(err => {
        next(new Error(err));
    });
});
// routes goes here
app.use(authRoutes);
app.use(frontRoutes);
// 404 routes
app.get("/500", errorCtrl.err500);
app.use(errorCtrl.err404);
app.use((error, request, response, next) => {
    response.status(500).render("500", {
        pageTitle: "500 Error!",
        url: "/500",
        isAuthenticated: request.session.loggedIn
    });
});

// sequelization association
Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
User.hasMany(Product);

sequelize
//.sync({force: true})
.sync()
.then(
    (result) => {
        // console.log(result);
        app.listen(3000);
    }
).catch((err) => {
    console.log(err);
});



