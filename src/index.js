require('dotenv').config();
const express = require('express');
const app = express();

const session = require('express-session');

const sessionConfig = require('../config/session');

const methodOverride = require('method-override');
const flash = require('connect-flash');

const path = require('path');
const ejsMate = require('ejs-mate');

const ExpressError = require('../utils/expressError');
const syncVoultClient = require('../middleware/syncVoultClient');

app.use(express.json());
app.use(express.urlencoded({ 
  extended: true,
  limit : '10kb'
}));

const signinRoutes = require('../routes/signin');
const signupRoutes = require('../routes/signup');
const userRoutes = require('../routes/user');
const voultRoutes = require('../routes/voult');

app.use(session(sessionConfig));
app.use(syncVoultClient);
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

app.use('/voult', voultRoutes);
app.use('/', userRoutes);
app.use('/signin', signinRoutes);
app.use('/signup', signupRoutes);

app.get('/', (req, res) => {
  res.render('home', { title: 'Voult SDK test app' });
});

app.all(/(.*)/, (req, res, next) => {
  next(new ExpressError('Page not found', 404))
});

app.use((err, req, res, next)=>{
  const {statusCode = 500} = err;
  if(!err.message){
      err.message = 'Something Went Wrong!'
  }
  res.status(statusCode).render('error', {
    err,
    title: statusCode === 404 ? 'Page not found' : 'Error',
    req,
  })
});

const port = process.env.port || 2000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});