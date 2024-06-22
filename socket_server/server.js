const express = require("express");
const logger = require("morgan");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const session = require("express-session");
const app = express();
require("dotenv").config();
const corsOptions = {
  origin: "http://localhost:5173", // İstemcinin domaini
  methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: {
      sameSite: "strict",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  })
);

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// routes start to check
const authRoutes = require("./routes/auth.routes");
const verifyUserRoutes = require("./routes/verify_user.routes");
const coworkersRoutes = require("./routes/coworkers.routes");

app.use("/auth", authRoutes);
app.use("/verify_user", verifyUserRoutes);
app.use("/coworkers", coworkersRoutes);
// routes finish to check

io.on("connection", (socket) => {
  console.log("A new user connected :", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected :", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
