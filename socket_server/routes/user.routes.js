const router = require("express").Router();
const UserController = require("../controller/UserController/UserController");
const { handleProfilePicture } = require("../util/FileUploader");

router.get("/hello", (req, res) => {
  res.send("hello world user routes !");
});

router.get("/", UserController.getAllUsers);
router.get("/:userId", UserController.getUser);
router.post("/:userId/change_profile_image", handleProfilePicture);

module.exports = router;
