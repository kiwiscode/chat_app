import { createContext, useContext, useEffect } from "react";
import { io } from "socket.io-client";
const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

const socket = io("http://localhost:3000/");

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
