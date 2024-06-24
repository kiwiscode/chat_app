const express = require("express");
const router = express();
const { userVerification } = require("../middlewares/authMiddleware");

router.post("/", userVerification);

module.exports = router;
