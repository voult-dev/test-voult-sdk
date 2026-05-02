const express = require('express');
const router = express.Router();

const controller = require('../controllers/signup');

const catchAsync = require('../utils/catchAsync');


router.post('/email', catchAsync(controller.signupWithEmailAndPassword));

router.post('/username', catchAsync(controller.signupWithUsernameAndPassword));

module.exports = router;