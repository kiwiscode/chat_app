const prisma = require("../../util/PrismaConfig");
const addMessage = async (req, res) => {
  try {
    const { conversationId, senderId, message } = req.body;
    const newMessage = await prisma.message.create({
      data: {
        conversationId,
        senderId: senderId,
        text: message,
      },
    });

    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
    });
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found." });
    }
    await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        Message: {
          connect: {
            id: newMessage.id,
          },
        },
      },
    });

    return res.status(200).json(newMessage);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
const getMessages = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    const messages = await prisma.conversation.findFirst({
      where: {
        id: parseInt(conversationId),
      },
      include: {
        members: {
          include: {
            conversations: true,
          },
        },
        Message: {
          include: {
            sender: true,
          },
        },
      },
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  addMessage,
  getMessages,
};
