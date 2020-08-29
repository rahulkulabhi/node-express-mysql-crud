const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const sequelize = require("./util/database");
const frontRoutes = require('./routes/frontend');
const errorCtrl = require('./controllers/error404');

const app = express();

// setting app variables
app.set('view engine', 'ejs');
app.set('views', 'views');
// middlewares goes here
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
// routes goes here
app.use(frontRoutes);
// 404 routes
app.use(errorCtrl.err404);

sequelize.sync().then(
    (result) => {
        // console.log(result);
        app.listen(3000);
    }
).catch((err) => {
    console.log(err);
});



