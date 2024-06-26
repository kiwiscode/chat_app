import { useContext, useEffect, useRef, useState } from "react";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSocket } from "../../context/SocketContext";
import { Avatar, AvatarGroup, Popover, Modal } from "@mui/material";
import PopupState, { bindTrigger, bindPopover } from "material-ui-popup-state";
import { ThemeContext } from "../../context/ThemeContext";
import { useAntdMessageHandler } from "../../utils/useAntdMessageHandler";

const API_URL = "http://localhost:3000";

function Dashboard() {
  const { user } = useUser();
  const { showCustomMessage, contextHolder } = useAntdMessageHandler();
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
    console.log("search str:", toLowerCaseSearchStr);
    console.log("user coworkers:", user.coworkers);
    if (showSearchPeopleModal) {
      const filteredArray = array.filter((eachUser) => {
        return (
          eachUser.username.toLowerCase().startsWith(toLowerCaseSearchStr) &&
          eachUser.username !== user.username
        );
      });
      setFilteredUsers(filteredArray);
    } else if (showSearchCoworkerModal || showSearchFriendModal) {
      const filteredArray = array.filter((eachUser) => {
        return (
          eachUser.user.username
            .toLowerCase()
            .startsWith(toLowerCaseSearchStr) &&
          eachUser.user.username !== user.username
        );
      });
      setFilteredUsers(filteredArray);
    }
  };

  useEffect(() => {
    if (searchInput) {
      if (showSearchPeopleModal) {
        filterUsers(users, searchInput);
      } else if (showSearchCoworkerModal) {
        filterUsers(user?.coworkers, searchInput);
      } else if (showSearchFriendModal) {
        filterUsers(user?.friends, searchInput);
      }
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

  useEffect(() => {
    socket.on("getMessage", (data) => {
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
  const [index, setIndex] = useState(1);
  const [arrowAnimationStatusForward, setArrowAnimationStatusForward] =
    useState(false);
  const [arrowAnimationStatusDown, setArrowAnimationStatusDown] =
    useState(false);
  const handleTabChangeForward = () => {
    setIndex(index + 1);
    setArrowAnimationStatusForward(false);
    setArrowAnimationStatusDown(false);
  };
  const handleTabChangeDown = () => {
    setIndex(index - 1);
    setArrowAnimationStatusForward(false);
    setArrowAnimationStatusDown(false);
  };
  const arrowAnimationActiveForward = () => {
    setArrowAnimationStatusForward(true);
  };
  const arrowAnimationRemoveForward = () => {
    setArrowAnimationStatusForward(false);
  };
  const arrowAnimationActiveDown = () => {
    setArrowAnimationStatusDown(true);
  };
  const arrowAnimationRemoveDown = () => {
    setArrowAnimationStatusDown(false);
  };

  const [{ theme, themeName }, toggleTheme] = useContext(ThemeContext);

  const [count, setCount] = useState(1);
  const [themes, setThemes] = useState([
    "light-theme",
    "dark-theme",
    "cyber-punk-theme",
  ]);

  const countHandler = () => {
    setCount(count + 1);
  };

  useEffect(() => {
    if (count === 4) {
      toggleTheme("light-theme");
      setCount(1);
    } else if (count === 1) {
      toggleTheme("light-theme");
    } else if (count === 2) {
      toggleTheme("dark-theme");
    } else if (count === 3) {
      toggleTheme("cyber-punk-theme");
    } else {
      toggleTheme("light-theme");
    }
  }, [count, toggleTheme]);

  // search user modal
  const [showSearchPeopleModal, setShowSearchPeopleModal] = useState(null);
  const searchPeopleModal = () => {
    setShowSearchPeopleModal(true);
  };
  const handleCloseSearchPeopleModal = () => {
    setShowSearchPeopleModal(false);
    setFilteredUsers(null);
  };

  // search coworker modal
  const [showSearchCoworkerModal, setShowSearchCoworkerModal] = useState(null);
  const searchCoworkerModal = () => {
    setShowSearchCoworkerModal(true);
  };
  const handleCloseSearchCoworkerModal = () => {
    setShowSearchCoworkerModal(false);
    setFilteredUsers(null);
  };

  // search friend modal
  const [showSearchFriendModal, setShowSearchFriendModal] = useState(null);
  const searchFriendModal = () => {
    setShowSearchFriendModal(true);
  };
  const handleCloseSearchFriendModal = () => {
    setShowSearchFriendModal(false);
    setFilteredUsers(null);
  };

  // manage request start to check
  // ui setting / request options
  const [requests, setRequests] = useState({
    sentCoworkerRequests: [],
    sentFriendRequests: [],
  });
  const [hovered, setHovered] = useState(null);

  const requestedCoworkerUserIds = () => {
    return requests?.sentCoworkerRequests?.map((eachRequest) => {
      return eachRequest.recipientId;
    });
  };

  const requestedFriendUserIds = () => {
    return requests?.sentFriendRequests?.map((eachRequest) => {
      return eachRequest.recipientId;
    });
  };

  // get coworker requests
  const getSentCoworkerRequests = async () => {
    try {
      const result = await axios.get(
        `${API_URL}/${user?.id}/coworker-requests`,
        {
          withCredentials: true,
        }
      );
      console.log("Sent coworker requests:", result.data);
      const { sentCoworkerRequests } = result?.data;
      setRequests((prev) => ({
        ...prev,
        sentCoworkerRequests: sentCoworkerRequests,
      }));
    } catch (error) {
      console.error("error:", error);
      throw error;
    }
  };
  // send coworker request
  const sendCoworkerRequest = async (requesterId, recipientId) => {
    try {
      const result = await axios.post(
        `${API_URL}/coworker-requests`,
        {
          requesterId,
          recipientId,
        },
        {
          withCredentials: true,
        }
      );
      getSentCoworkerRequests();
      const { status, message, reverseRequest } = result.data;
      if (status === "reverse_request_accepted") {
        setShowSearchPeopleModal(false);
        showCustomMessage(
          "You have added this user to your coworker list. They had previously sent you a coworker request which was pending.",
          6
        );
      }
    } catch (error) {
      console.error("error:", error);
      throw error;
    }
  };
  // cancel coworker request
  const [showCancelCoworkerReqModal, setShowCancelCoworkerReqModal] =
    useState(null);
  const [recipientInfoCancelCReq, setRecipientInfoCancelCReq] = useState(null);
  const [requestId, setRequestId] = useState(null);
  const openCancelCReqModal = (recipient) => {
    setShowCancelFriendReqModal(false);
    setShowCancelCoworkerReqModal(true);
    setRecipientInfoCancelCReq(recipient);
  };
  const closeCancelCreqModal = () => {
    setShowCancelCoworkerReqModal(false);
  };
  const cancelCoworkerRequest = async (requestId) => {
    if (!requestId) {
      console.error("No requestId provided for canceling coworker request");
      return;
    }
    try {
      const result = await axios.delete(
        `${API_URL}/coworker-requests/${requestId}`
      );
      console.log("canceling coworker request with ID:", requestId);
      console.log("result:", result);
      setRequestId(null);
      setShowCancelCoworkerReqModal(false);
      getSentCoworkerRequests();
    } catch (error) {
      console.error("error:", error);
      throw error;
    }
  };

  const findRequestIdInSentCRequests = () => {
    const foundRequest = requests?.sentCoworkerRequests?.find(
      (request) => request.recipientId === recipientInfoCancelCReq.id
    );
    console.log("found request c:", foundRequest);
    setRequestId(foundRequest?.id);
  };

  // get friend requests
  const getSentFriendRequests = async () => {
    try {
      const result = await axios.get(`${API_URL}/${user?.id}/friend-requests`, {
        withCredentials: true,
      });
      console.log("Sent friend requests:", result.data);
      const { sentFriendRequests } = result?.data;
      setRequests((prev) => ({
        ...prev,
        sentFriendRequests: sentFriendRequests,
      }));
    } catch (error) {
      console.error("error:", error);
      throw error;
    }
  };
  // send friend request
  const sendFriendRequest = async (requesterId, recipientId) => {
    try {
      const result = await axios.post(
        `${API_URL}/friend-requests`,
        {
          requesterId,
          recipientId,
        },
        {
          withCredentials: true,
        }
      );
      getSentFriendRequests();
      const { status, message, reverseRequest } = result.data;
      if (status === "reverse_request_accepted") {
        setShowSearchPeopleModal(false);
        showCustomMessage(
          "You have added this user to your friend list. They had previously sent you a friend request which was pending.",
          6
        );
      }
    } catch (error) {
      console.error("error:", error);
      throw error;
    }
  };
  // cancel friend request
  const [recipientInfoCancelFReq, setRecipientInfoCancelFReq] = useState(null);
  const [showCancelFriendReqModal, setShowCancelFriendReqModal] =
    useState(null);

  const openCancelFReqModal = (recipient) => {
    setShowCancelFriendReqModal(true);
    setShowCancelCoworkerReqModal(false);
    setRecipientInfoCancelFReq(recipient);
  };
  const closeCancelFReqModal = () => {
    setShowCancelFriendReqModal(false);
  };
  const cancelFriendRequest = async (requestId) => {
    if (!requestId) {
      console.error("No requestId provided for canceling friend request");
      return;
    }
    try {
      const result = await axios.delete(
        `${API_URL}/friend-requests/${requestId}`
      );
      console.log("canceling coworker request with ID:", requestId);
      console.log("result:", result);

      setRequestId(null);
      setShowCancelFriendReqModal(false);
      getSentFriendRequests();
    } catch (error) {
      console.error("error:", error);
      throw error;
    }
  };

  console.log("requestid:", requestId);

  const findRequestIdInSentFRequests = () => {
    const foundRequest = requests?.sentFriendRequests?.find(
      (request) => request.recipientId === recipientInfoCancelFReq.id
    );
    console.log("found request f:", foundRequest);
    setRequestId(foundRequest?.id);
  };

  useEffect(() => {
    if (recipientInfoCancelFReq) {
      findRequestIdInSentFRequests();
      console.log("friend request id:", requestId);
    } else if (recipientInfoCancelCReq) {
      findRequestIdInSentCRequests();
      console.log("coworker request id:", requestId);
    }
  }, [recipientInfoCancelFReq, recipientInfoCancelCReq, requestId]);
  // manage request finish to check

  console.log("state requests sent:", requests);

  useEffect(() => {
    if (user?.id) {
      getSentCoworkerRequests();
      getSentFriendRequests();
    }
  }, [user?.id]);

  // friends list management
  const [coworkerIds, setCoworkerIds] = useState([]);
  const getCoworkerIds = () => {
    const coworkerIds = user?.coworkers?.map((eachCoworker) => {
      return eachCoworker.coworkerId;
    });
    console.log("coworkerids:", coworkerIds);
    if (coworkerIds) {
      setCoworkerIds(coworkerIds);
    }
  };
  const [friendIds, setFriendIds] = useState([]);
  const getFriendIds = () => {
    const friendIds = user?.friends?.map((eachFriend) => {
      return eachFriend.friendId;
    });
    console.log("friendids:", friendIds);
    if (friendIds) {
      setFriendIds(friendIds);
    }
  };

  useEffect(() => {
    if (user?.coworkers?.length > 0) {
      getCoworkerIds();
    }
    if (user?.friends?.length > 0) {
      getFriendIds();
    }
  }, [user?.coworkers, user?.friends]);

  return (
    <>
      {" "}
      {contextHolder}
      {/* showCancelFriendReqModal */}
      <>
        <Modal
          className="z-9999 p-0 m-0"
          open={showCancelFriendReqModal}
          onClose={closeCancelFReqModal}
        >
          <div
            className="shadow_div_white p-abs border-r-4 none-outline"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              maxWidth: 320,
              maxHeight: 280,
            }}
          >
            <div
              className="dflex fdir-column"
              style={{
                padding: "32px",
              }}
            >
              <span className="fs-20 lh-24 chirp-bold-font">
                Discard friend request?
              </span>
              <div
                className="fs-15 lh-20 chirp-regular-font w-100"
                style={{
                  color: "rgb(83, 100, 113)",
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    wordWrap: "break-word",
                    textOverflow: "unset",
                    minWidth: "0px",
                    textAlign: "inherit",
                    whiteSpace: "break-spaces",
                  }}
                >
                  This will cancel your pending request, and @
                  {recipientInfoCancelFReq?.username} will no longer see it.{" "}
                </span>
              </div>
              <div
                className="dflex jfycenter algncenter fdir-column"
                style={{
                  marginTop: "24px",
                }}
              >
                <button
                  onClick={() => {
                    cancelFriendRequest(requestId);
                  }}
                  style={{
                    marginBottom: "12px",
                    minHeight: "44px",
                    minWidth: "44px",
                    borderRadius: "9999px",
                    paddingLeft: "24px",
                    paddingRight: "24px",
                    backgroundColor: "#0F141A",
                    color: "rgb(231, 233, 234)",
                    border: "1px solid rgb(207, 217, 222)",
                  }}
                  className="w-100 border-r-999 fs-15 lh-20 chirp-bold-font dark_btn_hover_effect pointer"
                >
                  <div
                    style={{
                      width: "100%",
                      textAlign: "center",
                    }}
                  >
                    Discard
                  </div>
                </button>
                <button
                  onClick={() => setShowCancelFriendReqModal(false)}
                  style={{
                    marginBottom: "12px",
                    minHeight: "44px",
                    minWidth: "44px",
                    paddingLeft: "24px",
                    paddingRight: "24px",
                    backgroundColor: "transparent",
                    color: "rgb(16, 23, 42)",
                    border: "1px solid rgb(207, 217, 222)",
                  }}
                  className="w-100 border-r-999 fs-15 lh-20 chirp-bold-font cancel_btn_hover_effect pointer"
                >
                  <div
                    style={{
                      width: "100%",
                      textAlign: "center",
                    }}
                  >
                    Cancel
                  </div>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </>
      {/* showCancelCoworkerReqModal */}
      <>
        <Modal
          className="z-9999 p-0 m-0"
          open={showCancelCoworkerReqModal}
          onClose={closeCancelCreqModal}
        >
          <div
            className="shadow_div_white p-abs border-r-4 none-outline"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              maxWidth: 320,
              maxHeight: 280,
            }}
          >
            <div
              className="dflex fdir-column"
              style={{
                padding: "32px",
              }}
            >
              <span className="fs-20 lh-24 chirp-bold-font">
                Discard coworker request?
              </span>
              <div
                className="fs-15 lh-20 chirp-regular-font w-100"
                style={{
                  color: "rgb(83, 100, 113)",
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    wordWrap: "break-word",
                    textOverflow: "unset",
                    minWidth: "0px",
                    textAlign: "inherit",
                    whiteSpace: "break-spaces",
                  }}
                >
                  This will cancel your pending request, and @
                  {recipientInfoCancelCReq?.username} will no longer see it.{" "}
                </span>
              </div>
              <div
                className="dflex jfycenter algncenter fdir-column"
                style={{
                  marginTop: "24px",
                }}
              >
                <button
                  onClick={() => {
                    cancelCoworkerRequest(requestId);
                  }}
                  style={{
                    marginBottom: "12px",
                    minHeight: "44px",
                    minWidth: "44px",
                    borderRadius: "9999px",
                    paddingLeft: "24px",
                    paddingRight: "24px",
                    backgroundColor: "#0F141A",
                    color: "rgb(231, 233, 234)",
                    border: "1px solid rgb(207, 217, 222)",
                  }}
                  className="w-100 border-r-999 fs-15 lh-20 chirp-bold-font dark_btn_hover_effect pointer"
                >
                  <div
                    style={{
                      width: "100%",
                      textAlign: "center",
                    }}
                  >
                    Discard
                  </div>
                </button>
                <button
                  onClick={() => setShowCancelCoworkerReqModal(false)}
                  style={{
                    marginBottom: "12px",
                    minHeight: "44px",
                    minWidth: "44px",
                    paddingLeft: "24px",
                    paddingRight: "24px",
                    backgroundColor: "transparent",
                    color: "rgb(16, 23, 42)",
                    border: "1px solid rgb(207, 217, 222)",
                  }}
                  className="w-100 border-r-999 fs-15 lh-20 chirp-bold-font cancel_btn_hover_effect pointer"
                >
                  <div
                    style={{
                      width: "100%",
                      textAlign: "center",
                    }}
                  >
                    Cancel
                  </div>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </>
      {/* search user modal  */}
      <>
        <Modal
          className="z-9999 p-0 m-0"
          open={showSearchPeopleModal}
          onClose={handleCloseSearchPeopleModal}
        >
          <div
            className="shadow_div_white p-abs border-r-4 none-outline"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 600,
              height: 600,
            }}
          >
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
                onClick={handleCloseSearchPeopleModal}
                style={{
                  borderRadius: "50%",
                  cursor: "pointer",
                  position: "absolute",
                }}
              >
                <div
                  className="dflex jfycenter algncenter border-r-50 hover_close_btn"
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
                  placeholder="Search people"
                  type="text"
                  className="w-100 border-r-999 border-1px fs-15 lh-20 chirp-regular-font"
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
                    {filteredUsers?.map((eachUser, itemIndex) => {
                      return (
                        <>
                          {eachUser?.id !== user.id && (
                            <div
                              className="p-16 border-r-4 dflex algncenter"
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
                                    style={{
                                      width: "44px",
                                      height: "44px",
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      borderRadius: "50%",
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

                              <div
                                className="dflex algncenter w-100"
                                style={{
                                  justifyContent: "flex-end",
                                  gap: "12px",
                                }}
                              >
                                <div
                                  onMouseEnter={() =>
                                    setHovered({
                                      id: eachUser.id,
                                      option: "coworker",
                                      isAlreadyCoworker: coworkerIds.includes(
                                        eachUser.id
                                      ),
                                      itemIndex: itemIndex,
                                    })
                                  }
                                  onMouseLeave={() => setHovered(null)}
                                  onClick={() => {
                                    if (
                                      !requestedCoworkerUserIds().includes(
                                        eachUser.id
                                      ) &&
                                      !coworkerIds.includes(eachUser.id)
                                    ) {
                                      sendCoworkerRequest(
                                        user?.id,
                                        eachUser.id
                                      );
                                    } else if (
                                      coworkerIds.includes(eachUser.id)
                                    ) {
                                      // openRemoveCoworkerModal()
                                    } else {
                                      openCancelCReqModal(eachUser);
                                    }
                                  }}
                                  className={`fs-14 lh-16 chirp-bold-font jfycenter algncenter pointer circle_hover_accept ${
                                    (requestedCoworkerUserIds().includes(
                                      eachUser.id
                                    ) ||
                                      coworkerIds.includes(eachUser.id)) &&
                                    !hovered?.isAlreadyCoworker
                                      ? "cancel_btn_hover_effect"
                                      : (requestedCoworkerUserIds().includes(
                                          eachUser.id
                                        ) ||
                                          coworkerIds.includes(eachUser.id)) &&
                                        hovered?.isAlreadyCoworker
                                      ? "circle_hover_reject"
                                      : "dark_btn_hover_effect"
                                  }`}
                                  style={{
                                    border:
                                      !hovered?.isAlreadyCoworker &&
                                      !hovered?.itemIndex === itemIndex
                                        ? "1px solid rgb(207, 217, 222)"
                                        : hovered?.isAlreadyCoworker &&
                                          hovered?.itemIndex === itemIndex
                                        ? "1px solid rgb(253, 201, 206)"
                                        : "1px solid rgb(207, 217, 222)",
                                    display: "inline-flex",
                                    borderRadius: "9999px",
                                    minWidth: "32px",
                                    minHeight: "32px",
                                    padding: "0px 16px",
                                    color:
                                      (requestedCoworkerUserIds().includes(
                                        eachUser.id
                                      ) ||
                                        coworkerIds.includes(eachUser.id)) &&
                                      !hovered?.isAlreadyCoworker
                                        ? "rgb(16, 23, 42)"
                                        : (requestedCoworkerUserIds().includes(
                                            eachUser.id
                                          ) ||
                                            coworkerIds.includes(
                                              eachUser.id
                                            )) &&
                                          hovered?.isAlreadyCoworker &&
                                          hovered?.itemIndex === itemIndex
                                        ? "rgb(244, 33, 46)"
                                        : hovered?.itemIndex !== itemIndex &&
                                          requestedCoworkerUserIds().includes(
                                            eachUser.id
                                          )
                                        ? "rgb(16, 23, 42)"
                                        : "rgb(231, 233, 234)",
                                    backgroundColor:
                                      requestedCoworkerUserIds().includes(
                                        eachUser.id
                                      ) || coworkerIds.includes(eachUser.id)
                                        ? "transparent"
                                        : "#0F141A",
                                  }}
                                >
                                  {coworkerIds.includes(eachUser.id) &&
                                  !hovered?.isAlreadyCoworker
                                    ? "Already a Coworker"
                                    : coworkerIds.includes(eachUser.id) &&
                                      hovered?.isAlreadyCoworker
                                    ? "Remove"
                                    : requestedCoworkerUserIds().includes(
                                        eachUser.id
                                      ) &&
                                      hovered?.id !== eachUser.id &&
                                      hovered?.option !== "coworker"
                                    ? "Pending"
                                    : requestedCoworkerUserIds().includes(
                                        eachUser.id
                                      ) &&
                                      hovered?.id === eachUser.id &&
                                      hovered?.option === "coworker"
                                    ? "Cancel"
                                    : !requestedCoworkerUserIds().includes(
                                        eachUser.id
                                      )
                                    ? "Add Coworker"
                                    : "Pending"}
                                </div>

                                <div
                                  onMouseEnter={() =>
                                    setHovered({
                                      id: eachUser.id,
                                      option: "friend",
                                      isAlreadyFriend: friendIds.includes(
                                        eachUser.id
                                      ),
                                      itemIndex: itemIndex,
                                    })
                                  }
                                  onMouseLeave={() => setHovered(null)}
                                  onClick={() => {
                                    if (
                                      !requestedFriendUserIds().includes(
                                        eachUser.id
                                      ) &&
                                      !friendIds.includes(eachUser.id)
                                    ) {
                                      sendFriendRequest(user?.id, eachUser.id);
                                    } else if (
                                      friendIds.includes(eachUser.id)
                                    ) {
                                      // openRemoveFriendModal()
                                    } else {
                                      openCancelFReqModal(eachUser);
                                    }
                                  }}
                                  className={`fs-14 lh-16 chirp-bold-font jfycenter algncenter pointer circle_hover_accept ${
                                    (requestedFriendUserIds().includes(
                                      eachUser.id
                                    ) ||
                                      friendIds.includes(eachUser.id)) &&
                                    !hovered?.isAlreadyFriend
                                      ? "cancel_btn_hover_effect"
                                      : (requestedFriendUserIds().includes(
                                          eachUser.id
                                        ) ||
                                          friendIds.includes(eachUser.id)) &&
                                        hovered?.isAlreadyFriend
                                      ? "circle_hover_reject"
                                      : "dark_btn_hover_effect"
                                  }`}
                                  style={{
                                    border:
                                      !hovered?.isAlreadyFriend &&
                                      !hovered?.itemIndex === itemIndex
                                        ? "1px solid rgb(207, 217, 222)"
                                        : hovered?.isAlreadyFriend &&
                                          hovered?.itemIndex === itemIndex
                                        ? "1px solid rgb(253, 201, 206)"
                                        : "1px solid rgb(207, 217, 222)",
                                    display: "inline-flex",
                                    borderRadius: "9999px",
                                    minWidth: "32px",
                                    minHeight: "32px",
                                    padding: "0px 16px",
                                    color:
                                      (requestedFriendUserIds().includes(
                                        eachUser.id
                                      ) ||
                                        friendIds.includes(eachUser.id)) &&
                                      !hovered?.isAlreadyFriend
                                        ? "rgb(16, 23, 42)"
                                        : (requestedFriendUserIds().includes(
                                            eachUser.id
                                          ) ||
                                            friendIds.includes(eachUser.id)) &&
                                          hovered?.isAlreadyFriend &&
                                          hovered?.itemIndex === itemIndex
                                        ? "rgb(244, 33, 46)"
                                        : hovered?.itemIndex !== itemIndex &&
                                          requestedFriendUserIds().includes(
                                            eachUser.id
                                          )
                                        ? "rgb(16, 23, 42)"
                                        : "rgb(231, 233, 234)",
                                    backgroundColor:
                                      requestedFriendUserIds().includes(
                                        eachUser.id
                                      ) || friendIds.includes(eachUser.id)
                                        ? "transparent"
                                        : "#0F141A",
                                  }}
                                >
                                  {friendIds.includes(eachUser.id) &&
                                  !hovered?.isAlreadyFriend
                                    ? "Already a Friend"
                                    : friendIds.includes(eachUser.id) &&
                                      hovered?.isAlreadyFriend
                                    ? "Remove"
                                    : requestedFriendUserIds().includes(
                                        eachUser.id
                                      ) &&
                                      hovered?.id !== eachUser.id &&
                                      hovered?.option !== "friend"
                                    ? "Pending"
                                    : requestedFriendUserIds().includes(
                                        eachUser.id
                                      ) &&
                                      hovered?.id === eachUser.id &&
                                      hovered?.option === "friend"
                                    ? "Cancel"
                                    : !requestedFriendUserIds().includes(
                                        eachUser.id
                                      )
                                    ? "Add Friend"
                                    : "Pending"}
                                </div>
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
          </div>
        </Modal>
      </>
      {/* search coworkers modal */}
      <>
        <Modal
          className="z-9999 p-0 m-0"
          open={showSearchCoworkerModal}
          onClose={handleCloseSearchCoworkerModal}
        >
          <div
            className="shadow_div_white p-abs border-r-4 none-outline"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 600,
              height: 600,
            }}
          >
            <div>Search coworker</div>

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
                onClick={handleCloseSearchCoworkerModal}
                style={{
                  borderRadius: "50%",
                  cursor: "pointer",
                  position: "absolute",
                }}
              >
                <div
                  className="dflex jfycenter algncenter border-r-50 hover_close_btn"
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
                  <AvatarGroup total={user?.coworkers?.length}>
                    {user?.coworkers?.map((eachUser) => {
                      return (
                        <Avatar
                          key={eachUser.user.id}
                          alt={eachUser.user.username}
                          src={eachUser.user.profilePicture}
                        />
                      );
                    })}
                  </AvatarGroup>
                </div>
                <input
                  placeholder="Search for a coworker..."
                  type="text"
                  className="w-100 border-r-999 border-1px fs-15 lh-20 chirp-regular-font"
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
                    {filteredUsers?.map((eachUser) => {
                      return (
                        <>
                          {eachUser?.user?.id !== user.id && (
                            <div
                              onClick={() => {
                                handleCloseSearchCoworkerModal();
                                addConversation(eachUser?.user);
                                setFilteredUsers(null);
                              }}
                              className="p-16 border-r-4 dflex algncenter each-message-parent-div pointer"
                              style={{
                                justifyContent: "flex-start",
                                gap: "12px",
                              }}
                              key={eachUser?.user?.id}
                            >
                              <div>
                                {eachUser?.user?.profilePicture !==
                                "default_profile_picture_url" ? (
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
                                  >
                                    <img
                                      src={eachUser?.user?.profilePicture}
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
                                {eachUser?.user?.username}
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
          </div>
        </Modal>
      </>
      {/* search friends modal */}
      <>
        <Modal
          className="z-9999 p-0 m-0"
          open={showSearchFriendModal}
          onClose={handleCloseSearchFriendModal}
        >
          <div
            className="shadow_div_white p-abs border-r-4 none-outline"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 600,
              height: 600,
            }}
          >
            <div>Search friend</div>
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
                onClick={handleCloseSearchFriendModal}
                style={{
                  borderRadius: "50%",
                  cursor: "pointer",
                  position: "absolute",
                }}
              >
                <div
                  className="dflex jfycenter algncenter border-r-50 hover_close_btn"
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
                  <AvatarGroup total={user?.friends?.length}>
                    {user?.friends?.map((eachUser) => {
                      return (
                        <Avatar
                          key={eachUser.user.id}
                          alt={eachUser.user.username}
                          src={eachUser.user.profilePicture}
                        />
                      );
                    })}
                  </AvatarGroup>
                </div>
                <input
                  placeholder="Search for a friend..."
                  type="text"
                  className="w-100 border-r-999 border-1px fs-15 lh-20 chirp-regular-font"
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
                    {filteredUsers?.map((eachUser) => {
                      return (
                        <>
                          {eachUser?.user?.id !== user.id && (
                            <div
                              onClick={() => {
                                handleCloseSearchFriendModal();
                                addConversation(eachUser.user);
                                setFilteredUsers(null);
                              }}
                              className="p-16 border-r-4 dflex algncenter each-message-parent-div pointer"
                              style={{
                                justifyContent: "flex-start",
                                gap: "12px",
                              }}
                              key={eachUser?.user?.id}
                            >
                              <div>
                                {eachUser?.user?.profilePicture !==
                                "default_profile_picture_url" ? (
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
                                  >
                                    <img
                                      src={eachUser?.user?.profilePicture}
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
                                {eachUser?.user?.username}
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
          </div>
        </Modal>
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
                <PopupState variant="popover" popupId="demo-popup-popover">
                  {(popupState) => (
                    <div>
                      <div>
                        <div
                          className="chirp-heavy-font"
                          style={{
                            fontSize: "31px",
                            lineHeight: "36px",
                            margin: "10px",
                          }}
                        >
                          Chats will appear here
                        </div>
                        <div
                          className="chirp-regular-font fs-15 lh-20"
                          style={{
                            color: "rgb(83, 100, 113)",
                            margin: "10px",
                          }}
                        >
                          <div
                            style={{
                              marginTop: "12px",
                            }}
                          >
                            But there are currently no chats available!
                          </div>
                          <div
                            style={{
                              marginTop: "12px",
                            }}
                          >
                            Would you like to check out our guide before
                            starting a chat?{" "}
                            <span
                              className="text_decoration_underline pointer"
                              style={{
                                color: "#36bbf7",
                              }}
                              {...bindTrigger(popupState)}
                            >
                              Click here to access the guide.
                            </span>
                          </div>
                        </div>
                      </div>
                      <Popover
                        {...bindPopover(popupState)}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "center",
                        }}
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "center",
                        }}
                        className={
                          themeName === "dark-theme"
                            ? "dark-popover"
                            : themeName === "light-theme"
                            ? "light-popover"
                            : themeName === "cyber-punk-theme"
                            ? "cyber-punk-popover"
                            : null
                        }
                      >
                        <div
                          onClick={countHandler}
                          className="chirp-extended-heavy fs-15 lh-20 pointer"
                          style={{
                            position: "absolute",
                            right: "15px",
                            bottom: "15px",
                            color:
                              themeName === "dark-theme"
                                ? "rgb(231, 233, 234)"
                                : themeName === "light-theme"
                                ? "rgb(16, 23, 42)"
                                : themeName === "cyber-punk-theme"
                                ? "rgb(16, 23, 42)"
                                : null,

                            fontStyle: "italic",
                          }}
                        >
                          Theme Context
                        </div>

                        {index === 1 ? (
                          <div className="p-16">
                            <div
                              className="dflex "
                              style={{
                                justifyContent: "flex-start",
                                gap: "12px",
                                alignItems: "center",
                                height: "42px",
                              }}
                            >
                              <div
                                style={{
                                  color:
                                    themeName === "dark-theme"
                                      ? "rgb(231, 233, 234)"
                                      : themeName === "light-theme"
                                      ? "rgb(16, 23, 42)"
                                      : themeName === "cyber-punk-theme"
                                      ? "rgb(16, 23, 42)"
                                      : null,
                                }}
                                className="fs-15 lh-20 chirp-heavy-font"
                              >
                                Main Screen and Navigation Bar:
                              </div>
                              <div
                                onClick={handleTabChangeForward}
                                onMouseEnter={arrowAnimationActiveForward}
                                onMouseLeave={arrowAnimationRemoveForward}
                                className="dflex pointer"
                              >
                                <svg
                                  style={{
                                    height: "1rem",
                                    width: "1rem",
                                    flexShrink: "0",
                                  }}
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill={
                                    themeName === "dark-theme"
                                      ? "rgb(231, 233, 234)"
                                      : themeName === "light-theme"
                                      ? "rgb(16, 23, 42)"
                                      : themeName === "cyber-punk-theme"
                                      ? "rgb(16, 23, 42)"
                                      : null
                                  }
                                  className={`${
                                    arrowAnimationStatusForward
                                      ? "arrow_animation_active_forward"
                                      : "arrow_animation_done_forward"
                                  }`}
                                  aria-hidden="true"
                                >
                                  <path
                                    fill-rule="evenodd"
                                    d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                                    clip-rule="evenodd"
                                  ></path>
                                </svg>
                              </div>
                            </div>
                            <div
                              className="chirp-regular-font fs-15 lh-20"
                              style={{
                                marginTop: "12px",
                                color:
                                  themeName === "dark-theme"
                                    ? "rgb(231, 233, 234)"
                                    : themeName === "light-theme"
                                    ? "rgb(16, 23, 42)"
                                    : themeName === "cyber-punk-theme"
                                    ? "rgb(16, 23, 42)"
                                    : null,
                              }}
                            >
                              After logging in, you will see the list of your
                              real-time chats on the left side under the "Chats"
                              section.
                            </div>
                            <div
                              className="chirp-regular-font fs-15 lh-20"
                              style={{
                                marginTop: "12px",
                                color:
                                  themeName === "dark-theme"
                                    ? "rgb(231, 233, 234)"
                                    : themeName === "light-theme"
                                    ? "rgb(16, 23, 42)"
                                    : themeName === "cyber-punk-theme"
                                    ? ""
                                    : null,
                              }}
                            >
                              On the right side, there is a navigation bar with
                              an input field where you can select the friend or
                              coworker you want to connect with.
                            </div>
                          </div>
                        ) : index === 2 ? (
                          <div className="p-16">
                            <div
                              className="dflex "
                              style={{
                                justifyContent: "flex-start",
                                gap: "12px",
                                alignItems: "center",
                                height: "42px",
                              }}
                            >
                              {" "}
                              <div
                                onClick={handleTabChangeDown}
                                onMouseEnter={arrowAnimationActiveDown}
                                onMouseLeave={arrowAnimationRemoveDown}
                                className="dflex pointer"
                              >
                                <svg
                                  style={{
                                    height: "1rem",
                                    width: "1rem",
                                    flexShrink: "0",
                                  }}
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill={
                                    themeName === "dark-theme"
                                      ? "rgb(231, 233, 234)"
                                      : themeName === "light-theme"
                                      ? "rgb(16, 23, 42)"
                                      : themeName === "cyber-punk-theme"
                                      ? "rgb(16, 23, 42)"
                                      : null
                                  }
                                  className={`${
                                    arrowAnimationStatusDown
                                      ? "arrow_animation_active_down rotate"
                                      : "arrow_animation_done_down rotate"
                                  }`}
                                  aria-hidden="true"
                                >
                                  <path
                                    fill-rule="evenodd"
                                    d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                                    clip-rule="evenodd"
                                  ></path>
                                </svg>
                              </div>
                              <div
                                style={{
                                  color:
                                    themeName === "dark-theme"
                                      ? "rgb(231, 233, 234)"
                                      : themeName === "light-theme"
                                      ? "rgb(16, 23, 42)"
                                      : themeName === "cyber-punk-theme"
                                      ? "rgb(16, 23, 42)"
                                      : null,
                                }}
                                className="fs-15 lh-20 chirp-heavy-font"
                              >
                                Adding and Managing Friends:
                              </div>
                              <div
                                onClick={handleTabChangeForward}
                                onMouseEnter={arrowAnimationActiveForward}
                                onMouseLeave={arrowAnimationRemoveForward}
                                className="dflex pointer"
                              >
                                <svg
                                  style={{
                                    height: "1rem",
                                    width: "1rem",
                                    flexShrink: "0",
                                  }}
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill={
                                    themeName === "dark-theme"
                                      ? "rgb(231, 233, 234)"
                                      : themeName === "light-theme"
                                      ? "rgb(16, 23, 42)"
                                      : themeName === "cyber-punk-theme"
                                      ? "rgb(16, 23, 42)"
                                      : null
                                  }
                                  className={`${
                                    arrowAnimationStatusForward
                                      ? "arrow_animation_active_forward"
                                      : "arrow_animation_done_forward"
                                  }`}
                                  aria-hidden="true"
                                >
                                  <path
                                    fill-rule="evenodd"
                                    d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                                    clip-rule="evenodd"
                                  ></path>
                                </svg>
                              </div>
                            </div>
                            <div
                              className="chirp-regular-font fs-15 lh-20"
                              style={{
                                marginTop: "12px",
                                color:
                                  themeName === "dark-theme"
                                    ? "rgb(231, 233, 234)"
                                    : themeName === "light-theme"
                                    ? "rgb(16, 23, 42)"
                                    : themeName === "cyber-punk-theme"
                                    ? "rgb(16, 23, 42)"
                                    : null,
                              }}
                            >
                              To add a friend, enter the friend's username or
                              information and click the "Add Friend" or "Add
                              Coworker" button.
                            </div>
                            <div
                              className="chirp-regular-font fs-15 lh-20"
                              style={{
                                marginTop: "12px",
                                color:
                                  themeName === "dark-theme"
                                    ? "rgb(231, 233, 234)"
                                    : themeName === "light-theme"
                                    ? "rgb(16, 23, 42)"
                                    : themeName === "cyber-punk-theme"
                                    ? "rgb(16, 23, 42)"
                                    : null,
                              }}
                            >
                              A request will be sent to the person you added,
                              and if they accept the request, you will both be
                              added to each other's lists.
                            </div>
                            <div
                              className="chirp-regular-font fs-15 lh-20"
                              style={{
                                marginTop: "12px",
                                color:
                                  themeName === "dark-theme"
                                    ? "rgb(231, 233, 234)"
                                    : themeName === "light-theme"
                                    ? "rgb(16, 23, 42)"
                                    : themeName === "cyber-punk-theme"
                                    ? "rgb(16, 23, 42)"
                                    : null,
                              }}
                            >
                              The friend request can be rejected; if rejected,
                              you can send the request again.
                            </div>
                          </div>
                        ) : index === 3 ? (
                          <div className="p-16">
                            <div
                              className="dflex "
                              style={{
                                justifyContent: "flex-start",
                                gap: "12px",
                                alignItems: "center",
                                height: "42px",
                              }}
                            >
                              {" "}
                              <div
                                onClick={handleTabChangeDown}
                                onMouseEnter={arrowAnimationActiveDown}
                                onMouseLeave={arrowAnimationRemoveDown}
                                className="dflex pointer"
                              >
                                <svg
                                  style={{
                                    height: "1rem",
                                    width: "1rem",
                                    flexShrink: "0",
                                  }}
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill={
                                    themeName === "dark-theme"
                                      ? "rgb(231, 233, 234)"
                                      : themeName === "light-theme"
                                      ? "rgb(16, 23, 42)"
                                      : themeName === "cyber-punk-theme"
                                      ? "rgb(16, 23, 42)"
                                      : null
                                  }
                                  className={`${
                                    arrowAnimationStatusDown
                                      ? "arrow_animation_active_down rotate"
                                      : "arrow_animation_done_down rotate"
                                  }`}
                                  aria-hidden="true"
                                >
                                  <path
                                    fill-rule="evenodd"
                                    d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                                    clip-rule="evenodd"
                                  ></path>
                                </svg>
                              </div>
                              <div
                                style={{
                                  color:
                                    themeName === "dark-theme"
                                      ? "rgb(231, 233, 234)"
                                      : themeName === "light-theme"
                                      ? "rgb(16, 23, 42)"
                                      : themeName === "cyber-punk-theme"
                                      ? "rgb(16, 23, 42)"
                                      : null,
                                }}
                                className="fs-15 lh-20 chirp-heavy-font"
                              >
                                Profile Settings:
                              </div>
                              <div
                                onClick={handleTabChangeForward}
                                onMouseEnter={arrowAnimationActiveForward}
                                onMouseLeave={arrowAnimationRemoveForward}
                                className="dflex pointer"
                              >
                                <svg
                                  style={{
                                    height: "1rem",
                                    width: "1rem",
                                    flexShrink: "0",
                                  }}
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill={
                                    themeName === "dark-theme"
                                      ? "rgb(231, 233, 234)"
                                      : themeName === "light-theme"
                                      ? "rgb(16, 23, 42)"
                                      : themeName === "cyber-punk-theme"
                                      ? "rgb(16, 23, 42)"
                                      : null
                                  }
                                  className={`${
                                    arrowAnimationStatusForward
                                      ? "arrow_animation_active_forward"
                                      : "arrow_animation_done_forward"
                                  }`}
                                  aria-hidden="true"
                                >
                                  <path
                                    fill-rule="evenodd"
                                    d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                                    clip-rule="evenodd"
                                  ></path>
                                </svg>
                              </div>
                            </div>
                            <div
                              className="chirp-regular-font fs-15 lh-20"
                              style={{
                                marginTop: "12px",
                                color:
                                  themeName === "dark-theme"
                                    ? "rgb(231, 233, 234)"
                                    : themeName === "light-theme"
                                    ? "rgb(16, 23, 42)"
                                    : themeName === "cyber-punk-theme"
                                    ? "rgb(16, 23, 42)"
                                    : null,
                              }}
                            >
                              Click on your profile photo in the top right
                              corner to access your profile page.
                            </div>
                            <div
                              className="chirp-regular-font fs-15 lh-20"
                              style={{
                                marginTop: "12px",
                                color:
                                  themeName === "dark-theme"
                                    ? "rgb(231, 233, 234)"
                                    : themeName === "light-theme"
                                    ? "rgb(16, 23, 42)"
                                    : themeName === "cyber-punk-theme"
                                    ? "rgb(16, 23, 42)"
                                    : null,
                              }}
                            >
                              On your profile page, you can change your photo
                              and edit other settings.
                            </div>
                          </div>
                        ) : index === 4 ? (
                          <div className="p-16">
                            <div
                              className="dflex "
                              style={{
                                justifyContent: "flex-start",
                                gap: "12px",
                                alignItems: "center",
                                height: "42px",
                              }}
                            >
                              {" "}
                              <div
                                onClick={handleTabChangeDown}
                                onMouseEnter={arrowAnimationActiveDown}
                                onMouseLeave={arrowAnimationRemoveDown}
                                className="dflex pointer"
                              >
                                <svg
                                  style={{
                                    height: "1rem",
                                    width: "1rem",
                                    flexShrink: "0",
                                  }}
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill={
                                    themeName === "dark-theme"
                                      ? "rgb(231, 233, 234)"
                                      : themeName === "light-theme"
                                      ? "rgb(16, 23, 42)"
                                      : themeName === "cyber-punk-theme"
                                      ? "rgb(16, 23, 42)"
                                      : null
                                  }
                                  className={`${
                                    arrowAnimationStatusDown
                                      ? "arrow_animation_active_down rotate"
                                      : "arrow_animation_done_down rotate"
                                  }`}
                                  aria-hidden="true"
                                >
                                  <path
                                    fill-rule="evenodd"
                                    d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                                    clip-rule="evenodd"
                                  ></path>
                                </svg>
                              </div>
                              <div
                                style={{
                                  color:
                                    themeName === "dark-theme"
                                      ? "rgb(231, 233, 234)"
                                      : themeName === "light-theme"
                                      ? "rgb(16, 23, 42)"
                                      : themeName === "cyber-punk-theme"
                                      ? "rgb(16, 23, 42)"
                                      : null,
                                }}
                                className="fs-15 lh-20 chirp-heavy-font"
                              >
                                Managing Coworkers and Friends:{" "}
                              </div>
                              <div
                                onClick={handleTabChangeForward}
                                onMouseEnter={arrowAnimationActiveForward}
                                onMouseLeave={arrowAnimationRemoveForward}
                                className="dflex pointer"
                              >
                                <svg
                                  style={{
                                    height: "1rem",
                                    width: "1rem",
                                    flexShrink: "0",
                                  }}
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill={
                                    themeName === "dark-theme"
                                      ? "rgb(231, 233, 234)"
                                      : themeName === "light-theme"
                                      ? "rgb(16, 23, 42)"
                                      : themeName === "cyber-punk-theme"
                                      ? "rgb(16, 23, 42)"
                                      : null
                                  }
                                  className={`${
                                    arrowAnimationStatusForward
                                      ? "arrow_animation_active_forward"
                                      : "arrow_animation_done_forward"
                                  }`}
                                  aria-hidden="true"
                                >
                                  <path
                                    fill-rule="evenodd"
                                    d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                                    clip-rule="evenodd"
                                  ></path>
                                </svg>
                              </div>
                            </div>
                            <div
                              className="chirp-regular-font fs-15 lh-20"
                              style={{
                                marginTop: "12px",
                                color:
                                  themeName === "dark-theme"
                                    ? "rgb(231, 233, 234)"
                                    : themeName === "light-theme"
                                    ? "rgb(16, 23, 42)"
                                    : themeName === "cyber-punk-theme"
                                    ? "rgb(16, 23, 42)"
                                    : null,
                              }}
                            >
                              You can switch to the "Coworkers" or "Friends"
                              tabs from the navigation bar on the right side.
                            </div>
                            <div
                              className="chirp-regular-font fs-15 lh-20"
                              style={{
                                marginTop: "12px",
                                color:
                                  themeName === "dark-theme"
                                    ? "rgb(231, 233, 234)"
                                    : themeName === "light-theme"
                                    ? "rgb(16, 23, 42)"
                                    : themeName === "cyber-punk-theme"
                                    ? "rgb(16, 23, 42)"
                                    : null,
                              }}
                            >
                              Clicking on each tab allows you to view and manage
                              the coworkers or friends you have added in detail.
                            </div>
                            <div
                              className="chirp-regular-font fs-15 lh-20"
                              style={{
                                marginTop: "12px",
                                color:
                                  themeName === "dark-theme"
                                    ? "rgb(231, 233, 234)"
                                    : themeName === "light-theme"
                                    ? "rgb(16, 23, 42)"
                                    : themeName === "cyber-punk-theme"
                                    ? "rgb(16, 23, 42)"
                                    : null,
                              }}
                            >
                              You can expand or collapse either the Coworkers or
                              Friends list and examine your connections in
                              detail.
                            </div>
                          </div>
                        ) : index === 5 ? (
                          <div className="p-16">
                            <div
                              className="dflex "
                              style={{
                                justifyContent: "flex-start",
                                gap: "12px",
                                alignItems: "center",
                                height: "42px",
                              }}
                            >
                              {" "}
                              <div
                                onClick={handleTabChangeDown}
                                onMouseEnter={arrowAnimationActiveDown}
                                onMouseLeave={arrowAnimationRemoveDown}
                                className="dflex pointer"
                              >
                                <svg
                                  style={{
                                    height: "1rem",
                                    width: "1rem",
                                    flexShrink: "0",
                                  }}
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill={
                                    themeName === "dark-theme"
                                      ? "rgb(231, 233, 234)"
                                      : themeName === "light-theme"
                                      ? "rgb(16, 23, 42)"
                                      : themeName === "cyber-punk-theme"
                                      ? "rgb(16, 23, 42)"
                                      : null
                                  }
                                  className={`${
                                    arrowAnimationStatusDown
                                      ? "arrow_animation_active_down rotate"
                                      : "arrow_animation_done_down rotate"
                                  }`}
                                  aria-hidden="true"
                                >
                                  <path
                                    fill-rule="evenodd"
                                    d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                                    clip-rule="evenodd"
                                  ></path>
                                </svg>
                              </div>
                              <div
                                style={{
                                  color:
                                    themeName === "dark-theme"
                                      ? "rgb(231, 233, 234)"
                                      : themeName === "light-theme"
                                      ? "rgb(16, 23, 42)"
                                      : themeName === "cyber-punk-theme"
                                      ? "rgb(16, 23, 42)"
                                      : null,
                                }}
                                className="fs-15 lh-20 chirp-heavy-font"
                              >
                                Removing and Ending Communication:
                              </div>
                            </div>
                            <div
                              className="chirp-regular-font fs-15 lh-20"
                              style={{
                                marginTop: "12px",
                                color:
                                  themeName === "dark-theme"
                                    ? "rgb(231, 233, 234)"
                                    : themeName === "light-theme"
                                    ? "rgb(16, 23, 42)"
                                    : themeName === "cyber-punk-theme"
                                    ? "rgb(16, 23, 42)"
                                    : null,
                              }}
                            >
                              If you want to end communication with a friend or
                              coworker, you can remove the respective person
                              from the list using the "Remove" or "Disconnect"
                              button.
                            </div>
                            <div
                              className="chirp-regular-font fs-15 lh-20"
                              style={{
                                marginTop: "12px",
                                color:
                                  themeName === "dark-theme"
                                    ? "rgb(231, 233, 234)"
                                    : themeName === "light-theme"
                                    ? "rgb(16, 23, 42)"
                                    : themeName === "cyber-punk-theme"
                                    ? "rgb(16, 23, 42)"
                                    : null,
                              }}
                            >
                              After ending the communication, you can send a new
                              request if you wish to reconnect.
                            </div>
                          </div>
                        ) : null}
                      </Popover>
                    </div>
                  )}
                </PopupState>
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
          {selectedUser && (
            <div
              className="dflex algncenter"
              style={{
                gap: "12px",
                position: "sticky",
                right: "0px",
                // top: "53px",
                top: "0px",
                width: "100%",
                justifyContent: "flex-start",
                height: "53px",
                backgroundColor: "rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(12px)",
                zIndex: 9999,
              }}
            >
              <div className="dflex">
                {selectedUser?.profilePicture !==
                "default_profile_picture_url" ? (
                  <img
                    src={selectedUser?.profilePicture}
                    width={32}
                    height={32}
                    alt=""
                    style={{
                      paddingLeft: "12px",
                    }}
                  />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    fill={"rgb(83, 100, 113)"}
                    style={{
                      paddingLeft: "12px",
                    }}
                    className="bi bi-person-circle"
                    viewBox="0 0 16 16"
                  >
                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                    <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1" />
                  </svg>
                )}
              </div>
              <div className="fs-15 lh-20 chirp-medium-font color-dark-text">
                {selectedUser?.username}
              </div>
            </div>
          )}
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
              onClick={searchCoworkerModal}
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
              onClick={searchFriendModal}
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
            <div
              style={{
                marginTop: "60px",
                gap: "25px",
              }}
              className="color-dark-text fs-23 lh-28 chirp-extended-heavy  dflex"
            >
              <span>
                <svg
                  width={40}
                  height={40}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <g>
                    <path d="M1.998 5.5c0-1.381 1.119-2.5 2.5-2.5h15c1.381 0 2.5 1.119 2.5 2.5v13c0 1.381-1.119 2.5-2.5 2.5h-15c-1.381 0-2.5-1.119-2.5-2.5v-13zm2.5-.5c-.276 0-.5.224-.5.5v2.764l8 3.638 8-3.636V5.5c0-.276-.224-.5-.5-.5h-15zm15.5 5.463l-8 3.636-8-3.638V18.5c0 .276.224.5.5.5h15c.276 0 .5-.224.5-.5v-8.037z"></path>
                  </g>
                </svg>
              </span>
              <div>
                <div>To start chatting, add your friends or coworkers.</div>
                <div
                  onClick={searchPeopleModal}
                  className="text_decoration_underline pointer fs-15 lh-20 chirp-regular-font fs-15 lh-20 "
                  style={{
                    color: "#36bbf7",
                  }}
                >
                  Click here to see the search input.{" "}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
