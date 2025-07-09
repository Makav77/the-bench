import { io } from "socket.io-client";

const hangmanSocket = io("http://localhost:3000/hangman", {
  autoConnect: false,
});

export default hangmanSocket;