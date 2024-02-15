import { useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";
import { BASE_URL } from "./utils";
import { toast } from "sonner";

interface Message {
  id: number;
  content: string;
  username: string;
  timestamp: Date;
}

const App = () => {
  //states
  const [userName, setUserName] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<Socket>();

  //functions
  const handleUsername = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("Start Chatting!");
    setCurrentUser(userName);
    setUserName("");
  };

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message) {
      const newMessage: Message = {
        id: Math.floor(Math.random() * 100000),
        content: message,
        username: currentUser,
        timestamp: new Date(),
      };
      // setMessages([...messages, newMessage]);
      socket?.emit("newMessage", newMessage);
    }
    setMessage("");
  };

  //effects
  useEffect(() => {
    setSocket(io(BASE_URL));
  }, []);

  useEffect(() => {
    if (socket) {
      // Listen for all messages when component mounts
      socket.on("allChats", (allChats) => {
        console.log("allChats", allChats);
        setMessages(allChats);
      });

      // Listen for new messages
      socket.on("newMessage", (message) => {
        console.log("newMessage", message);
        console.log("messages ", messages);
        setMessages([...messages, message]);
      });
      const scrollContainer = document.getElementById("scrollContainer");
      if (scrollContainer) {
        scrollContainer.style.scrollMargin = "3px";
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
      // Cleanup
    }
    return () => {
      socket?.off("allChats");
      socket?.off("newMessage");
    };
  }, [socket, messages]);

  return (
    <div className="bg-slate-900 text-white h-[100vh]">
      <div className="  flex flex-col items-center p-4 py-5">
        {/* starting username form  */}
        {!currentUser ? (
          <>
            <div className="text-2xl font-semibold p-2 m-2">
              WordleCup.io 🏆
            </div>
            <form className=" w-[500px] mt-4" onSubmit={handleUsername}>
              <div className="flex flex-col items-start">
                <label className="text-lg text-semibold">Username</label>
                <input
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  type="text"
                  placeholder="Enter username"
                  className="p-2 my-2 border border-gray-400 rounded w-full"
                />
              </div>
              <button className="border border-gray-400 rounded p-2 my-2 w-full">
                Start Chatting
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="p-2 m-2 text-xl font-semibold">
              WhatsApp Group Chat
            </div>
            {/* chat screen  */}
            <div className=" border border-gray-700 rounded w-full px-4  h-[610px]  flex flex-col justify-end gap-2 py-5">
              {/* messages  */}
              <div
                id="scrollContainer"
                className="scroll rounded border border-gray-700  h-full p-2  overflow-y-scroll scroll-smooth"
              >
                {messages.map((msg: Message) => {
                  return (
                    <div key={msg.id} className="  h-[100px] ">
                      <div className="flex border border-gray-700 rounded gap-2 pt-1 pl-1">
                        <div className="border border-gray-700 bg-pink-400 rounded-full p-4 w-[50px] h-[50px] flex justify-center items-center">
                          {msg.username.charAt(0)}
                        </div>
                        <div className="flex flex-col pt-1 gap-1 justify-center  ">
                          <div className="text-[14px]  font-semibold ">
                            {msg.username}
                          </div>
                          <div className=" ">{msg.content}</div>
                          <div className="   text-[12px]">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* form for entering messages  */}
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-4 border border-gray-700 rounded p-2"
              >
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter message"
                  className="p-2 my-2 border border-gray-400 rounded flex-1"
                />
                <button
                  disabled={!message}
                  className="border border-gray-400 rounded p-2 my-2 w-[200px]"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
