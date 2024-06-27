const router = require("express").Router();
const ConversationController = require("../controller/ConversationController/ConversationController");

router.post("/", ConversationController.addConversation);
router.get("/:userId", ConversationController.getConversations);
router.get("/find/:user1Id/:user2Id", ConversationController.getConversation);
module.exports = router;
