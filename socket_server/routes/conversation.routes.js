const express = require("express");
const router = express();
const ConversationController = require("../controller/ConversationController/ConversationController");

router.post("/", ConversationController.addConversation);
router.get("/:userId", ConversationController.getConversations);
router.get("/find/:user1Id/:user2Id", ConversationController.getConversation);
module.exports = router;
