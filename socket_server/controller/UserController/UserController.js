const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();

    res.status(200).json(users);
  } catch (error) {
    console.error("Error while fetching users:", error);
    res.status(500).json({
      message:
        "An error occurred while fetching users . Please try again later.",
    });
  }
};

module.exports = {
  getAllUsers,
};
