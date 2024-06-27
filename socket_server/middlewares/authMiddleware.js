const jwt = require("jsonwebtoken");
const prisma = require("../util/PrismaConfig");

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
      if (user) return res.json({ status: true, user: user });
      else return res.json({ status: false });
    }
  });
};
