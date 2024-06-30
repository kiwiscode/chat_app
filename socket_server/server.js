require("dotenv").config();

const PORT = process.env.PORT || 3000;
const logger = require("morgan");
const express = require("express");
const app = express();
const cors = require("cors");
const socketIo = require("socket.io");
const http = require("http");
const server = http.createServer(app);
const FRONTEND_URL = process.env.FRONTEND_URL;

const corsOptions = {
  origin: `${FRONTEND_URL}`,
  methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
};

const io = socketIo(server, {
  cors: {
    origin: `${FRONTEND_URL}`,
    methods: ["GET", "POST"],
  },
});

app.use(cors(corsOptions));
app.use(logger("dev"));
app.use(
  express.json({
    limit: "50mb",
  })
);
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1);

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

  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    console.log("online users:", users);
    io.emit("getUsers", users);
  });

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

server.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
