require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ 
  extended: true,
  limit : '10kb'
}));

const signinRoutes = require('../routes/signin');
const signupRoutes = require('../routes/signup');
const userRoutes = require('../routes/user')

app.use('/signin', signinRoutes);
app.use('/signup', signupRoutes);
app.use('/', userRoutes);

const port = process.env.port || 2000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});