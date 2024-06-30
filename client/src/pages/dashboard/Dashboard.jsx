import { useContext, useEffect, useRef, useState } from "react";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSocket } from "../../context/SocketContext";
import { Avatar, AvatarGroup, Popover, Modal } from "@mui/material";
import PopupState, { bindTrigger, bindPopover } from "material-ui-popup-state";
import { ThemeContext } from "../../context/ThemeContext";
import { useAntdMessageHandler } from "../../utils/useAntdMessageHandler";
import useWindowDimensions from "../../utils/window-dimensions";
import LoadingSpinner from "../../Components/LoadingSpinner/LoadingSpinner";
import { createAuthHeader } from "../../utils/apiUtils";

const API_URL = import.meta.env.VITE_API_URL;

function Dashboard() {
  const { user, refreshUser, updateUser, setUser } = useUser();
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
  const { width } = useWindowDimensions();
  // chatting conversation start to check

  const getAllUsers = async () => {
    try {
      const result = await axios.get(`${API_URL}/users`, {
        headers: createAuthHeader(),
      });
      setUsers(result.data);
    } catch (error) {
      console.error("error:", error);
      throw error;
    }
  };

  const filterUsers = (array, searchStr) => {
    const toLowerCaseSearchStr = searchStr.toLowerCase();
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
    if (user?.id) {
      refreshUser();
    }
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
          headers: createAuthHeader(),
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
          headers: createAuthHeader(),
        }
      );
      if (user?.id) {
        getConversations();
      }

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
  const [loading, setLoading] = useState(null);
  const getConversations = async () => {
    try {
      const result = await axios.get(`${API_URL}/conversations/${user?.id}`, {
        headers: createAuthHeader(),
      });
      setLoading(false);
      setConversations(result.data);
    } catch (error) {
      console.log("error:", error);
      throw error;
    }
  };

  useEffect(() => {
    setLoading(true);
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
    if (!selectedUser) {
      console.error(
        "selectedUser is null or undefined, cannot fetch conversation."
      );
      return;
    }

    try {
      const result = await axios.get(
        `${API_URL}/conversations/find/${user?.id}/${selectedUser?.id}`,
        {
          headers: createAuthHeader(),
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
        { headers: createAuthHeader() }
      );
      if (user?.id) {
        getConversations();
      }
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
    if (user?.id) {
      refreshUser();
      getConversations();
      const interval = setInterval(() => {
        refreshUser();
        getConversations();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, []);

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
    if (arrivalMessage) {
      getConversations();
    }
  }, [arrivalMessage]);

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
  const [show, setShow] = useState(false);
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
  const [showSearchPeopleModal, setShowSearchPeopleModal] = useState(false);
  const searchPeopleModal = () => {
    if (user?.id) {
      refreshUser();
    }
    getAllUsers();
    setShowSearchPeopleModal(true);
  };
  const handleCloseSearchPeopleModal = () => {
    setShowSearchPeopleModal(false);
    setFilteredUsers(null);
    setSearchInput("");
  };

  // search coworker modal
  const [showSearchCoworkerModal, setShowSearchCoworkerModal] = useState(false);
  const searchCoworkerModal = () => {
    setShowSearchCoworkerModal(true);
  };
  const handleCloseSearchCoworkerModal = () => {
    setShowSearchCoworkerModal(false);
    setFilteredUsers(null);
    setSearchInput("");
  };

  // search friend modal
  const [showSearchFriendModal, setShowSearchFriendModal] = useState(false);
  const searchFriendModal = () => {
    setShowSearchFriendModal(true);
  };
  const handleCloseSearchFriendModal = () => {
    setShowSearchFriendModal(false);
    setFilteredUsers(null);
    setSearchInput("");
  };

  // manage request start to check
  const [hovered, setHovered] = useState(null);

  // send coworker request
  const sendCoworkerRequest = async (requesterId, recipientId) => {
    // optimistic ui for send coworker request
    const foundRecipient = filteredUsers?.filter((eachUser) => {
      return eachUser.id === recipientId;
    })[0];
    const lastId =
      user.sentCoworkerRequests[user.sentCoworkerRequests.length - 1]?.id + 1 ||
      1;
    const data = {
      id: lastId,
      requester: user,
      recipient: foundRecipient,
      requesterId: requesterId,
      recipientId: recipientId,
      status: "pending",
    };
    const newList = [...user.sentCoworkerRequests, data];
    updateUser({ ...user, sentCoworkerRequests: newList });
    try {
      const result = await axios.post(
        `${API_URL}/coworker-requests`,
        {
          requesterId,
          recipientId,
        },
        {
          headers: createAuthHeader(),
        }
      );
      const { status, message, reverseRequest } = result.data;
      if (status === "reverse_request_accepted") {
        setShowSearchPeopleModal(false);
        showCustomMessage(
          "You have added this user to your coworker list. They had previously sent you a coworker request which was pending.",
          6
        );
      }
      if (user?.id) {
        refreshUser();
      }
      getAllUsers();
    } catch (error) {
      console.error("error:", error);
      throw error;
    }
  };

  // cancel coworker request
  const [showCancelCoworkerReqModal, setShowCancelCoworkerReqModal] =
    useState(false);
  const [recipientInfoCancelCReq, setRecipientInfoCancelCReq] = useState(null);
  const [recipientId, setRecipientId] = useState(null);
  const openCancelCReqModal = (recipient) => {
    setShowCancelFriendReqModal(false);
    setShowCancelCoworkerReqModal(true);
    setRecipientInfoCancelFReq(null);
    setRecipientInfoCancelCReq(recipient);
    setRecipientId(recipient.id);
  };
  const closeCancelCreqModal = () => {
    setShowCancelCoworkerReqModal(false);
  };

  const coworkerRequestId = user?.sentCoworkerRequests?.filter((eachReq) => {
    return eachReq.recipientId === recipientId;
  });

  const cancelCoworkerRequest = async () => {
    // optimistic ui for cancel coworker request
    const newArray = user.sentCoworkerRequests?.filter((eachRequest) => {
      return eachRequest.recipient.id !== coworkerRequestId[0]?.recipient.id;
    });

    setShowCancelFriendReqModal(false);
    setShowCancelCoworkerReqModal(false);
    updateUser({ ...user, sentCoworkerRequests: newArray });
    try {
      await axios.delete(
        `${API_URL}/coworker-requests/${coworkerRequestId[0]?.id}`,
        {
          headers: createAuthHeader(),
        }
      );

      setRecipientInfoCancelCReq(null);
      setRecipientInfoCancelFReq(null);
      if (user?.id) {
        refreshUser();
      }
      getAllUsers();
    } catch (error) {
      console.error("error:", error);
      throw error;
    }
  };

  // send friend request
  const sendFriendRequest = async (requesterId, recipientId) => {
    // optimistic ui for send friend request
    const foundRecipient = filteredUsers?.filter((eachUser) => {
      return eachUser.id === recipientId;
    })[0];
    const lastId =
      user.sentFriendRequests[user.sentFriendRequests.length - 1]?.id + 1 || 1;
    const data = {
      id: lastId,
      requester: user,
      recipient: foundRecipient,
      requesterId: requesterId,
      recipientId: recipientId,
      status: "pending",
    };
    const newList = [...user.sentFriendRequests, data];
    updateUser({ ...user, sentFriendRequests: newList });
    try {
      const result = await axios.post(
        `${API_URL}/friend-requests`,
        {
          requesterId,
          recipientId,
        },
        {
          headers: createAuthHeader(),
        }
      );

      const { status, message, reverseRequest } = result.data;
      if (status === "reverse_request_accepted") {
        setShowSearchPeopleModal(false);
        showCustomMessage(
          "You have added this user to your friend list. They had previously sent you a friend request which was pending.",
          6
        );
      }
      if (user?.id) {
        refreshUser();
      }
      getAllUsers();
    } catch (error) {
      console.error("error:", error);
      throw error;
    }
  };
  // cancel friend request
  const [recipientInfoCancelFReq, setRecipientInfoCancelFReq] = useState(null);
  const [showCancelFriendReqModal, setShowCancelFriendReqModal] =
    useState(false);
  const [recipientIdF, setRecipientIdF] = useState(null);

  const openCancelFReqModal = (recipient) => {
    setShowCancelFriendReqModal(true);
    setShowCancelCoworkerReqModal(false);
    setRecipientInfoCancelCReq(null);
    setRecipientInfoCancelFReq(recipient);
    setRecipientIdF(recipient.id);
  };
  const closeCancelFReqModal = () => {
    setShowCancelFriendReqModal(false);
  };

  const friendRequestId = user?.sentFriendRequests?.filter((eachReq) => {
    return eachReq.recipientId === recipientIdF;
  });
  const cancelFriendRequest = async () => {
    // optimistic ui for cancel friend request
    const newArray = user.sentFriendRequests?.filter((eachRequest) => {
      return eachRequest.recipient.id !== friendRequestId[0]?.recipient.id;
    });

    setShowCancelFriendReqModal(false);
    setShowCancelCoworkerReqModal(false);
    updateUser({ ...user, sentFriendRequests: newArray });
    try {
      await axios.delete(
        `${API_URL}/friend-requests/${friendRequestId[0]?.id}`,
        {
          headers: createAuthHeader(),
        }
      );
      setShowCancelFriendReqModal(false);
      setShowCancelCoworkerReqModal(false);
      setRecipientInfoCancelCReq(null);
      setRecipientInfoCancelFReq(null);
      if (user?.id) {
        refreshUser();
      }
      getAllUsers();
    } catch (error) {
      console.error("error:", error);
      throw error;
    }
  };

  // manage request finish to check

  // friends list management
  const [coworkerIds, setCoworkerIds] = useState([]);
  const [friendIds, setFriendIds] = useState([]);
  const getCoworkerIds = () => {
    const coworkerIds = user?.coworkers?.map((eachCoworker) => {
      return eachCoworker.coworkerId;
    });
    return coworkerIds;
  };
  const getFriendIds = () => {
    const friendIds = user?.friends?.map((eachFriend) => {
      return eachFriend.friendId;
    });
    return friendIds;
  };

  useEffect(() => {
    if (user?.coworkers?.length > 0) {
      getCoworkerIds();
    }
    if (user?.friends?.length > 0) {
      getFriendIds();
    }
  }, [user?.coworkers, user?.friends]);

  // remove coworker
  const [showRemoveCoworkerModal, setShowRemoveCoworkerModal] = useState(false);
  const [coworkerToRemove, setCoworkerToRemove] = useState(false);

  const openRemoveCoworkerModal = (userToRemove) => {
    setShowRemoveCoworkerModal(true);
    setCoworkerToRemove(userToRemove);
  };
  const closeRemoveCoworkerModal = () => {
    setShowRemoveCoworkerModal(false);
    setCoworkerToRemove(null);
  };

  const removeCoworker = async (userId) => {
    // optimistic ui for remove coworker
    const newArray = user.coworkers?.filter((eachCoworker) => {
      return eachCoworker.coworkerId !== userId;
    });

    setShowRemoveCoworkerModal(false);
    updateUser({ ...user, coworkers: newArray });
    try {
      await axios.delete(`${API_URL}/coworker/${userId}/users/${user?.id}`, {
        headers: createAuthHeader(),
      });
      setShowRemoveCoworkerModal(false);
      setCoworkerToRemove(null);
      if (user?.id) {
        refreshUser();
      }
      getAllUsers();
    } catch (error) {
      console.error("error:", error);
      throw error;
    }
  };

  // remove friend
  const [showRemoveFriendModal, setShowRemoveFriendModal] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState(false);

  const openRemoveFriendModal = (userToRemove) => {
    setShowRemoveFriendModal(true);
    setFriendToRemove(userToRemove);
  };
  const closeRemoveFriendModal = () => {
    setShowRemoveFriendModal(false);
    setFriendToRemove(null);
  };

  const removeFriend = async (userId) => {
    // optimistic ui for remove friend
    const newArray = user.friends?.filter((eachFriend) => {
      return eachFriend.friendId !== userId;
    });

    setShowRemoveFriendModal(false);
    updateUser({ ...user, friends: newArray });
    try {
      await axios.delete(`${API_URL}/friend/${userId}/users/${user?.id}`, {
        headers: createAuthHeader(),
      });
      setShowRemoveFriendModal(false);
      setFriendToRemove(null);
      if (user?.id) {
        refreshUser();
      }
      getAllUsers();
    } catch (error) {
      console.error("error:", error);
      throw error;
    }
  };

  useEffect(() => {
    getAllUsers();
  }, [user]);

  // find pending requests
  const requestedCoworkerUserIdsStatusPENDING = () => {
    return user?.sentCoworkerRequests
      ?.filter((eachRequest) => {
        return (
          eachRequest.requesterId === user.id &&
          eachRequest.status === "pending"
        );
      })
      .map((eachRequest) => eachRequest.recipientId);
  };

  const requestedFriendUserIdsStatusPENDING = () => {
    return user?.sentFriendRequests
      ?.filter((eachRequest) => {
        return (
          eachRequest.requesterId === user.id &&
          eachRequest.status === "pending"
        );
      })
      .map((eachRequest) => eachRequest.recipientId);
  };

  return (
    <>
      {" "}
      {contextHolder}
      {/* showRemoveCoworkerModal */}
      <>
        <Modal
          className="z-9999 p-0 m-0"
          open={showRemoveCoworkerModal}
          onClose={closeRemoveCoworkerModal}
          sx={{
            "& > .MuiBackdrop-root": {
              opacity: "0.8 !important",
            },
          }}
        >
          <div
            className="shadow_div_white p-abs border-r-4 none-outline border-r-16"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              maxWidth: 320,
            }}
          >
            <div className="dflex fdir-column p-32">
              <span
                style={{
                  marginBottom: "8px",
                }}
                className="fs-20 lh-24 chirp-bold-font"
              >
                Remove coworker?
              </span>
              <div
                className="fs-15 lh-20 chirp-regular-font w-100 txt-alg-left"
                style={{
                  color: "rgb(83, 100, 113)",
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
                  Are you sure you want to remove @{coworkerToRemove?.username}{" "}
                  from your coworkers list? This will delete the coworker
                  relationship, and you both will no longer see each other in
                  your coworkers list.
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
                    removeCoworker(coworkerToRemove?.id);
                  }}
                  style={{
                    marginBottom: "12px",
                    minHeight: "44px",
                    minWidth: "44px",
                    paddingLeft: "24px",
                    paddingRight: "24px",
                    backgroundColor: "rgb(244,33,45)",
                    color: "rgb(231, 233, 234)",
                    border: "1px solid rgb(207, 217, 222)",
                  }}
                  className="w-100 border-r-999 fs-15 lh-20 chirp-bold-font red-btn-hover-effect pointer"
                >
                  <div className="w-100 txt-alg-center">Remove</div>
                </button>
                <button
                  onClick={() => {
                    closeRemoveCoworkerModal();
                  }}
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
                  <div className="w-100 txt-alg-center">Cancel</div>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </>
      {/* showRemoveCoworkerModal */}
      {/* showRemoveFriendModal */}
      <>
        <Modal
          className="z-9999 p-0 m-0"
          open={showRemoveFriendModal}
          onClose={closeRemoveFriendModal}
          sx={{
            "& > .MuiBackdrop-root": {
              opacity: "0.8 !important",
            },
          }}
        >
          <div
            className="shadow_div_white p-abs border-r-4 none-outline border-r-16"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              maxWidth: 320,
            }}
          >
            <div className="dflex fdir-column p-32">
              <span
                style={{
                  marginBottom: "8px",
                }}
                className="fs-20 lh-24 chirp-bold-font"
              >
                Remove friend?
              </span>
              <div
                className="fs-15 lh-20 chirp-regular-font w-100 txt-alg-left"
                style={{
                  color: "rgb(83, 100, 113)",
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
                  Are you sure you want to remove @{friendToRemove?.username}{" "}
                  from your friends list? This will delete your friendship, and
                  you both will no longer see each other in your friends list.
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
                    removeFriend(friendToRemove?.id);
                  }}
                  style={{
                    marginBottom: "12px",
                    minHeight: "44px",
                    minWidth: "44px",
                    paddingLeft: "24px",
                    paddingRight: "24px",
                    backgroundColor: "rgb(244,33,45)",
                    color: "rgb(231, 233, 234)",
                    border: "1px solid rgb(207, 217, 222)",
                  }}
                  className="w-100 border-r-999 fs-15 lh-20 chirp-bold-font red-btn-hover-effect pointer"
                >
                  <div className="w-100 txt-alg-center">Remove</div>
                </button>
                <button
                  onClick={() => {
                    closeRemoveFriendModal();
                  }}
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
                  <div className="w-100 txt-alg-center">Cancel</div>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </>
      {/* showRemoveFriendModal */}
      {/* showCancelFriendReqModal */}
      <>
        <Modal
          className="z-9999 p-0 m-0"
          open={showCancelFriendReqModal}
          onClose={closeCancelFReqModal}
          sx={{
            "& > .MuiBackdrop-root": {
              opacity: "0.8 !important",
            },
          }}
        >
          <div
            className="shadow_div_white p-abs border-r-4 none-outline border-r-16"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              maxWidth: 320,
            }}
          >
            <div className="dflex fdir-column p-32">
              <span
                style={{
                  marginBottom: "8px",
                }}
                className="fs-20 lh-24 chirp-bold-font"
              >
                Discard friend request?
              </span>
              <div
                className="fs-15 lh-20 chirp-regular-font w-100 txt-alg-left"
                style={{
                  color: "rgb(83, 100, 113)",
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
                    cancelFriendRequest();
                  }}
                  style={{
                    marginBottom: "12px",
                    minHeight: "44px",
                    minWidth: "44px",
                    paddingLeft: "24px",
                    paddingRight: "24px",
                    backgroundColor: "#0F141A",
                    color: "rgb(231, 233, 234)",
                    border: "1px solid rgb(207, 217, 222)",
                  }}
                  className="w-100 border-r-999 fs-15 lh-20 chirp-bold-font dark_btn_hover_effect pointer"
                >
                  <div className="w-100 txt-alg-center">Discard</div>
                </button>
                <button
                  onClick={() => {
                    setShowCancelFriendReqModal(false);
                    setShowCancelCoworkerReqModal(false);
                    setRecipientInfoCancelCReq(null);
                    setRecipientInfoCancelFReq(null);
                  }}
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
                  <div className="w-100 txt-alg-center">Cancel</div>
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
          sx={{
            "& > .MuiBackdrop-root": {
              opacity: "0.8 !important",
            },
          }}
        >
          <div
            className="shadow_div_white p-abs border-r-4 none-outline border-r-16"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              maxWidth: 320,
            }}
          >
            <div className="dflex fdir-column p-32">
              <span
                style={{
                  marginBottom: "8px",
                }}
                className="fs-20 lh-24 chirp-bold-font"
              >
                Discard coworker request?
              </span>
              <div
                className="fs-15 lh-20 chirp-regular-font w-100 txt-alg-left"
                style={{
                  color: "rgb(83, 100, 113)",
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
                    cancelCoworkerRequest();
                  }}
                  style={{
                    marginBottom: "12px",
                    minHeight: "44px",
                    minWidth: "44px",
                    paddingLeft: "24px",
                    paddingRight: "24px",
                    backgroundColor: "#0F141A",
                    color: "rgb(231, 233, 234)",
                    border: "1px solid rgb(207, 217, 222)",
                  }}
                  className="w-100 border-r-999 fs-15 lh-20 chirp-bold-font dark_btn_hover_effect pointer"
                >
                  <div className="w-100 txt-alg-center">Discard</div>
                </button>
                <button
                  onClick={() => {
                    setShowCancelFriendReqModal(false);
                    setShowCancelCoworkerReqModal(false);
                    setRecipientInfoCancelCReq(null);
                    setRecipientInfoCancelFReq(null);
                  }}
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
                  <div className="w-100 txt-alg-center">Cancel</div>
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
          sx={{
            "& > .MuiBackdrop-root": {
              opacity: "0.8 !important",
            },
          }}
        >
          <div
            className="shadow_div_white p-abs border-r-4 none-outline"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: width <= 768 ? "100%" : 600,
              height: width <= 768 ? "100%" : 600,
            }}
          >
            <div
              className="shadow_div_white p-16 p-abs border-r-4 p-fix z-9999 border-r-16"
              style={{
                width: width <= 768 ? "100%" : "600px",
                height: width <= 768 ? "100%" : "600px",
                maxWidth: width <= 768 ? "100%" : "600px",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                minWidth: "fit-content",
                overflowY: "auto",
              }}
            >
              <div
                className="p-abs border-r-50 pointer"
                onClick={handleCloseSearchPeopleModal}
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
                          key={eachUser?.id}
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
                              key={eachUser?.id}
                            >
                              <div>
                                {eachUser.profilePicture !==
                                "default_profile_picture_url" ? (
                                  <div
                                    className="dflex jfycenter algncenter border-r-50"
                                    style={{
                                      width: "44px",
                                      height: "44px",
                                    }}
                                  >
                                    <img
                                      className="border-r-50"
                                      src={eachUser.profilePicture}
                                      width={40}
                                      height={40}
                                      alt=""
                                    />{" "}
                                  </div>
                                ) : (
                                  <div
                                    className="dflex jfycenter algncenter border-r-50"
                                    style={{
                                      width: "44px",
                                      height: "44px",
                                    }}
                                    href=""
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="40"
                                      height="40"
                                      fill={"rgb(83, 100, 113)"}
                                      className="bi bi-person-circle border-r-50"
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
                                      isAlreadyCoworker:
                                        getCoworkerIds().includes(eachUser.id),
                                      itemIndex: itemIndex,
                                    })
                                  }
                                  onMouseLeave={() => setHovered(null)}
                                  onClick={() => {
                                    if (
                                      !requestedCoworkerUserIdsStatusPENDING().includes(
                                        eachUser.id
                                      ) &&
                                      !getCoworkerIds().includes(eachUser.id)
                                    ) {
                                      sendCoworkerRequest(
                                        user?.id,
                                        eachUser.id
                                      );
                                    } else if (
                                      getCoworkerIds().includes(eachUser.id)
                                    ) {
                                      openRemoveCoworkerModal(eachUser);
                                    } else {
                                      openCancelCReqModal(eachUser);
                                    }
                                  }}
                                  className={`fs-14 lh-16 chirp-bold-font jfycenter algncenter pointer circle_hover_accept ${
                                    (requestedCoworkerUserIdsStatusPENDING().includes(
                                      eachUser.id
                                    ) ||
                                      getCoworkerIds().includes(eachUser.id)) &&
                                    !hovered?.isAlreadyCoworker
                                      ? "cancel_btn_hover_effect"
                                      : (requestedCoworkerUserIdsStatusPENDING().includes(
                                          eachUser.id
                                        ) ||
                                          getCoworkerIds().includes(
                                            eachUser.id
                                          )) &&
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
                                      (requestedCoworkerUserIdsStatusPENDING().includes(
                                        eachUser.id
                                      ) ||
                                        getCoworkerIds().includes(
                                          eachUser.id
                                        )) &&
                                      !hovered?.isAlreadyCoworker
                                        ? "rgb(16, 23, 42)"
                                        : (requestedCoworkerUserIdsStatusPENDING().includes(
                                            eachUser.id
                                          ) ||
                                            getCoworkerIds().includes(
                                              eachUser.id
                                            )) &&
                                          hovered?.isAlreadyCoworker &&
                                          hovered?.itemIndex === itemIndex
                                        ? "rgb(244, 33, 46)"
                                        : hovered?.itemIndex !== itemIndex &&
                                          requestedCoworkerUserIdsStatusPENDING().includes(
                                            eachUser.id
                                          )
                                        ? "rgb(16, 23, 42)"
                                        : getCoworkerIds().includes(eachUser.id)
                                        ? "rgb(16, 23, 42)"
                                        : "rgb(231, 233, 234)",
                                    backgroundColor:
                                      requestedCoworkerUserIdsStatusPENDING().includes(
                                        eachUser.id
                                      ) ||
                                      getCoworkerIds().includes(eachUser.id)
                                        ? "transparent"
                                        : "#0F141A",
                                    overflow: "hidden",
                                    position: "relative",
                                    minWidth: "166px",
                                    boxSizing: "border-box",
                                  }}
                                >
                                  {!getCoworkerIds().includes(eachUser.id) ? (
                                    <>
                                      {!getCoworkerIds().includes(
                                        eachUser?.id
                                      ) &&
                                      !requestedCoworkerUserIdsStatusPENDING().includes(
                                        eachUser?.id
                                      )
                                        ? "Add Coworker"
                                        : requestedCoworkerUserIdsStatusPENDING().includes(
                                            eachUser?.id
                                          ) &&
                                          hovered?.itemIndex !== itemIndex &&
                                          hovered?.option !== "coworker"
                                        ? "Pending"
                                        : hovered.option === "coworker" &&
                                          hovered?.itemIndex === itemIndex
                                        ? "Cancel"
                                        : hovered?.option === "friend"
                                        ? "Pending"
                                        : "Pending"}
                                    </>
                                  ) : (
                                    <>
                                      {getCoworkerIds().includes(
                                        eachUser?.id
                                      ) &&
                                      hovered?.itemIndex !== itemIndex &&
                                      hovered?.option !== "coworker"
                                        ? "Already a Coworker"
                                        : hovered?.option === "friend" ||
                                          hovered?.itemIndex !== itemIndex
                                        ? "Already a Coworker"
                                        : "Remove"}
                                    </>
                                  )}
                                </div>

                                <div
                                  onMouseEnter={() =>
                                    setHovered({
                                      id: eachUser.id,
                                      option: "friend",
                                      isAlreadyFriend: getFriendIds().includes(
                                        eachUser.id
                                      ),
                                      itemIndex: itemIndex,
                                    })
                                  }
                                  onMouseLeave={() => setHovered(null)}
                                  onClick={() => {
                                    if (
                                      !requestedFriendUserIdsStatusPENDING().includes(
                                        eachUser.id
                                      ) &&
                                      !getFriendIds().includes(eachUser.id)
                                    ) {
                                      sendFriendRequest(user?.id, eachUser.id);
                                    } else if (
                                      getFriendIds().includes(eachUser.id)
                                    ) {
                                      openRemoveFriendModal(eachUser);
                                    } else {
                                      openCancelFReqModal(eachUser);
                                    }
                                  }}
                                  className={`fs-14 lh-16 chirp-bold-font jfycenter algncenter pointer circle_hover_accept ${
                                    (requestedFriendUserIdsStatusPENDING().includes(
                                      eachUser.id
                                    ) ||
                                      getFriendIds().includes(eachUser.id)) &&
                                    !hovered?.isAlreadyFriend
                                      ? "cancel_btn_hover_effect"
                                      : (requestedFriendUserIdsStatusPENDING().includes(
                                          eachUser.id
                                        ) ||
                                          getFriendIds().includes(
                                            eachUser.id
                                          )) &&
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
                                      (requestedFriendUserIdsStatusPENDING().includes(
                                        eachUser.id
                                      ) ||
                                        getFriendIds().includes(eachUser.id)) &&
                                      !hovered?.isAlreadyFriend
                                        ? "rgb(16, 23, 42)"
                                        : (requestedFriendUserIdsStatusPENDING().includes(
                                            eachUser.id
                                          ) ||
                                            getFriendIds().includes(
                                              eachUser.id
                                            )) &&
                                          hovered?.isAlreadyFriend &&
                                          hovered?.itemIndex === itemIndex
                                        ? "rgb(244, 33, 46)"
                                        : hovered?.itemIndex !== itemIndex &&
                                          requestedFriendUserIdsStatusPENDING().includes(
                                            eachUser.id
                                          )
                                        ? "rgb(16, 23, 42)"
                                        : getFriendIds().includes(eachUser.id)
                                        ? "rgb(16, 23, 42)"
                                        : "rgb(231, 233, 234)",
                                    backgroundColor:
                                      requestedFriendUserIdsStatusPENDING().includes(
                                        eachUser.id
                                      ) || getFriendIds().includes(eachUser.id)
                                        ? "transparent"
                                        : "#0F141A",
                                    overflow: "hidden",
                                    position: "relative",
                                    minWidth: "166px",
                                    boxSizing: "border-box",
                                  }}
                                >
                                  {!getFriendIds().includes(eachUser.id) ? (
                                    <>
                                      {!getFriendIds().includes(eachUser?.id) &&
                                      !requestedFriendUserIdsStatusPENDING().includes(
                                        eachUser?.id
                                      )
                                        ? "Add Friend"
                                        : requestedFriendUserIdsStatusPENDING().includes(
                                            eachUser?.id
                                          ) &&
                                          hovered?.itemIndex !== itemIndex &&
                                          hovered?.option !== "friend"
                                        ? "Pending"
                                        : hovered.option === "friend" &&
                                          hovered?.itemIndex === itemIndex
                                        ? "Cancel"
                                        : hovered?.option === "coworker"
                                        ? "Pending"
                                        : "Pending"}
                                    </>
                                  ) : (
                                    <>
                                      {getFriendIds().includes(eachUser?.id) &&
                                      hovered?.itemIndex !== itemIndex &&
                                      hovered?.option !== "friend"
                                        ? "Already a Friend"
                                        : hovered?.option === "coworker" ||
                                          hovered?.itemIndex !== itemIndex
                                        ? "Already a Friend"
                                        : "Remove"}
                                    </>
                                  )}
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
          sx={{
            "& > .MuiBackdrop-root": {
              opacity: "0.8 !important",
            },
          }}
        >
          <div
            className="shadow_div_white p-abs border-r-4 none-outline"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: width <= 768 ? "100%" : 600,
              height: width <= 768 ? "100%" : 600,
            }}
          >
            {" "}
            <div
              className="shadow_div_white p-16 p-abs border-r-16 z-9999 p-fix"
              style={{
                width: width <= 768 ? "100%" : "600px",
                height: width <= 768 ? "100%" : "600px",
                maxWidth: width <= 768 ? "100%" : "600px",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                minWidth: "fit-content",
                overflowY: "auto",
              }}
            >
              {user?.coworkers?.length > 0 ? (
                <>
                  <div
                    className="p-abs border-r-50 pointer"
                    onClick={handleCloseSearchCoworkerModal}
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
                              key={eachUser?.user.id}
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
                                        className="dflex jfycenter algncenter pointer border-r-50"
                                        style={{
                                          width: "44px",
                                          height: "44px",
                                        }}
                                      >
                                        <img
                                          className="border-r-50"
                                          src={eachUser?.user?.profilePicture}
                                          width={40}
                                          height={40}
                                          alt=""
                                        />{" "}
                                      </div>
                                    ) : (
                                      <div
                                        className="dflex jfycenter algncenter border-r-50 pointer"
                                        style={{
                                          width: "44px",
                                          height: "44px",
                                        }}
                                        href=""
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="40"
                                          height="40"
                                          fill={"rgb(83, 100, 113)"}
                                          className="bi bi-person-circle border-r-50"
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
                        })}{" "}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="dflex jfycenter p-32">
                  <div
                    style={{
                      maxWidth: "350px",
                    }}
                  >
                    <div
                      className="chirp-heavy-font"
                      style={{
                        fontSize: "31px",
                        lineHeight: "36px",
                        margin: "10px",
                      }}
                    >
                      Looking for coworkers?
                    </div>
                    <div
                      className="chirp-regular-font fs-15 lh-20"
                      style={{
                        color: "rgb(83, 100, 113)",
                        margin: "10px",
                      }}
                    >
                      Currently, there are no coworkers added to your list. You
                      can add coworkers by using the 'Add Coworker' button.
                    </div>
                  </div>
                </div>
              )}{" "}
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
          sx={{
            "& > .MuiBackdrop-root": {
              opacity: "0.8 !important",
            },
          }}
        >
          <div
            className="shadow_div_white p-abs border-r-4 none-outline"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: width <= 768 ? "100%" : 600,
              height: width <= 768 ? "100%" : 600,
            }}
          >
            <div
              className="shadow_div_white p-16 p-abs border-r-16 p-fix z-9999"
              style={{
                width: width <= 768 ? "100%" : "600px",
                height: width <= 768 ? "100%" : "600px",
                maxWidth: width <= 768 ? "100%" : "600px",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                minWidth: "fit-content",
                overflowY: "auto",
              }}
            >
              {user?.friends?.length > 0 ? (
                <>
                  <div
                    className="border-r-50 pointer p-abs"
                    onClick={handleCloseSearchFriendModal}
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
                              key={eachUser?.user.id}
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
                                        className="dflex jfycenter algncenter border-r-50 pointer"
                                        style={{
                                          width: "44px",
                                          height: "44px",
                                        }}
                                      >
                                        <img
                                          className="border-r-50"
                                          src={eachUser?.user?.profilePicture}
                                          width={40}
                                          height={40}
                                          alt=""
                                        />{" "}
                                      </div>
                                    ) : (
                                      <div
                                        className="dflex jfycenter algncenter border-r-50 pointer"
                                        style={{
                                          width: "44px",
                                          height: "44px",
                                        }}
                                        href=""
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="40"
                                          height="40"
                                          fill={"rgb(83, 100, 113)"}
                                          className="bi bi-person-circle border-r-50"
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
                </>
              ) : (
                <>
                  <div className="dflex jfycenter p-32">
                    <div
                      style={{
                        maxWidth: "350px",
                      }}
                    >
                      <div
                        className="chirp-heavy-font"
                        style={{
                          fontSize: "31px",
                          lineHeight: "36px",
                          margin: "10px",
                        }}
                      >
                        Looking for friends?
                      </div>
                      <div
                        className="chirp-regular-font fs-15 lh-20"
                        style={{
                          color: "rgb(83, 100, 113)",
                          margin: "10px",
                        }}
                      >
                        Currently, there are no friends added to your list. You
                        can add friends by using the 'Add Friend' button.
                      </div>
                    </div>
                  </div>
                </>
              )}
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
      <div className="bt-1px h-100 w-100 dflex">
        {" "}
        <div
          className="h-100 border-box"
          style={{
            flex: 1,
            overflowY: "auto",
          }}
        >
          <div>
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
                              key={eachConv?.id}
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
                                    className="image-hover-effect dflex jfycenter algncenter border-r-50 pointer"
                                    style={{
                                      width: "44px",
                                      height: "44px",
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
                                      className="border-r-50"
                                    />{" "}
                                  </div>
                                ) : (
                                  <div
                                    className="dflex jfycenter algncenter border-r-50 pointer"
                                    style={{
                                      width: "44px",
                                      height: "44px",
                                    }}
                                    href=""
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="40"
                                      height="40"
                                      fill={"rgb(83, 100, 113)"}
                                      className="bi bi-person-circle border-r-50"
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
              ) : loading ? (
                <div className="p-16">
                  <LoadingSpinner
                    strokeColor={"rgb(29, 155, 240)"}
                  ></LoadingSpinner>{" "}
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
                          className="chirp-extended-heavy fs-15 lh-20 pointer p-abs"
                          style={{
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
                              className="dflex"
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
          className="bl-1px h-100"
          style={{
            maxHeight: "100vh",
            overflowY: "auto",
            position: "relative",
            flex: 2,
            boxSizing: "border-box",
          }}
        >
          {selectedUser && (
            <div
              className="dflex algncenter"
              style={{
                gap: "12px",
                position: "sticky",
                right: "0px",
                top: "0px",
                width: "100%",
                justifyContent: "flex-start",
                height: "53px",
                backgroundColor: "rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div
                onClick={() => setSelectedUser(null)}
                style={{
                  width: "36px",
                  height: " 36px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginLeft: "4px",
                }}
              >
                <svg
                  fill="currentColor"
                  width={20}
                  height={20}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="r-4qtqp9 r-yyyyoo r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-z80fyv r-19wmn03"
                >
                  <g>
                    <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"></path>
                  </g>
                </svg>
              </div>
              <div className="dflex">
                {selectedUser?.profilePicture !==
                "default_profile_picture_url" ? (
                  <img
                    src={selectedUser?.profilePicture}
                    width={32}
                    height={32}
                    alt=""
                    style={{
                      borderRadius: "50%",
                    }}
                  />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    fill={"rgb(83, 100, 113)"}
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
            <div>
              {conversation?.Message?.length > 0 && (
                <>
                  {conversation?.Message.map((eachMessage) => {
                    return (
                      <div
                        className="w-100"
                        ref={scrollRef}
                        style={{
                          textAlign:
                            eachMessage?.sender?.id === user?.id
                              ? "right"
                              : "left",
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
            </div>
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
          {selectedUser && (
            <div
              style={{
                position: "sticky",
                width: "100%",
                bottom: "0px",
                height: "53px",
                maxHeight: "53px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="w-100 dflex jfycenter algncenter">
                <input
                  className="border-1px fs-15 lh-20 chirp-regular-font"
                  style={{
                    borderRadius: "9999px",
                    height: "42px",
                    outlineStyle: "none",
                    paddingLeft: "15px",
                    paddingRight: "36px",
                    width: "100%",
                    margin: "0px 12px",
                  }}
                  placeholder={"Start a new message"}
                  onChange={(e) => setMessage(e.target.value)}
                  value={message}
                  autoFocus={true}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      sendMessage();
                    }
                  }}
                />
                <svg
                  style={{
                    right: "27px",
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
          )}
        </div>
        <div
          style={{
            flex: 1,
            boxSizing: "border-box",
            display: width <= 768 && "none",
          }}
          className="bl-1px h-100"
        >
          <div
            style={{
              gap: "12px",
            }}
            onClick={searchCoworkerModal}
            className="color-dark-text fs-23 lh-28 chirp-extended-heavy pointer dflex p-16"
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
            style={{
              gap: "12px",
            }}
            onClick={searchFriendModal}
            className="color-dark-text fs-23 lh-28 chirp-extended-heavy pointer dflex p-16"
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
              gap: "12px",
            }}
            className="color-dark-text fs-23 lh-28 chirp-extended-heavy dflex p-16"
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
    </>
  );
}

export default Dashboard;
