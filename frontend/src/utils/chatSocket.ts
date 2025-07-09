import { io } from "socket.io-client";

const chatSocket = io("http://localhost:3000", {
  autoConnect: false,
});

export default chatSocket;
