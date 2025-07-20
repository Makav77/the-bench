import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_NODE_ENV === 'prod' ? "https://the-bench.app:3000" : "http://localhost:3000", {
  autoConnect: false,
});

export default socket;
