const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        conversations: true,
        profilePicture: true,
        sentCoworkerRequests: {
          include: {
            recipient: true,
            requester: true,
          },
        },
        receivedCoworkerRequests: {
          include: {
            recipient: true,
            requester: true,
          },
        },
        sentFriendRequests: {
          include: {
            recipient: true,
            requester: true,
          },
        },
        receivedFriendRequests: {
          include: {
            recipient: true,
            requester: true,
          },
        },
        coworkers: {
          include: {
            coworker: true,
            user: true,
          },
        },
        friends: {
          include: {
            friend: true,
            user: true,
          },
        },
      },
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error while fetching users:", error);
    res.status(500).json({
      message:
        "An error occurred while fetching users . Please try again later.",
    });
  }
};
const getUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(userId),
      },
      select: {
        id: true,
        email: true,
        username: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        conversations: true,
        profilePicture: true,
        sentCoworkerRequests: {
          include: {
            recipient: true,
            requester: true,
          },
        },
        receivedCoworkerRequests: {
          include: {
            recipient: true,
            requester: true,
          },
        },
        sentFriendRequests: {
          include: {
            recipient: true,
            requester: true,
          },
        },
        receivedFriendRequests: {
          include: {
            recipient: true,
            requester: true,
          },
        },
        coworkers: {
          include: {
            coworker: true,
            user: true,
          },
        },
        friends: {
          include: {
            friend: true,
            user: true,
          },
        },
      },
    });

    res.status(200).json(user);
  } catch (error) {
    console.error("Error while fetching user:", error);
    res.status(500).json({
      message:
        "An error occurred while fetching user . Please try again later.",
    });
  }
};

module.exports = {
  getAllUsers,
  getUser,
};
