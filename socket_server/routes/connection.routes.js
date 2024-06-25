const router = require("express").Router();
const ConnectionController = require("../controller/ConnectionController/ConnectionController");

router.get("/coworker-requests", ConnectionController.getCoworkerRequest);
router.get("/friend-requests", ConnectionController.getFriendRequests);
router.post("/coworker-requests", ConnectionController.sendCoworkerRequest);
router.post("/friend-requests", ConnectionController.sendFriendRequest);
router.post(
  "/coworker-requests/:id/accept",
  ConnectionController.acceptCoworkerRequest
);
router.post(
  "/friend-requests/:id/accept",
  ConnectionController.acceptFriendRequest
);
router.post(
  "/coworker-requests/:id/reject",
  ConnectionController.rejectCoworkerRequest
);
router.post(
  "/friend-requests/:id/reject",
  ConnectionController.rejectFriendRequest
);
router.delete(
  "/coworker/:coworkerId/users/:userId",
  ConnectionController.removeCoworker
);
router.delete(
  "/friend/:friendId/users/:userId",
  ConnectionController.removeFriend
);

// test purposes
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get("/coworkers", async (req, res) => {
  try {
    const coworkers = await prisma.coworker.findMany({
      include: {
        user: true,
      },
    });
    res.status(200).json(coworkers);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
