const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports.userVerification = (req, res) => {
  console.log("We are here ");
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
      });
      if (user) return res.json({ status: true, user: user });
      else return res.json({ status: false });
    }
  });
};
