const router = require("express").Router();
const AuthController = require("../controller/AuthController/AuthController");

router.get("/hello", (req, res) => {
  res.send("hello world auth !");
});

router.post("/check-username", AuthController.checkIfUsernameExists);
router.post("/check-email", AuthController.checkIfEmailExists);
router.post(
  "/send-email-verification-code",
  AuthController.handleEmailVerificationCode
);
router.post("/signup", AuthController.authSignup);
router.post("/login", AuthController.authLogin);
router.post("/logout", AuthController.authLogout);

module.exports = router;
