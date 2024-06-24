import { useEffect, useRef, useState } from "react";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSocket } from "../../context/SocketContext";

const API_URL = "http://localhost:3000";

function Dashboard() {
  const { user } = useUser();
  const navigate = useNavigate();
  useEffect(() => {
    console.log("user from dashboard page:", user);
    if (user) {
      navigate("/dashboard");
    }
  }, [user]);
  const [show, setShow] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");

  const openSearchModalForUsers = () => {
    setShow(!show);
  };
  const handleInputChange = (e) => {
    setSearchInput(e.target.value);
  };
  const handleInputClick = (e) => {
    e.stopPropagation();
  };

  const handleFilteredUserClick = (e) => {
    e.stopPropagation();
  };

  // chatting conversation start to check

  const getAllUsers = async () => {
    try {
      const result = await axios.get(`${API_URL}/users`, {
        withCredentials: true,
      });

      console.log("result:", result);
      setUsers(result.data);
    } catch (error) {
      console.error("error:", error);
      throw error;
    }
  };

  const filterUsers = (array, searchStr) => {
    const toLowerCaseSearchStr = searchStr.toLowerCase();

    const filteredArray = array.filter((eachUser) => {
      return (
        eachUser.username.toLowerCase().startsWith(toLowerCaseSearchStr) &&
        eachUser.username !== user.username
      );
    });

    setFilteredUsers(filteredArray);
  };

  useEffect(() => {
    if (searchInput) {
      filterUsers(users, searchInput);
    } else {
      setFilteredUsers(null);
    }
  }, [searchInput]);

  useEffect(() => {
    getAllUsers();
  }, []);

  // chatting conversation finish to check
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [conversation, setConversation] = useState([]);
  const scrollRef = useRef();

  // add conversation
  const addConversation = async (eachUser) => {
    try {
      const result = await axios.post(
        `${API_URL}/conversations`,
        {
          user1Id: user?.id,
          user2Id: eachUser?.id,
        },
        {
          withCredentials: true,
        }
      );
      setSelectedUser(eachUser);
      setConversationId(result.data.id);

      console.log("result conversation:", result);
    } catch (error) {
      console.log("error:", error);
      throw error;
    }
  };

  // send message
  const sendMessage = async () => {
    try {
      const result = await axios.post(
        `${API_URL}/messages`,
        {
          conversationId: conversationId || conversation.id,
          senderId: user?.id,
          message,
        },
        {
          withCredentials: true,
        }
      );
      getMessages();
      setMessage("");

      socket.emit("sendMessage", {
        senderId: user?.id,
        receiverId: selectedUser?.id,
        text: message,
      });

      console.log("result conversation:", result);
    } catch (error) {
      console.log("error:", error);
      throw error;
    }
  };

  // get conversations
  const getConversations = async () => {
    try {
      const result = await axios.get(`${API_URL}/conversations/${user?.id}`, {
        withCredentials: true,
      });

      setConversations(result.data);
    } catch (error) {
      console.log("error:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (user?.id) {
      getConversations();
    }
  }, [user?.id]);

  const findMemberNotEqualUser = (array) => {
    const filteredArray = array?.filter((eachMember) => {
      return eachMember?.id !== user?.id;
    });

    return filteredArray;
  };

  // get conv includes two userId
  const getConversation = async (selectedUser) => {
    try {
      const result = await axios.get(
        `${API_URL}/conversations/find/${user?.id}/${selectedUser?.id}`,
        {
          withCredentials: true,
        }
      );

      console.log("result conversation:", result.data);
      setSelectedUser(selectedUser);
      setConversation(result.data);
    } catch (error) {
      console.log("error:", error);
      throw error;
    }
  };

  // get messages

  const getMessages = async () => {
    try {
      const result = await axios.get(
        `${API_URL}/messages/${conversationId || conversation.id}`,
        {
          withCredentials: true,
        }
      );
      setConversation(result.data);
    } catch (error) {
      console.log("error:", error);
      throw error;
    }
  };
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.Message]);

  // real time message
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socket = useSocket();

  useEffect(() => {
    socket.emit("addUser", user?.id);
    socket.on("getUsers", (users) => {
      setOnlineUsers(users);
    });
  }, [user]);

  useEffect(() => {
    socket.on("getMessage", (data) => {
      console.log("data socket:", data);

      setConversation((prev) => ({
        ...prev,
        Message: [
          ...prev.Message,
          { sender: data.senderId, text: data.text, createdAt: Date.now() },
        ],
      }));
    });
  }, [socket]);

  return (
    <>
      <div
        className="chirp-bold-font fs-23 lh-28 color-dark-text"
        style={{
          display: "inline",
          paddingLeft: "12px",
        }}
      >
        Chats
      </div>
      <div
        className="h-100 dflex algncenter"
        style={{
          justifyContent: "flex-start",
        }}
      >
        {" "}
        <div
          className="bt-1px"
          style={{
            maxWidth: "350px",
            width: "25%",
            height: "100%",
          }}
        >
          <div
            style={{
              marginTop: "12px",
            }}
          >
            <div>
              {conversations?.length ? (
                <div>
                  {conversations.map((eachConv) => {
                    return (
                      <div
                        onClick={() => {
                          getConversation(
                            findMemberNotEqualUser(eachConv.members)[0]
                          );
                        }}
                        className={`pointer p-16 ${
                          findMemberNotEqualUser(eachConv.members)[0]
                            .username === selectedUser?.username &&
                          "selected-message"
                        } each-message-parent-div`}
                        key={eachConv.id}
                        style={{
                          borderRight:
                            findMemberNotEqualUser(eachConv.members)[0]
                              .username === selectedUser?.username &&
                            "5px solid #36bbf7",
                        }}
                      >
                        <div className="chirp-bold-font color-dark-text">
                          {findMemberNotEqualUser(eachConv.members)[0].username}
                        </div>
                        <div className="fs-15 lh-20 chirp-regular-font color-soft-dark-text w-100 t-ov ov-hid w-sp">
                          {eachConv.Message[eachConv.Message.length - 1].text}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div>Start a conversation.</div>
              )}
            </div>
          </div>
        </div>
        <div
          className="bl-1px bt-1px h-100"
          style={{
            minWidth: "350px",
            width: "50%",
            maxHeight: "100vh",
            overflowY: "auto",
            position: "relative",
          }}
        >
          {conversation?.Message?.length > 0 && (
            <>
              {conversation?.Message.map((eachMessage) => {
                return (
                  <div
                    ref={scrollRef}
                    style={{
                      textAlign:
                        eachMessage?.sender?.id === user?.id ? "right" : "left",
                      width: "100%",
                    }}
                    key={eachMessage?.id}
                  >
                    <div
                      className={`fs-15 lh-20 chirp-regular-font p-16 pointer-none ${
                        eachMessage?.sender?.id === user?.id ? "you" : "him-her"
                      }`}
                      style={{
                        borderRadius: "24px",
                        borderBottomRightRadius: "4px",
                        margin: "12px",
                        display: "inline-block",
                      }}
                    >
                      {eachMessage.text}
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {selectedUser && (
            <div
              style={{
                position: "sticky",
                width: "100%",
                bottom: "0px",
                backgroundColor: "white",
                backgroundColor: "rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(12px)",
                height: "53px",
                maxHeight: "53px",
              }}
            >
              <div
                style={{
                  position: "relative",
                  margin: "0px 12px",
                }}
              >
                <div
                  style={{
                    marginTop: "4px",
                  }}
                  className="w-100 dflex jfycenter algncenter"
                >
                  <input
                    className="border-1px w-100 fs-15 lh-20 chirp-regular-font"
                    style={{
                      borderRadius: "9999px",
                      height: "42px",
                      outlineStyle: "none",
                      paddingLeft: "15px",
                    }}
                    placeholder={"Start a new message"}
                    onChange={(e) => setMessage(e.target.value)}
                    value={message}
                  />
                  <svg
                    style={{
                      right: "15px",
                    }}
                    onClick={() => {
                      if (message.length) {
                        sendMessage();
                      }
                    }}
                    fill="#36bbf7"
                    width={20}
                    height={20}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className={` p-abs pointer r-4qtqp9 r-yyyyoo r-dnmrzs r-bnwqim r-lrvibr r-m6rgpd r-z80fyv r-19wmn03`}
                  >
                    <g>
                      <path d="M2.504 21.866l.526-2.108C3.04 19.719 4 15.823 4 12s-.96-7.719-.97-7.757l-.527-2.109L22.236 12 2.504 21.866zM5.981 13c-.072 1.962-.34 3.833-.583 5.183L17.764 12 5.398 5.818c.242 1.349.51 3.221.583 5.183H10v2H5.981z"></path>
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
        <div
          className="bl-1px bt-1px h-100"
          style={{
            minWidth: "25%",
            width: "25%",
          }}
        >
          3
        </div>
      </div>
    </>
  );
}

export default Dashboard;
