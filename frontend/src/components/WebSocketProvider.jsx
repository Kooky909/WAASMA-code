import React, { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

export const WebSocketContext = createContext(null);

const SOCKET_SERVER_URL = "http://localhost:5000"; // Adjust if needed

const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketInstance = io(SOCKET_SERVER_URL, { transports: ["websocket"] });
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Connected to WebSocket");
    });

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from WebSocket");
    });

    return () => {
      socketInstance.disconnect(); // Cleanup on unmount
    };
  }, []);

  return (
    <WebSocketContext.Provider value={socket}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;