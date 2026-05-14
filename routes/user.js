const express = require('express');
const router = express.Router();

const controller = require('../controllers/user');

const catchAsync = require('../utils/catchAsync');

router.get('/profile', controller.profileJson);

router.post('/logout', controller.logout);

router.post('/delete-user', controller.deleteAcct);

module.exports = router;