const express = require('express');
const router = express.Router();

const controller = require('../controllers/user');

const catchAsync = require('../utils/catchAsync');

const requireVoultSession = require('../middleware/requireVoultSession');

router.get('/profile', controller.profileJson);

router.post('/logout', requireVoultSession, controller.logout);

router.post('/delete-user', controller.deleteAcct);

module.exports = router;