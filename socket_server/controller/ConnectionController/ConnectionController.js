const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getCoworkerRequests = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(userId),
      },
      include: {
        receivedCoworkerRequests: {
          where: {
            status: "pending",
          },
          include: {
            requester: true,
            recipient: true,
          },
        },
        sentCoworkerRequests: true,
      },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      message: "Coworker requests",
      coworkerRequests: user.receivedCoworkerRequests,
      sentCoworkerRequests: user.sentCoworkerRequests,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
const getFriendRequests = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(userId),
      },
      include: {
        receivedFriendRequests: {
          where: {
            status: "pending",
          },
          include: {
            requester: true,
            recipient: true,
          },
        },
        sentFriendRequests: true,
      },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json({
      message: "Friend requests",
      friendRequests: user.receivedFriendRequests,
      sentFriendRequests: user.sentFriendRequests,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
const sendCoworkerRequest = async (req, res) => {
  try {
    const { requesterId, recipientId } = req.body;

    const isAlreadyCoworker = await prisma.coworker.findFirst({
      where: {
        OR: [
          {
            userId: requesterId,
            coworkerId: recipientId,
          },
          {
            userId: recipientId,
            coworkerId: requesterId,
          },
        ],
      },
    });

    if (isAlreadyCoworker) {
      return res
        .status(400)
        .json({ error: "These users are already coworkers." });
    }

    const existingRequest = await prisma.coworkerRequest.findFirst({
      where: {
        requesterId,
        recipientId,
        status: "pending",
      },
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ error: "There is already a pending coworker request." });
    }

    const reverseRequest = await prisma.coworkerRequest.findFirst({
      where: {
        requesterId: recipientId,
        recipientId: requesterId,
        status: "pending",
      },
    });

    if (reverseRequest) {
      await prisma.coworkerRequest.update({
        where: {
          id: reverseRequest.id,
        },
        data: {
          status: "accepted",
        },
      });

      await prisma.coworker.create({
        data: {
          userId: requesterId,
          coworkerId: recipientId,
        },
      });
      await prisma.coworker.create({
        data: {
          userId: recipientId,
          coworkerId: requesterId,
        },
      });

      return res.status(200).json({
        status: "reverse_request_accepted",
        message:
          "This user has already sent you a request and you have accepted it.",
        reverseRequest: reverseRequest,
      });
    }

    const newRequest = await prisma.coworkerRequest.create({
      data: {
        requesterId,
        recipientId,
        status: "pending",
      },
    });
    return res.status(200).json({
      message: "Coworker request sent successfully",
      request: newRequest,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
const sendFriendRequest = async (req, res) => {
  try {
    const { requesterId, recipientId } = req.body;

    const isAlreadyFriend = await prisma.friend.findFirst({
      where: {
        OR: [
          {
            userId: requesterId,
            friendId: recipientId,
          },
          {
            userId: recipientId,
            friendId: requesterId,
          },
        ],
      },
    });

    if (isAlreadyFriend) {
      return res
        .status(400)
        .json({ error: "These users are already friends." });
    }

    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        requesterId,
        recipientId,
        status: "pending",
      },
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ error: "There is already a pending friend request." });
    }

    const reverseRequest = await prisma.friendRequest.findFirst({
      where: {
        requesterId: recipientId,
        recipientId: requesterId,
        status: "pending",
      },
    });

    if (reverseRequest) {
      await prisma.friendRequest.update({
        where: {
          id: reverseRequest.id,
        },
        data: {
          status: "accepted",
        },
      });

      await prisma.friend.create({
        data: {
          userId: requesterId,
          friendId: recipientId,
        },
      });

      await prisma.friend.create({
        data: {
          userId: recipientId,
          friendId: requesterId,
        },
      });

      return res.status(200).json({
        status: "reverse_request_accepted",
        message:
          "This user has already sent you a request and you have accepted it.",
        reverseRequest: reverseRequest,
      });
    }

    const newRequest = await prisma.friendRequest.create({
      data: {
        requesterId,
        recipientId,
        status: "pending",
      },
    });
    return res.status(200).json({
      message: "Friend request sent successfully",
      request: newRequest,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
const cancelCoworkerRequest = async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const deletedRequest = await prisma.coworkerRequest.delete({
      where: {
        id: parseInt(requestId),
      },
    });

    if (!deletedRequest) {
      return res.status(404).json({ error: "Coworker request not found" });
    }
    res.status(200).json({ message: "Coworker request canceled successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
const cancelFriendRequest = async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const deletedRequest = await prisma.friendRequest.delete({
      where: {
        id: parseInt(requestId),
      },
    });
    if (!deletedRequest) {
      return res.status(404).json({ error: "Friend request not found" });
    }
    res.status(200).json({ message: "Friend request canceled successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
const acceptCoworkerRequest = async (req, res) => {
  try {
    const { requesterId, recipientId } = req.body;
    const id = req.params.id;

    const coworkerRequest = await prisma.coworkerRequest.findFirst({
      where: {
        id: parseInt(id),
        requesterId: requesterId,
        recipientId: recipientId,
        status: "pending",
      },
    });

    if (!coworkerRequest) {
      return res
        .status(404)
        .json({ error: "Coworker request not found or already accepted" });
    }

    const updatedRequest = await prisma.coworkerRequest.update({
      where: {
        id: parseInt(id),
      },
      data: {
        status: "accepted",
      },
    });

    await prisma.coworker.create({
      data: {
        userId: requesterId,
        coworkerId: recipientId,
      },
    });
    await prisma.coworker.create({
      data: {
        userId: recipientId,
        coworkerId: requesterId,
      },
    });

    return res.status(200).json({
      message: "Coworker request accepted successfully",
      request: updatedRequest,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
const acceptFriendRequest = async (req, res) => {
  try {
    const { requesterId, recipientId } = req.body;
    const id = req.params.id;

    const friendRequest = await prisma.friendRequest.findFirst({
      where: {
        id: parseInt(id),
        requesterId: requesterId,
        recipientId: recipientId,
        status: "pending",
      },
    });

    if (!friendRequest) {
      return res
        .status(404)
        .json({ error: "Friend request not found or already accepted" });
    }

    const updatedRequest = await prisma.friendRequest.update({
      where: {
        id: parseInt(id),
      },
      data: {
        status: "accepted",
      },
    });

    await prisma.friend.create({
      data: {
        userId: requesterId,
        friendId: recipientId,
      },
    });
    await prisma.friend.create({
      data: {
        userId: recipientId,
        friendId: requesterId,
      },
    });

    return res.status(200).json({
      message: "Friend request accepted successfully",
      request: updatedRequest,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
const rejectCoworkerRequest = async (req, res) => {
  try {
    const { requesterId, recipientId } = req.body;
    const id = req.params.id;
    const coworkerRequest = await prisma.coworkerRequest.findFirst({
      where: {
        id: parseInt(id),
        requesterId: requesterId,
        recipientId: recipientId,
        status: "pending",
      },
    });
    if (!coworkerRequest) {
      return res
        .status(404)
        .json({ error: "Coworker request not found or already processed" });
    }
    const updatedRequest = await prisma.coworkerRequest.update({
      where: {
        id: parseInt(id),
      },
      data: {
        status: "rejected",
      },
    });
    return res.status(200).json({
      message: "Coworker request rejected successfully",
      request: updatedRequest,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
const rejectFriendRequest = async (req, res) => {
  try {
    const { requesterId, recipientId } = req.body;
    const id = req.params.id;
    const friendRequest = await prisma.friendRequest.findFirst({
      where: {
        id: parseInt(id),
        requesterId: requesterId,
        recipientId: recipientId,
        status: "pending",
      },
    });

    if (!friendRequest) {
      return res
        .status(404)
        .json({ error: "Friend request not found or already processed" });
    }

    const updatedRequest = await prisma.friendRequest.update({
      where: {
        id: parseInt(id),
      },
      data: {
        status: "rejected",
      },
    });
    return res.status(200).json({
      message: "Friend request rejected successfully",
      request: updatedRequest,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
const removeCoworker = async (req, res) => {
  try {
    const userId = req.params.userId;
    const coworkerId = req.params.coworkerId;

    const coworkerRelation1 = await prisma.coworker.findFirst({
      where: {
        userId: parseInt(userId),
        coworkerId: parseInt(coworkerId),
      },
    });

    const coworkerRelation2 = await prisma.coworker.findFirst({
      where: {
        userId: parseInt(coworkerId),
        coworkerId: parseInt(userId),
      },
    });

    if (!coworkerRelation1 || !coworkerRelation2) {
      return res.status(404).json({ error: "Coworker relationship not found" });
    }

    await prisma.coworker.delete({
      where: {
        id: coworkerRelation1.id,
      },
    });

    await prisma.coworker.delete({
      where: {
        id: coworkerRelation2.id,
      },
    });

    return res
      .status(200)
      .json({ message: "Coworker relationship deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
const removeFriend = async (req, res) => {
  try {
    const { friendId, userId } = req.params;

    const friendRelation1 = await prisma.friend.findFirst({
      where: {
        userId: parseInt(userId),
        friendId: parseInt(friendId),
      },
    });

    const friendRelation2 = await prisma.friend.findFirst({
      where: {
        userId: parseInt(friendId),
        friendId: parseInt(userId),
      },
    });

    if (!friendRelation1 || !friendRelation2) {
      return res.status(404).json({ error: "Friend relationship not found" });
    }

    await prisma.friend.delete({
      where: {
        id: friendRelation1.id,
      },
    });

    await prisma.friend.delete({
      where: {
        id: friendRelation2.id,
      },
    });

    return res
      .status(200)
      .json({ message: "Friend relationship deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getCoworkerRequests,
  getFriendRequests,
  sendCoworkerRequest,
  sendFriendRequest,
  cancelCoworkerRequest,
  cancelFriendRequest,
  acceptCoworkerRequest,
  acceptFriendRequest,
  rejectCoworkerRequest,
  rejectFriendRequest,
  removeCoworker,
  removeFriend,
};
