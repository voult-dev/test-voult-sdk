const express = require('express');
const router = express.Router();

const controller = require('../controllers/signin');

const catchAsync = require('../utils/catchAsync');

router.post('/email', catchAsync(controller.signinWithEmailAndPassword));
router.post('/username', catchAsync(controller.signinWithUsernameAndPassword));

module.exports = router;