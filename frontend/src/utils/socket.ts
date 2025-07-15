import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_NODE_ENV === 'prod' ? "http://209.38.138.250:3000" : "http://localhost:3000", {
  autoConnect: false,
});

export default socket;
