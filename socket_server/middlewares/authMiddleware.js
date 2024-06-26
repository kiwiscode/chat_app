const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports.userVerification = (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ status: false });
  }
  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, data) => {
    if (err) {
      return res.json({ status: false });
    } else {
      const user = await prisma.user.findUnique({
        where: {
          id: data.id,
        },
        select: {
          id: true,
          email: true,
          username: true,
          active: true,
          createdAt: true,
          updatedAt: true,
          Message: true,
          conversations: true,
          profilePicture: true,
          sentCoworkerRequests: true,
          receivedCoworkerRequests: true,
          sentFriendRequests: true,
          receivedFriendRequests: true,
          coworkers: {
            include: {
              user: true,
            },
          },
          friends: {
            include: {
              user: true,
            },
          },
          Coworker: true,
          Friend: true,
        },
      });
      if (user) return res.json({ status: true, user: user });
      else return res.json({ status: false });
    }
  });
};
