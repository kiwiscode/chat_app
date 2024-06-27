const router = require("express").Router();
const { userVerification } = require("../middlewares/authMiddleware");

router.post("/", userVerification);

module.exports = router;
