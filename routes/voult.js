const express = require('express');
const router = express.Router();

const playground = require('../controllers/voultPlayground');
const magicCallback = require('../controllers/magicCallback');
const userController = require('../controllers/user');
const requireVoultSession = require('../middleware/requireVoultSession');
const postController = require('../controllers/signin');

const catchAsync = require('../utils/catchAsync');

router.get('/', playground.hub);

router.get('/signup/email', playground.signupEmailForm);
router.get('/signup/username', playground.signupUsernameForm);

router.get('/signin/email', playground.signinEmailForm);
router.get('/signin/username', playground.signinUsernameForm);
router.get('/signin/magic', playground.signinMagicForm);

router.post('/signin/email', catchAsync(postController.signinWithEmailAndPassword));
router.post('/signin/username', catchAsync(postController.signinWithUsernameAndPassword));
router.post('/signin/magicLink', catchAsync(postController.signInWithEmailLink));

router.get('/magic-callback', magicCallback.verifyMagicLink);

router.get('/account', requireVoultSession, userController.accountPage);

module.exports = router;
