import { createContext, useContext, useEffect } from "react";
import { io } from "socket.io-client";
import config from "../config/config";
const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

const socket = io(config.backendUrl);

export const SocketProvider = ({ children }) => {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to socket server:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
