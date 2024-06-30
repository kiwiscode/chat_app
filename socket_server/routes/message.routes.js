const router = require("express").Router();
const MessageController = require("../controller/MessageController/MessageController");

router.get("/hello", (req, res) => {
  res.send("hello world message routes !");
});

router.post("/", MessageController.addMessage);
router.get("/:conversationId", MessageController.getMessages);

module.exports = router;
