const express = require('express');
const router = express.Router();

const controller = require('../controllers/signup');


router.post('/email', controller.signupWithEmailAndPassword);

router.post('/username', controller.signupWithUsernameAndPassword);

module.exports = router;