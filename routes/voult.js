const express = require('express');
const router = express.Router();

const playground = require('../controllers/voultPlayground');
const magicCallback = require('../controllers/magicCallback');
const oauthController = require('../controllers/oauth');
const userController = require('../controllers/user');
const settingsController = require('../controllers/settings');
const postController = require('../controllers/signin');

const requireVoultSession = require('../middleware/requireVoultSession');

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

router.get('/settings', requireVoultSession, settingsController.settingsPage);
router.get('/settings/sessions/:sessionId/revoke', requireVoultSession, catchAsync(settingsController.revokeSession));

router.patch('/settings/profile', requireVoultSession, catchAsync(settingsController.updateProfile));
router.post('/settings/forgot-password', requireVoultSession, catchAsync(settingsController.forgotPassword));
router.post('/settings/reset-password', requireVoultSession, catchAsync(settingsController.resetPassword));
router.post('/settings/set-password', requireVoultSession, catchAsync(settingsController.setPassword));
router.post('/settings/oauth/:provider/link', requireVoultSession, catchAsync(settingsController.linkOAuth));
router.delete('/settings/oauth/:provider/unlink', requireVoultSession, catchAsync(settingsController.unlinkOAuth));
router.post('/settings/reenable', requireVoultSession, catchAsync(settingsController.reenableAccount));

router.get('/oauth', oauthController.oauthPage);
router.post('/oauth/google/login', catchAsync(oauthController.googleLogin));
router.post('/oauth/google/register', catchAsync(oauthController.googleRegister));
router.post('/oauth/github/login', catchAsync(oauthController.githubLogin));
router.post('/oauth/github/register', catchAsync(oauthController.githubRegister));
router.post('/oauth/facebook/login', catchAsync(oauthController.facebookLogin));
router.post('/oauth/facebook/register', catchAsync(oauthController.facebookRegister));
router.post('/oauth/linkedin/login', catchAsync(oauthController.linkedinLogin));
router.post('/oauth/linkedin/register', catchAsync(oauthController.linkedinRegister));
router.post('/oauth/microsoft/login', catchAsync(oauthController.microsoftLogin));
router.post('/oauth/microsoft/register', catchAsync(oauthController.microsoftRegister));
router.post('/oauth/apple/login', catchAsync(oauthController.appleLogin));
router.post('/oauth/apple/register', catchAsync(oauthController.appleRegister));

router.get('/verify-email', oauthController.verifyEmailPage);
router.post('/verify-email', catchAsync(oauthController.verifyEmail));

router.get('/reset-password', oauthController.resetPasswordPage);
router.post('/reset-password', catchAsync(oauthController.resetPassword));

module.exports = router;
