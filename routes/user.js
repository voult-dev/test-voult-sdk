const express = require('express');
const router = express.Router();

const controller = require('../controllers/user');

const catchAsync = require('../utils/catchAsync');

router.get('/profile', catchAsync(controller.profile));

module.exports = router;