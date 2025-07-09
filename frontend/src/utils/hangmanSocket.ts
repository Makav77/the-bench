import { io } from "socket.io-client";

const hangmanSocket = io("http://localhost:3000/hangman");

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