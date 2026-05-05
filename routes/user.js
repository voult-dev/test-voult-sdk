const express = require('express');
const router = express.Router();

const controller = require('../controllers/user');

const catchAsync = require('../utils/catchAsync');

router.get('/profile', catchAsync(controller.profileJson));

router.post('/logout', catchAsync(controller.logout));

router.post('/delete-user', catchAsync(controller.deleteAcct));

module.exports = router;