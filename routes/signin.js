const express = require('express');
const router = express.Router();

const controller = require('../controllers/signin');

router.post('/email', controller.signinWithEmailAndPassword);
router.post('/username', controller.signinWithUsernameAndPassword);

module.exports = router;