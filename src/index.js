require('dotenv').config();
const express = require('express');
const app = express();

const session = require('express-session');

const sessionConfig = require('../config/session');

const methodOverride = require('method-override');
const flash = require('connect-flash');

const path = require('path');
const ejsMate = require('ejs-mate');

app.use(express.json());
app.use(express.urlencoded({ 
  extended: true,
  limit : '10kb'
}));

const signinRoutes = require('../routes/signin');
const signupRoutes = require('../routes/signup');
const userRoutes = require('../routes/user');

app.use(session(sessionConfig));
app.use(flash());

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.engine('ejs', ejsMate);

app.use(express.static(path.join(__dirname, '../public')));

app.use(methodOverride('_method'));

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.info = req.flash('info');
  res.locals.currentUser = req.user;
  next();
});

app.use('/signin', signinRoutes);
app.use('/signup', signupRoutes);
app.use('/', userRoutes);

const port = process.env.port || 2000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});