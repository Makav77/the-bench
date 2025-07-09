import { useEffect, useState } from "react";
import { getWords } from "../../api/hangmanService";
import { toast } from "react-toastify";
import HangmanDrawing from "./HangmanDrawing";
import { FriendDTO, getFriends } from "../../api/friendService";
import { fetchMe } from "../../api/authService";
import { getPendingHangmanInvites, respondToHangmanInvite, sendHangmanInvite } from "../../api/hangmanInviteService";
import { useNavigate } from 'react-router-dom';
import hangmanSocket from "../../utils/hangmanSocket";
import { cancelHangmanInvite } from "../../api/hangmanInviteService";

type GameMode = "solo" | "friend" | null;

function HangmanPage() {
  const navigate = useNavigate();
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | null>(null);
  const [word, setWord] = useState<string | null>(null);
  const [noWordsMessage, setNoWordsMessage] = useState<string | null>(null);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [incorrectGuesses, setIncorrectGuesses] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [friends, setFriends] = useState<FriendDTO[]>([]);
  const [invitedFriendId, setInvitedFriendId] = useState<string | null>(null);
  const [waitingTimeLeft, setWaitingTimeLeft] = useState<number>(300);
  const [waitingTimer, setWaitingTimer] = useState<ReturnType<typeof setInterval> | null>(null);
  const [invitedFriendName, setInvitedFriendName] = useState<string | null>(null);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [inviteId, setInviteId] = useState<string | null>(null);

  const maxIncorrect = 7;
  const normalizeLetter = (letter: string) =>
    letter.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const isGameOver = incorrectGuesses >= maxIncorrect;
  const isWin =
    word &&
    word
      .split("")
      .every((c) => guessedLetters.includes(normalizeLetter(c)));

  const handleGuess = (letter: string) => {
    if (!word || guessedLetters.includes(letter) || isGameOver || isWin) return;

    const normalizedWord = normalizeLetter(word);
    const isCorrect = normalizedWord.includes(letter);

    setGuessedLetters((prev) => [...prev, letter]);
    if (!isCorrect) {
      setIncorrectGuesses((prev) => prev + 1);
    }
  };

  const handleInvite = async (friendId: string, fullName: string) => {
    if (!userId) {
      toast.error("User not loaded.");
      return;
    }

    setInvitedFriendId(friendId);
    setInvitedFriendName(fullName);

    try {
      const invite = await sendHangmanInvite(friendId);
      toast.success(`Invitation sent to ${fullName}`);
      setInviteId(invite.id);
    } catch (err) {
      console.error("Failed to send invitation:", err);
      toast.error("Could not invite your friend.");
      setInvitedFriendId(null);
      setInvitedFriendName(null);
      return;
    }

    const timer = setInterval(() => {
      setWaitingTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setInvitedFriendId(null);
          setInvitedFriendName(null);
          return 300;
        }
        return prev - 1;
      });
    }, 1000);

    setWaitingTimer(timer);
  };

  useEffect(() => {
    return () => {
      if (waitingTimer) clearInterval(waitingTimer);
    };
  }, [waitingTimer]);

  useEffect(() => {
    const init = async () => {
      const me = await fetchMe();
      setUserId(me.id);
      setFriends(await getFriends(me.id));
      hangmanSocket.connect();
      hangmanSocket.emit('auth', { userId: me.id });
      hangmanSocket.emit('join', `user-${me.id}`);
    };

    if (gameMode === "friend") {
      init();
    }
  }, [gameMode]);

  const handleRespond = async (inviteId: string, action: "accepted" | "declined") => {
    if (action === "accepted") {
      return handleAccept(inviteId);
    }

    try {
      await respondToHangmanInvite(inviteId, action);
      toast.success(`Invitation ${action}`);
      const updated = await getPendingHangmanInvites();
      setPendingInvites(updated);
    } catch (err) {
      toast.error(`Failed to ${action} invitation.`);
    }
  };

  const handleAccept = async (inviteId: string) => {
    try {
      const res = await respondToHangmanInvite(inviteId, 'accepted');
      if (res.status === 'game_started') {
        localStorage.setItem("hangman-role", res.role);
        navigate(`/hangman/game/${res.inviteId}`);
      }
    } catch (err) {
      toast.error("Failed to accept invite");
    }
  };

  const handleCancel = async (inviteId: string) => {
    try {
      await cancelHangmanInvite(inviteId);
      await toast.success("Invite cancelled.");

      getPendingHangmanInvites();
    } catch (err) {
      toast.error("Failed to cancel invite.");
    }
  };

  useEffect(() => {
    const fetchWord = async () => {
      if (gameMode === "solo" && difficulty !== null) {
        try {
          const words = await getWords();
          const filtered = words.filter((w) => w.difficulty === difficulty);
          if (filtered.length === 0) {
            setNoWordsMessage("No words available for this difficulty.");
            return;
          }

          const random = filtered[Math.floor(Math.random() * filtered.length)];
          setWord(random.word.toLowerCase());
        } catch {
          toast.error("Failed to load words.");
        }
      }
    };

    fetchWord();
  }, [gameMode, difficulty]);

  useEffect(() => {
    const fetchPendingInvites = async () => {
      try {
        const invites = await getPendingHangmanInvites();
        setPendingInvites(invites);
      } catch (err) {
        toast.error("Failed to fetch pending invites.");
      }
    };

    fetchPendingInvites();

    const interval = setInterval(fetchPendingInvites, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleGameStart = ({ inviteId, role }: { inviteId: string; role: 'giver' | 'guesser' }) => {
      localStorage.setItem("hangman-role", role);
      navigate(`/hangman/game/${inviteId}`);
    };

    hangmanSocket.on('hangman:gameStarted', handleGameStart);

    return () => {
      hangmanSocket.off('hangman:gameStarted', handleGameStart);
    };
  }, []);


  return (
    <div className="min-h-screen bg-blue-500 text-black py-12">
      <div className="p-6 max-w-2xl mx-auto space-y-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center">Play Hangman</h1>

        {noWordsMessage && (
          <div className="text-center space-y-2">
            <p className="text-red-600 font-medium">{noWordsMessage}</p>
            <button
              onClick={() => {
                setNoWordsMessage(null);
                setDifficulty(null);
              }}
              className="text-sm text-gray-600 hover:underline cursor-pointer"
            >
              ← Back
            </button>
          </div>
        )}

        {gameMode === null && (
          <div className="flex gap-4 justify-center">
            <button
              className="px-6 py-3 rounded bg-yellow-500 hover:bg-yellow-600 text-white text-lg cursor-pointer"
              onClick={() => setGameMode("solo")}
            >
              Play Solo
            </button>
            <button
              className="px-6 py-3 rounded bg-green-500 hover:bg-green-600 text-white text-lg cursor-pointer"
              onClick={() => setGameMode("friend")}
            >
              Invite a Friend
            </button>
          </div>
        )}

        <div className="bg-yellow-100 p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Pending Hangman Invitations</h2>

          {pendingInvites.length === 0 ? (
            <p className="text-gray-600">No pending invitations.</p>
          ) : (
            <ul className="space-y-1">
              {pendingInvites.map((invite) => (
                <li key={invite.id} className="flex justify-between items-center">
                  <span>
                    From: <strong>{invite.sender.firstname} {invite.sender.lastname}</strong>
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespond(invite.id, "accepted")}
                      className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm cursor-pointer"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespond(invite.id, "declined")}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm cursor-pointer"
                    >
                      Decline
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {gameMode === "solo" && difficulty === null && (
          <div className="flex flex-col gap-4 items-center">
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setDifficulty(1)}
                className="px-4 py-2 bg-blue-200 hover:bg-blue-300 rounded cursor-pointer"
              >
                Easy
              </button>
              <button
                onClick={() => setDifficulty(2)}
                className="px-4 py-2 bg-yellow-200 hover:bg-yellow-300 rounded cursor-pointer"
              >
                Medium
              </button>
              <button
                onClick={() => setDifficulty(3)}
                className="px-4 py-2 bg-red-200 hover:bg-red-300 rounded cursor-pointer"
              >
                Hard
              </button>
            </div>
            <button
              onClick={() => setGameMode(null)}
              className="text-sm text-gray-600 hover:underline cursor-pointer"
            >
              ← Back
            </button>
          </div>
        )}

        {gameMode === "friend" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center">Invite a Friend</h2>

            {invitedFriendId ? (
              <div className="text-center space-y-2">
                <p className="text-blue-600 font-medium">
                  Waiting for {invitedFriendName} to join...
                </p>
                <p className="text-gray-600">
                  Time remaining: {Math.floor(waitingTimeLeft / 60)}:
                  {(waitingTimeLeft % 60).toString().padStart(2, "0")}
                </p>
                <button
                  onClick={async () => {
                    if (invitedFriendId) {
                      try {
                        if (!inviteId) {
                          toast.error("No invite ID available.");
                          return;
                        }

                        await handleCancel(inviteId);
                      } catch (err) {
                      }
                    }

                    setInvitedFriendId(null);
                    setWaitingTimeLeft(300);
                    if (waitingTimer) clearInterval(waitingTimer);
                  }}
                  className="text-sm text-gray-600 hover:underline cursor-pointer"
                >
                  Cancel Invitation
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 items-center">
                {friends.length === 0 && <p className="text-gray-500">You have no friends to invite.</p>}
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between w-full max-w-md border p-3 rounded shadow-sm bg-gray-50"
                  >
                    <span>{friend.firstname} {friend.lastname}</span>
                    <button
                      onClick={() => handleInvite(friend.id, `${friend.firstname} ${friend.lastname}`)}
                      disabled={!!invitedFriendId}
                      className="px-4 py-1 rounded bg-green-500 hover:bg-green-600 text-white text-sm cursor-pointer disabled:bg-gray-300"
                    >
                      Invite
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setGameMode(null)}
                  className="mt-4 text-sm text-gray-600 hover:underline cursor-pointer"
                >
                  ← Back
                </button>
              </div>
            )}
          </div>
        )}

        {gameMode === "solo" && difficulty !== null && word && (
          <div className="text-center space-y-4">
            <HangmanDrawing incorrectGuesses={incorrectGuesses} />
            <p className="text-lg font-medium">
              Difficulty: {["Easy", "Medium", "Hard"][difficulty - 1]}
            </p>

            <div className="text-2xl font-mono tracking-widest">
              {word.split("").map((char, idx) => {
                const normalizedChar = normalizeLetter(char);
                return guessedLetters.includes(normalizedChar) || isGameOver || isWin ? (
                  <span key={idx}>{char.toUpperCase()} </span>
                ) : (
                  <span key={idx}>_ </span>
                );
              })}
            </div>

            <p className="text-gray-600">Wrong guesses: {incorrectGuesses} / {maxIncorrect}</p>

            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {"abcdefghijklmnopqrstuvwxyz".split("").map((letter) => (
                <button
                  key={letter}
                  onClick={() => handleGuess(letter)}
                  disabled={!!(guessedLetters.includes(letter) || isGameOver || isWin)}
                  className={`w-8 h-8 border rounded text-lg cursor-pointer ${guessedLetters.includes(letter)
                    ? "bg-gray-300 cursor-not-allowed"
                    : "hover:bg-blue-100"
                    }`}
                >
                  {letter}
                </button>
              ))}
            </div>

            <p className="text-sm text-gray-500 italic mt-2">
              Tip: Accented letters can be guessed using their base letter. For example: <strong>é → e</strong>, <strong>ç → c</strong>
            </p>

            {isWin && <p className="text-green-600 font-bold">You Win!</p>}
            {isGameOver && <p className="text-red-600 font-bold">You Lost. The word was "{word}"</p>}

            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => {
                  setWord(null);
                  setGuessedLetters([]);
                  setIncorrectGuesses(0);
                  setDifficulty(null);
                }}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded cursor-pointer"
              >
                ↺ Restart
              </button>
              <button
                onClick={() => {
                  setWord(null);
                  setGuessedLetters([]);
                  setIncorrectGuesses(0);
                  setDifficulty(null);
                  setGameMode(null);
                }}
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded cursor-pointer"
              >
                ← Main Menu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HangmanPage;
