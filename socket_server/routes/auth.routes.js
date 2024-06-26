const express = require("express");
const router = express();
const AuthController = require("../controller/AuthController/AuthController");
const { userVerification } = require("../middlewares/authMiddleware");

router.post(
  "/send-email-verification-code",
  AuthController.handleEmailVerificationCode
);
router.post("/check-username", AuthController.checkIfUsernameExists);
router.post("/check-email", AuthController.checkIfEmailExists);
router.post("/signup", AuthController.authSignup);
router.post("/login", AuthController.authLogin);
router.post("/logout", AuthController.authLogout);

module.exports = router;
