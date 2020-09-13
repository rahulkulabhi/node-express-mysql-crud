const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const session = require('express-session');
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

const sequelize = require("./util/database");
const frontRoutes = require('./routes/frontend');
const authRoutes = require('./routes/authentication');
const errorCtrl = require('./controllers/error404');

const Product = require('./models/product');
const User = require('./models/user');

const app = express();

const sessionStore = new SequelizeStore({
    db: sequelize,
});
                
const csrfProtection = csrf();

// multer checking
const fileStorage = multer.diskStorage({
    destination: (request, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (request, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const fileFilter = (request, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname =  filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if(mimetype && extname){
        return cb(null,true);
    }else{
        cb('Error: Unsupported image file!');
    }
};
var upload = multer({ 
    storage: fileStorage, 
    fileFilter: fileFilter, 
    limits : {
        fileSize : 1000000 // max 1 MB size
    } 
});

// setting app variables
app.set('view engine', 'ejs');
app.set('views', 'views');
// middlewares goes here
app.use(bodyParser.urlencoded({extended: false}));
app.use(upload.single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
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
    console.log(error);
    response.redirect("/500");
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



