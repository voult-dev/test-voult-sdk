const express = require('express');
const router = express.Router();

const controller = require('../controllers/signin');

const catchAsync = require('../utils/catchAsync');

router.get('/username', controller.signinUsernameForm);

router.post('/email', catchAsync(controller.signinWithEmailAndPassword));
router.post('/username', catchAsync(controller.signinWithUsernameAndPassword));
router.post('/magicLink', catchAsync(controller.signInWithEmailLink));

module.exports = router;