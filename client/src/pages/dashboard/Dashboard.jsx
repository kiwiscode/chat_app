import { useEffect, useRef, useState } from "react";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSocket } from "../../context/SocketContext";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
const API_URL = "http://localhost:3000";

function Dashboard() {
  const { user } = useUser();
  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");

  // chatting conversation start to check

  const getAllUsers = async () => {
    try {
      const result = await axios.get(`${API_URL}/users`, {
        withCredentials: true,
      });

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
      setConversation(result.data);

      if (show) {
        setShow(false);
      }
    } catch (error) {
      console.log("error:", error);
      throw error;
    }
  };

  // send message
  const sendMessage = async () => {
    try {
      await axios.post(
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
  const [memberIds, setMemberIds] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const socket = useSocket();

  useEffect(() => {
    socket.emit("addUser", user?.id);
    socket.on("getUsers", (users) => {
      setOnlineUsers(users);
    });
  }, [user]);

  const getMemberIdsFromConv = (array) => {
    const ids = array?.members?.map((eachMember) => {
      return eachMember.id;
    });
    return ids;
  };

  console.log("independet members check:", getMemberIdsFromConv(conversation));

  useEffect(() => {
    console.log("members outside socket:", getMemberIdsFromConv(conversation));
    socket.on("getMessage", (data) => {
      console.log("message data:", data);
      console.log("conversation:", conversation);
      console.log("members inside:", getMemberIdsFromConv(conversation));
      setArrivalMessage({
        sender: data.senderId,
        senderId: data.senderId,
        text: data.text,
        createdAt: Date.now(),
      });
    });
  }, [socket, conversation, arrivalMessage]);

  useEffect(() => {
    if (
      arrivalMessage &&
      getMemberIdsFromConv(conversation)?.includes(
        arrivalMessage.senderId || arrivalMessage.sender
      )
    ) {
      setConversation((prev) => ({
        ...prev,
        Message: [...prev.Message, arrivalMessage],
      }));
    }
  }, [arrivalMessage]);

  // show search input modal
  const [show, setShow] = useState(null);

  return (
    <>
      <>
        {show && (
          <div
            className="shadow_div_white p-16 p-abs border-r-4"
            style={{
              width: "600px",
              maxWidth: "600px",
              height: "600px",
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              minWidth: "fit-content",
              zIndex: 9999, // Ensure it's above other elements
            }}
          >
            <div
              onClick={() => setShow(!show)}
              style={{
                borderRadius: "50%",
                cursor: "pointer",
                position: "absolute",
              }}
            >
              <div
                className="dflex jfycenter algncenter border-50 hover_close_btn"
                style={{
                  width: "40px",
                  height: "40px",
                }}
              >
                {/* close signin modal icon start to check  */}
                <svg
                  style={{
                    border: "none",
                    margin: "5px",
                  }}
                  width={20}
                  height={20}
                  color={"rgb(15,20,25)"}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className={` r-4qtqp9 r-yyyyoo r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-z80fyv r-19wmn03`}
                >
                  <g>
                    <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path>
                  </g>
                </svg>{" "}
                {/* close signin modal icon finish to check  */}
              </div>
            </div>{" "}
            <div
              style={{
                paddingTop: "60px",
              }}
            >
              <div
                style={{
                  marginBottom: "12px",
                }}
              >
                <AvatarGroup total={users.length}>
                  {users.map((eachUser) => {
                    return (
                      <Avatar
                        key={eachUser.id}
                        alt={eachUser.username}
                        src={eachUser.profilePicture}
                      />
                    );
                  })}
                </AvatarGroup>
              </div>
              <input
                placeholder="Find someone to chat with..."
                type="text"
                className="w-100 border-999 border-1px fs-15 lh-20 chirp-regular-font"
                style={{
                  borderRadius: "9999px",
                  height: "42px",
                  outlineStyle: "none",
                }}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <div>
              {filteredUsers?.length > 0 && (
                <div
                  style={{
                    marginTop: "12px",
                  }}
                >
                  {filteredUsers.map((eachUser) => {
                    return (
                      <>
                        {eachUser?.id !== user.id && (
                          <div
                            onClick={() => {
                              addConversation(eachUser);
                            }}
                            className="p-16 border-r-4 dflex algncenter each-message-parent-div pointer"
                            style={{
                              justifyContent: "flex-start",
                              gap: "12px",
                            }}
                            key={eachUser.id}
                          >
                            <div>
                              {eachUser.profilePicture !==
                              "default_profile_picture_url" ? (
                                <div
                                  className="image-hover-effect"
                                  style={{
                                    width: "44px",
                                    height: "44px",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    borderRadius: "50%",
                                    cursor: "pointer",
                                  }}
                                >
                                  <img
                                    src={eachUser.profilePicture}
                                    width={40}
                                    height={40}
                                    alt=""
                                    style={{
                                      borderRadius: "50%",
                                    }}
                                  />{" "}
                                </div>
                              ) : (
                                <div
                                  style={{
                                    width: "44px",
                                    height: "44px",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    borderRadius: "50%",
                                    cursor: "pointer",
                                  }}
                                  href=""
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="40"
                                    height="40"
                                    fill={"rgb(83, 100, 113)"}
                                    style={{
                                      borderRadius: "50%",
                                    }}
                                    className="bi bi-person-circle"
                                    viewBox="0 0 16 16"
                                  >
                                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                                    <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1" />
                                  </svg>{" "}
                                </div>
                              )}
                            </div>
                            <div className="fs-15 lh-20 chirp-medium-font color-dark-text">
                              {eachUser.username}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </>
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
                      <div>
                        {eachConv.Message.length > 0 && (
                          <>
                            <div
                              onClick={() => {
                                getConversation(
                                  findMemberNotEqualUser(eachConv.members)[0]
                                );
                              }}
                              className={`pointer p-16 ${
                                findMemberNotEqualUser(eachConv.members)[0]
                                  .username === selectedUser?.username &&
                                "selected-message dflex"
                              } each-message-parent-div dflex algncenter`}
                              key={eachConv.id}
                              style={{
                                borderRight:
                                  findMemberNotEqualUser(eachConv.members)[0]
                                    .username === selectedUser?.username &&
                                  "5px solid #36bbf7",
                                gap: "12px",
                              }}
                            >
                              <div>
                                {findMemberNotEqualUser(eachConv.members)[0]
                                  .profilePicture !==
                                "default_profile_picture_url" ? (
                                  <div
                                    className="image-hover-effect"
                                    style={{
                                      width: "44px",
                                      height: "44px",
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      borderRadius: "50%",
                                      cursor: "pointer",
                                    }}
                                  >
                                    <img
                                      src={
                                        findMemberNotEqualUser(
                                          eachConv.members
                                        )[0].profilePicture
                                      }
                                      width={40}
                                      height={40}
                                      alt=""
                                      style={{
                                        borderRadius: "50%",
                                      }}
                                    />{" "}
                                  </div>
                                ) : (
                                  <div
                                    style={{
                                      width: "44px",
                                      height: "44px",
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      borderRadius: "50%",
                                      cursor: "pointer",
                                    }}
                                    href=""
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="40"
                                      height="40"
                                      fill={"rgb(83, 100, 113)"}
                                      style={{
                                        borderRadius: "50%",
                                      }}
                                      className="bi bi-person-circle"
                                      viewBox="0 0 16 16"
                                    >
                                      <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                                      <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1" />
                                    </svg>{" "}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="chirp-bold-font color-dark-text">
                                  {
                                    findMemberNotEqualUser(eachConv.members)[0]
                                      .username
                                  }
                                </div>
                                <div
                                  style={{
                                    maxWidth: "200px",
                                  }}
                                  className="fs-15 lh-20 chirp-regular-font color-soft-dark-text t-ov ov-hid w-sp"
                                >
                                  {
                                    eachConv?.Message[
                                      eachConv.Message?.length - 1
                                    ].text
                                  }
                                </div>
                              </div>
                            </div>{" "}
                          </>
                        )}
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
          {selectedUser ? (
            <>
              {conversation?.Message?.length > 0 && (
                <>
                  {conversation?.Message.map((eachMessage) => {
                    return (
                      <div
                        ref={scrollRef}
                        style={{
                          textAlign:
                            eachMessage?.sender?.id === user?.id
                              ? "right"
                              : "left",
                          width: "100%",
                        }}
                        key={eachMessage?.id}
                      >
                        <div
                          className={`fs-15 lh-20 chirp-regular-font p-16 pointer-none ${
                            eachMessage?.sender?.id === user?.id
                              ? "you"
                              : "him-her"
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
                          paddingRight: "36px",
                        }}
                        placeholder={"Start a new message"}
                        onChange={(e) => setMessage(e.target.value)}
                        value={message}
                        autoFocus={true}
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
            </>
          ) : (
            <>
              <div
                className="chirp-heavy-font"
                style={{
                  fontSize: "31px",
                  lineHeight: "36px",
                  margin: "10px",
                }}
              >
                Welcome to your inbox!
              </div>
              <div
                className="chirp-regular-font fs-15 lh-20"
                style={{
                  color: "rgb(83, 100, 113)",

                  margin: "10px",
                }}
              >
                Start Private Conversations on chatswift...
              </div>
            </>
          )}
        </div>
        <div
          className="bl-1px bt-1px h-100"
          style={{
            minWidth: "25%",
            width: "25%",
          }}
        >
          <div
            style={{
              marginTop: "12px",
              marginLeft: "12px",
              marginRight: "12px",
            }}
          >
            <div
              onClick={() => setShow(!show)}
              style={{
                marginTop: "60px",
                gap: "25px",
              }}
              className="color-dark-text fs-23 lh-28 chirp-extended-heavy pointer dflex"
            >
              <span>
                <svg
                  width={40}
                  height={40}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <g>
                    <path d="M7.501 19.917L7.471 21H.472l.029-1.027c.184-6.618 3.736-8.977 7-8.977.963 0 1.95.212 2.87.672-.444.478-.851 1.03-1.212 1.656-.507-.204-1.054-.329-1.658-.329-2.767 0-4.57 2.223-4.938 6.004H7.56c-.023.302-.05.599-.059.917zm15.998.056L23.528 21H9.472l.029-1.027c.184-6.618 3.736-8.977 7-8.977s6.816 2.358 7 8.977zM21.437 19c-.367-3.781-2.17-6.004-4.938-6.004s-4.57 2.223-4.938 6.004h9.875zm-4.938-9c-.799 0-1.527-.279-2.116-.73-.836-.64-1.384-1.638-1.384-2.77 0-1.93 1.567-3.5 3.5-3.5s3.5 1.57 3.5 3.5c0 1.132-.548 2.13-1.384 2.77-.589.451-1.317.73-2.116.73zm-1.5-3.5c0 .827.673 1.5 1.5 1.5s1.5-.673 1.5-1.5-.673-1.5-1.5-1.5-1.5.673-1.5 1.5zM7.5 3C9.433 3 11 4.57 11 6.5S9.433 10 7.5 10 4 8.43 4 6.5 5.567 3 7.5 3zm0 2C6.673 5 6 5.673 6 6.5S6.673 8 7.5 8 9 7.327 9 6.5 8.327 5 7.5 5z"></path>
                  </g>
                </svg>
              </span>
              <span>Connect and Collaborate with Your Coworkers</span>
            </div>
            <div
              onClick={() => setShow(!show)}
              style={{
                marginTop: "60px",
                gap: "25px",
              }}
              className="color-dark-text fs-23 lh-28 chirp-extended-heavy pointer dflex"
            >
              <span>
                <svg
                  width={40}
                  height={40}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <g>
                    <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z"></path>
                  </g>
                </svg>
              </span>
              <span>Find Friends and Start Conversations Instantly</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
