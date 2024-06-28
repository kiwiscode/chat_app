const router = require("express").Router();
const ConnectionController = require("../controller/ConnectionController/ConnectionController");

router.get("/hello", (req, res) => {
  res.send("hello world connection routes !");
});

router.get(
  "/:userId/coworker-requests",
  ConnectionController.getCoworkerRequests
);
router.get("/:userId/friend-requests", ConnectionController.getFriendRequests);
router.post("/coworker-requests", ConnectionController.sendCoworkerRequest);
router.post("/friend-requests", ConnectionController.sendFriendRequest);
router.delete(
  "/coworker-requests/:requestId",
  ConnectionController.cancelCoworkerRequest
);
router.delete(
  "/friend-requests/:requestId",
  ConnectionController.cancelFriendRequest
);

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

module.exports = router;
