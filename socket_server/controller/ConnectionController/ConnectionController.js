const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// get coworker requests
const getCoworkerRequest = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(userId),
      },
      include: {
        receivedCoworkerRequests: {
          include: {
            requester: true,
            recipient: true,
          },
        },
      },
    });
    return res.status(200).json({
      message: "Coworker requests",
      coworkerRequests: user.receivedCoworkerRequests,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
// get friend requests
const getFriendRequests = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(userId),
      },
      include: {
        receivedFriendRequests: {
          include: {
            requester: true,
            recipient: true,
          },
        },
      },
    });
    return res.status(200).json({
      message: "Friend requests",
      friendRequests: user.receivedFriendRequests,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
// send coworker request
const sendCoworkerRequest = async (req, res) => {
  try {
    const { requesterId, recipientId } = req.body;

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
// send friend request
const sendFriendRequest = async (req, res) => {
  try {
    const { requesterId, recipientId } = req.body;

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

// accept coworker request
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

// accept friend request
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

// reject coworker request
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

// reject friend request
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

// remove coworker
const removeCoworker = async (req, res) => {
  try {
    const { coworkerId, userId } = req.params;

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

    console.log("relation f:", coworkerRelation1);
    console.log("relation s:", coworkerRelation2);
    return res
      .status(200)
      .json({ message: "Coworker relationship deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// remove friend
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

    console.log("relation f:", friendRelation1);
    console.log("relation s:", friendRelation2);
    return res
      .status(200)
      .json({ message: "Friend relationship deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getCoworkerRequest,
  getFriendRequests,
  sendCoworkerRequest,
  sendFriendRequest,
  acceptCoworkerRequest,
  acceptFriendRequest,
  rejectCoworkerRequest,
  rejectFriendRequest,
  removeCoworker,
  removeFriend,
};
