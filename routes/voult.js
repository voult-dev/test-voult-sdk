const express = require('express');
const router = express.Router();

const playground = require('../controllers/voultPlayground');
const magicCallback = require('../controllers/magicCallback');
const userController = require('../controllers/user');
const signinController = require('../controllers/signin');
const signupController = require('../controllers/signup');
const requireVoultSession = require('../middleware/requireVoultSession');

const catchAsync = require('../utils/catchAsync');

router.get('/', playground.hub);

router.get('/signup/email', playground.signupEmailForm);
router.get('/signup/username', playground.signupUsernameForm);

router.get('/signin/email', playground.signinEmailForm);
router.get('/signin/username', playground.signinUsernameForm);
router.get('/signin/magic', playground.signinMagicForm);

/** Same handlers as /signin/* and /signup/* — scoped here so playground forms can POST under /voult. */
router.post(
  '/signin/email',
  catchAsync(signinController.signinWithEmailAndPassword),
);
router.post(
  '/signin/username',
  catchAsync(signinController.signinWithUsernameAndPassword),
);
router.post(
  '/signin/magicLink',
  catchAsync(signinController.signInWithEmailLink),
);
router.post(
  '/signup/email',
  catchAsync(signupController.signupWithEmailAndPassword),
);
router.post(
  '/signup/username',
  catchAsync(signupController.signupWithUsernameAndPassword),
);

router.get('/magic-callback', magicCallback.verifyMagicLink);

router.get('/account', requireVoultSession, userController.accountPage);

module.exports = router;
