const bcrypt = require("bcrypt");
const saltRounds = 10;
const prisma = require("../util/PrismaConfig");

const createTestUser = async () => {
  // Predefined users
  const users = [
    {
      username: "testuser16",
      email: "testuser16@test.com",
      password: "Testuser16.",
    },
    {
      username: "testuser17",
      email: "testuser17@test.com",
      password: "Testuser17.",
    },
    {
      username: "testuser18",
      email: "testuser18@test.com",
      password: "Testuser18.",
    },
    {
      username: "testuser19",
      email: "testuser19@test.com",
      password: "Testuser19.",
    },
    {
      username: "testuser20",
      email: "testuser20@test.com",
      password: "Testuser20.",
    },
    {
      username: "testuser21",
      email: "testuser21@test.com",
      password: "Testuser21.",
    },
    {
      username: "testuser22",
      email: "testuser22@test.com",
      password: "Testuser22.",
    },
    {
      username: "testuser23",
      email: "testuser23@test.com",
      password: "Testuser23.",
    },
    {
      username: "testuser24",
      email: "testuser24@test.com",
      password: "Testuser24.",
    },
    {
      username: "testuser25",
      email: "testuser25@test.com",
      password: "Testuser25.",
    },
    {
      username: "testuser26",
      email: "testuser26@test.com",
      password: "Testuser26.",
    },
    {
      username: "testuser27",
      email: "testuser27@test.com",
      password: "Testuser27.",
    },
    {
      username: "testuser28",
      email: "testuser28@test.com",
      password: "Testuser28.",
    },
    {
      username: "testuser29",
      email: "testuser29@test.com",
      password: "Testuser29.",
    },
    {
      username: "testuser30",
      email: "testuser30@test.com",
      password: "Testuser30.",
    },
  ];

  try {
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, saltRounds);
      await prisma.user.create({
        data: {
          username: user.username.toLowerCase(),
          email: user.email.toLowerCase(),
          password: hashedPassword,
        },
      });
      console.log(`User ${user.username} created successfully`);
    }
    console.log("15 test users created successfully.");
  } catch (error) {
    console.error("Error creating test users:", error);
  }
};

module.exports = {
  createTestUser,
};
