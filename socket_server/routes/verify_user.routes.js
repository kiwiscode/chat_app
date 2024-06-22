const express = require("express");
const router = express.Router();

const authenticationMiddleware = require("../middlewares/authMiddleware");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get("/", authenticationMiddleware.isAuthenticated, async (req, res) => {
  try {
    const { id } = req.user;

    const authenticationUserWithId = await prisma.users.findUnique({
      where: {
        id: id,
      },
    });

    if (!authenticationUserWithId) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (!authenticationUserWithId.active) {
      return res.status(403).json({
        message: "User is not active.",
      });
    }

    res.json({
      token: req.session.token,
      user: authenticationUserWithId,
    });
    console.log("User:", authenticationUserWithId);
    console.log("req.session:", req.session);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      message: "Internal server error.",
    });
  }
});

module.exports = router;
