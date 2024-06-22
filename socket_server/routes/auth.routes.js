const express = require("express");
const router = express();
const AuthController = require("../controller/AuthController/AuthController");
const authenticationMiddleware = require("../middlewares/authMiddleware");

router.post("/signup", AuthController.authSignup);
router.post(
  "/send-email-verification-code",
  AuthController.handleEmailVerificationCode
);
router.post("/login", AuthController.authLogin);
router.post(
  "/logout",
  authenticationMiddleware.isAuthenticated,
  AuthController.authLogout
);

module.exports = router;
