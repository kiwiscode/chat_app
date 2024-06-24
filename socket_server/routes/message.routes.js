const router = require("express").Router();
const MessageController = require("../controller/MessageController/MessageController");

router.post("/", MessageController.addMessage);
router.get("/:conversationId", MessageController.getMessages);

module.exports = router;
