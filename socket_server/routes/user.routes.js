const express = require("express");
const router = express();
const UserController = require("../controller/UserController/UserController");
const { userVerification } = require("../middlewares/authMiddleware");
const { handleProfilePicture } = require("../util/FileUploader");

router.get("/", UserController.getAllUsers);
router.get("/:userId", UserController.getUser);
router.post("/change_profile_image", handleProfilePicture);
router.post("/change_profile_image", handleProfilePicture);

module.exports = router;
