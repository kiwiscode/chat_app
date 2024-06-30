const router = require("express").Router();
const { userVerification } = require("../middlewares/authMiddleware");

router.get("/hello", (req, res) => {
  res.send("hello world user verification route !");
});

router.post("/", userVerification);

module.exports = router;
