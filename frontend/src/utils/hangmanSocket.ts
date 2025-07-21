import { io } from "socket.io-client";

const hangmanSocket = io(import.meta.env.VITE_NODE_ENV === 'prod' ? "https://the-bench.app:3000/hangman" : "http://localhost:3000/hangman", {
  autoConnect: false,
});

export function registerHangmanGameStartListener(
  handler: (data: { inviteId: string; role: 'giver' | 'guesser' }) => void
) {
  hangmanSocket.off("hangman:gameStarted");
  hangmanSocket.on("hangman:gameStarted", handler);
}

hangmanSocket.on("connect", () => {
  const userId = localStorage.getItem("user-id");
  if (userId) {
    hangmanSocket.emit("join", `user-${userId}`);
  }
});

export default hangmanSocket;