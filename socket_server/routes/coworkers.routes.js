const express = require("express");
const router = express();
const CoworkerController = require("../controller/CoworkerController/CoworkerController");
const authenticationMiddleware = require("../middlewares/authMiddleware");

router.get(
  "/",
  authenticationMiddleware.isAuthenticated,
  CoworkerController.getAllCoworkers
);

module.exports = router;
