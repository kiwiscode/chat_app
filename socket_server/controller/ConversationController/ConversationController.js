const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const addConversation = async (req, res) => {
  try {
    const { user1Id, user2Id } = req.body;

    if (!user1Id || !user2Id) {
      return res
        .status(400)
        .json({ error: "Both user1Id and user2Id are required." });
    }

    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { members: { some: { id: parseInt(user1Id) } } },
          { members: { some: { id: parseInt(user2Id) } } },
        ],
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

    if (existingConversation) {
      return res.status(200).json(existingConversation);
    }

    const newConversation = await prisma.conversation.create({
      data: {
        members: {
          connect: [{ id: user1Id }, { id: user2Id }],
        },
      },
      include: {
        members: true,
      },
    });

    return res.status(201).json(newConversation);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
const getConversations = async (req, res) => {
  try {
    const userId = req.params.userId;

    const conversations = await prisma.conversation.findMany({
      where: {
        members: {
          some: {
            id: parseInt(userId),
          },
        },
      },
      include: {
        members: true,
        Message: {
          include: {
            sender: true,
            conversation: true,
          },
        },
      },
    });
    res.status(200).json(conversations);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
const getConversation = async (req, res) => {
  try {
    const { user1Id, user2Id } = req.params;

    if (!user1Id || !user2Id) {
      return res
        .status(400)
        .json({ error: "Both user1Id and user2Id are required." });
    }

    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { members: { some: { id: parseInt(user1Id) } } },
          { members: { some: { id: parseInt(user2Id) } } },
        ],
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
    if (existingConversation) {
      return res.status(200).json(existingConversation);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  addConversation,
  getConversations,
  getConversation,
};
