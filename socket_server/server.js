require("dotenv").config();
const express = require("express");
const logger = require("morgan");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");
const corsOptions = {
  origin: "http://localhost:5173", // İstemcinin domaini
  methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(logger("dev"));
app.use(
  express.json({
    limit: "50mb",
  })
);
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1);

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// routes start to check
const authRoutes = require("./routes/auth.routes");
const userVerification = require("./routes/userVerification.routes");
const userRoutes = require("./routes/user.routes");
const conversationRoutes = require("./routes/conversation.routes");
const messageRoutes = require("./routes/message.routes");
const connectionRoutes = require("./routes/connection.routes");

app.use("/auth", authRoutes);
app.use("/user-verify", userVerification);
app.use("/users", userRoutes);
app.use("/conversations", conversationRoutes);
app.use("/messages", messageRoutes);
app.use("/", connectionRoutes);
// routes finish to check

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  console.log("A new user connected :", socket.id);

  //take userId and socketId from user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    console.log("online users:", users);
    io.emit("getUsers", users);
  });

  //send and get message
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    console.log("sender:", senderId, "receiver:", receiverId, "message:", text);
    const user = getUser(receiverId);
    console.log("receiver:", user);
    if (user) {
      io.to(user.socketId).emit("getMessage", {
        senderId,
        text,
      });
    }
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
    console.log("User disconnected :", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
