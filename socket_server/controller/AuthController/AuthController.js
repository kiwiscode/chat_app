const bcrypt = require("bcrypt");
const saltRounds = 10;
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { createSecretToken } = require("../../util/SecretToken");
require("dotenv").config();
let sendVerificationCodeToEmail;
emailProcess();

function emailProcess() {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.AUTH_EMAIL,
      pass: process.env.AUTH_PASSWORD,
    },
  });

  transporter.verify((error, success) => {
    if (error) {
      console.error(error);
    } else {
      console.log(success);
    }
  });

  sendVerificationCodeToEmail = (email, verificationCode) => {
    return new Promise((resolve, reject) => {
      const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: `${verificationCode} is your chatswift verification code`,
        html: `
        <div style="background-color: #f6f8fa
        ;  text-align: center;">
        <div style="width: 40%; height: 100%; background-color: white; margin: 0 auto; text-align: left; color: #333; padding: 20px;">
            <h1>Confirm your email address</h1>
            <p>There’s one quick step you need to complete before creating your chatswift account. Let’s make sure this is the right email address for you — please confirm this is the right address to use for your new account.</p>
            <p>Please enter this verification code to get started on chatswift:</p>
            <strong style="font-size: 18px; padding: 10px; background-color: #ddd; border-radius: 5px; display: inline-block;">${verificationCode}</strong>
            <p>Verification codes expire after two hours.</p>
            <p>Thanks,</p>
            <p>chatswift</p>
        </div>
    </div>
          `,
      };

      transporter
        .sendMail(mailOptions)
        .then(() => {
          resolve({
            status: "PENDING",
            message: "Verification email sent",
          });
        })
        .catch((error) => {
          console.error("Error sending email:", error);
          reject({
            status: "FAILED",
            message: "Verification email failed!",
          });
        });
    });
  };
}

const handleEmailVerificationCode = (req, res) => {
  const { receiverEmail } = req.body;

  let randomCode = [];

  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  const generateRandomCode = () => {
    const randomIndex = Math.floor(Math.random() * characters.length + 1);

    return randomIndex;
  };

  for (let i = 0; i < 6; i++) {
    randomCode.push(characters[generateRandomCode()]);
  }

  console.log("Random code =>", randomCode.join(""));

  console.log("Email received =>", receiverEmail);
  sendVerificationCodeToEmail(receiverEmail, randomCode.join(""))
    .then((result) => {
      console.log("RESULT AFTER EMAIL VERIFICATION SEND =>", result);

      res.status(201).json({
        code: randomCode.join(""),
        message: "Verification code to email sent",
      });
    })
    .catch((error) => {
      console.log("ERROR SENDING VERIFICATION EMAIL =>", error);
      res.status(500).json({
        errorMessage: "Error sending verification email.",
      });
    });
};

const authSignup = async (req, res) => {
  try {
    const { username, email, password } = req.body.formData;
    const checkUserName = username.toLowerCase();
    const checkEmail = email.toLowerCase();
    console.log(username, email, password);

    if (!username || !email || !password) {
      res.status(403).json({
        errorMessage:
          "All fields are mandatory.Please provide username,email, and password",
      });
      return;
    }
    let countSpaces = 0;
    for (let i = 0; i < username.length; i++) {
      if (username[i] === " ") {
        countSpaces++;
      }
    }

    // Check if username is valid
    if (username.length < 4 || username.length > 15 || /\s/.test(username)) {
      return res.status(400).json({
        errorMessage:
          "Username must be between 4 and 15 characters without spaces.",
      });
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        username: checkUserName,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        errorMessage:
          "Username already exists. Please choose a different username.",
        usernameError: true,
      });
    }
    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: {
        email: checkEmail,
      },
    });

    if (existingEmail) {
      return res.status(409).json({
        errorMessage: "Email already exists. Please use a different email.",
        emailError: true,
      });
    }
    const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
    if (!regex.test(password) || password.length < 8) {
      res.status(402).json({
        errorMessage:
          "Password needs to have at least 8 chars and must contain at least one number, one lowercase and one uppercase letter.",
      });
      return;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });
    const token = createSecretToken(user.id);
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });

    res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      message: "An error occurred while creating user. Please try again later.",
    });
  }
};

const authLogin = async (req, res) => {
  try {
    const { authentication, password } = req.body.loginFormData;

    console.log("password:", password);
    const authenticationExistWithEmail = await prisma.user.findUnique({
      where: {
        email: authentication,
      },
    });
    const authenticationExistWithUsername = await prisma.user.findUnique({
      where: {
        username: authentication,
      },
    });

    const user =
      authenticationExistWithEmail || authenticationExistWithUsername;

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!user) {
      return res.status(401).json({
        authenticationError: true,
        message: "Invalid username or email",
      });
    }
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ passwordError: true, message: "Wrong password" });
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        active: true,
      },
    });

    const token = createSecretToken(user.id);
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });

    return res
      .status(200)
      .json({ message: "User logged in successfully", token, user });
  } catch (error) {
    console.error("Error:", error);
  }
};

const authLogout = async (req, res) => {
  try {
    const { id } = req.body;
    await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        active: false,
      },
    });

    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error while user logging out:", error);
    res.status(500).json({
      message:
        "An error occurred while user logging out . Please try again later.",
    });
  }
};

module.exports = {
  authSignup,
  handleEmailVerificationCode,
  authLogin,
  authLogout,
};
