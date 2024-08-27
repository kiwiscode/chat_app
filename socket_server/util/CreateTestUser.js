const bcrypt = require("bcrypt");
const saltRounds = 10;
const prisma = require("../util/PrismaConfig");

const createTestUser = async () => {
  // Predefined users
  const users = [
    {
      username: "testuser1",
      email: "testuser1@test.com",
      password: "Testuser1.",
    },
    {
      username: "testuser2",
      email: "testuser2@test.com",
      password: "Testuser2.",
    },
    {
      username: "testuser3",
      email: "testuser3@test.com",
      password: "Testuser3.",
    },
    {
      username: "testuser4",
      email: "testuser4@test.com",
      password: "Testuser4.",
    },
    {
      username: "testuser5",
      email: "testuser5@test.com",
      password: "Testuser5.",
    },
    {
      username: "testuser6",
      email: "testuser6@test.com",
      password: "Testuser6.",
    },
    {
      username: "testuser7",
      email: "testuser7@test.com",
      password: "Testuser7.",
    },
    {
      username: "testuser8",
      email: "testuser8@test.com",
      password: "Testuser8.",
    },
    {
      username: "testuser9",
      email: "testuser9@test.com",
      password: "Testuser9.",
    },
    {
      username: "testuser10",
      email: "testuser10@test.com",
      password: "Testuser10.",
    },
    {
      username: "testuser11",
      email: "testuser11@test.com",
      password: "Testuser11.",
    },
    {
      username: "testuser12",
      email: "testuser12@test.com",
      password: "Testuser12.",
    },
    {
      username: "testuser13",
      email: "testuser13@test.com",
      password: "Testuser13.",
    },
    {
      username: "testuser14",
      email: "testuser14@test.com",
      password: "Testuser14.",
    },
    {
      username: "testuser15",
      email: "testuser15@test.com",
      password: "Testuser15.",
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
