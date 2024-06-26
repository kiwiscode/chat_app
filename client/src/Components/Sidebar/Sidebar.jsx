import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import "../../index.css";
import "./Sidebar.css";
import axios from "axios";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import useWindowDimensions from "../../utils/window-dimensions";
import { Modal } from "@mui/material";
const API_URL = "http://localhost:3000";

function Sidebar() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticatedUser, handleLogout, updateUser } = useUser();
  const [requests, setRequests] = useState({
    coworkerRequests: [],
    friendRequests: [],
  });

  const handleParentClick = () => {
    setShow(false);
  };
  const handleChildClick = (event) => {
    event.stopPropagation();
  };

  const [effect, setEffect] = useState(null);
  // file upload
  const [profileImage, setprofileImage] = useState("");
  const [changingBar, setChangingBar] = useState(false);
  const handleChangeProfileImage = (e) => {
    const file = e.target.files[0];
    handleChangeProfileImageSetFileToBase(file);
    setShow(false);
  };

  const handleChangeProfileImageSetFileToBase = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setprofileImage(reader.result);
    };
  };

  const changeProfileImage = async () => {
    setChangingBar(true);

    try {
      const result = await axios.post(
        `${API_URL}/users/${user?.id}/change_profile_image`,
        {
          image: profileImage,
        },
        {
          withCredentials: true,
        }
      );
      updateUser({ profilePicture: result.data.imageInfo.url });
      if (result.data.imageInfo.url) {
        setChangingBar(false);
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("error:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (profileImage) {
      changeProfileImage();
    }
  }, [profileImage]);

  // get coworker requests
  const getCoworkerRequests = async () => {
    try {
      const result = await axios.get(
        `${API_URL}/${user?.id}/coworker-requests`,
        {
          withCredentials: true,
        }
      );
      const { coworkerRequests } = result?.data;
      setRequests((prev) => ({
        ...prev,
        coworkerRequests: coworkerRequests,
      }));
    } catch (error) {
      console.error("error:", error);
      throw error;
    }
  };

  // get friend requests
  const getFriendRequests = async () => {
    try {
      const result = await axios.get(`${API_URL}/${user?.id}/friend-requests`, {
        withCredentials: true,
      });
      const { friendRequests } = result?.data;
      setRequests((prev) => ({
        ...prev,
        friendRequests: friendRequests,
      }));
    } catch (error) {
      console.error("error:", error);
      throw error;
    }
  };

  console.log("state requests:", requests);

  useEffect(() => {
    if (user?.id) {
      getCoworkerRequests();
      getFriendRequests();
    }
  }, [user?.id]);

  // coworkers && friends modal
  const { width } = useWindowDimensions();

  const [showCRequestsModal, setShowCRequestsModal] = useState(null);
  const [showFRequestsModal, setShowFRequestsModal] = useState(null);
  const [showCoworkers, setShowCoworkers] = useState(true);
  const [showCoworkerRequests, setShowCoworkerRequests] = useState(null);
  const [showFriends, setShowFriends] = useState(true);
  const [showFriendRequests, setShowFriendRequests] = useState(null);

  const handleOpenCReqModal = () => {
    setShowCRequestsModal(true);
  };
  const handleOpenFReqModal = () => {
    setShowFRequestsModal(true);
  };

  const handleCloseCReqModal = () => {
    setShowCRequestsModal(false);
  };
  const handleCloseFReqModal = () => {
    setShowFRequestsModal(false);
  };

  // coworkers modal toggle view
  const toggleViewCoworkersModal = (active) => {
    if (active === "Coworkers") {
      setShowCoworkers(true);
      setShowCoworkerRequests(false);
    } else if (active === "Requests") {
      setShowCoworkers(false);
      setShowCoworkerRequests(true);
    }
  };

  // friends modal toggle view
  const toggleViewFriendsModal = (active) => {
    if (active === "Friends") {
      setShowFriends(true);
      setShowFriendRequests(false);
    } else if (active === "Requests") {
      setShowFriends(false);
      setShowFriendRequests(true);
    }
  };

  // coworker requests accept & reject
  const handleAcceptCRequest = async (
    itemIndex,
    requestId,
    requesterId,
    recipientId
  ) => {
    try {
      const coworkerRequestsCopy = [...requests.coworkerRequests];
      const acceptedRequest = coworkerRequestsCopy.splice(itemIndex, 1)[0];
      console.log("accepted request:", acceptedRequest);
      setRequests((prev) => ({
        ...prev,
        coworkerRequests: coworkerRequestsCopy,
      }));

      const newData = {
        coworkerId: acceptedRequest.requesterId,
        id: null,
        user: acceptedRequest.requester,
        userId: user?.id,
      };
      updateUser({ coworkers: [newData, ...user.coworkers] });
      await axios.post(
        `${API_URL}/coworker-requests/${requestId}/accept`,
        {
          requesterId,
          recipientId,
        },
        { withCredentials: true }
      );
    } catch (error) {
      console.log("error:", error);
      throw error;
    }
  };

  const handleRejectCRequest = async (
    itemIndex,
    requestId,
    requesterId,
    recipientId
  ) => {
    try {
      const coworkerRequestsCopy = [...requests.coworkerRequests];
      coworkerRequestsCopy.splice(itemIndex, 1);
      setRequests((prev) => ({
        ...prev,
        coworkerRequests: coworkerRequestsCopy,
      }));
      await axios.post(
        `${API_URL}/coworker-requests/${requestId}/reject`,
        {
          requesterId,
          recipientId,
        },
        { withCredentials: true }
      );
    } catch (error) {
      console.log("error:", error);
      throw error;
    }
  };
  // friend requests accept & reject
  const handleAcceptFRequest = async (
    itemIndex,
    requestId,
    requesterId,
    recipientId
  ) => {
    try {
      const friendRequestsCopy = [...requests.friendRequests];
      const acceptedRequest = friendRequestsCopy.splice(itemIndex, 1)[0];

      console.log("accepted request:", acceptedRequest);

      const newData = {
        friendId: acceptedRequest.requesterId,
        id: null,
        user: acceptedRequest.requester,
        userId: user?.id,
      };
      updateUser({ friends: [newData, ...user.friends] });
      setRequests((prev) => ({
        ...prev,
        friendRequests: friendRequestsCopy,
      }));
      await axios.post(
        `${API_URL}/friend-requests/${requestId}/accept`,
        {
          requesterId,
          recipientId,
        },
        { withCredentials: true }
      );
    } catch (error) {
      console.log("error:", error);
      throw error;
    }
  };

  const handleRejectFRequest = async (
    itemIndex,
    requestId,
    requesterId,
    recipientId
  ) => {
    try {
      const friendRequestsCopy = [...requests.coworkerRequests];
      friendRequestsCopy.splice(itemIndex, 1);
      setRequests((prev) => ({
        ...prev,
        friendRequests: friendRequestsCopy,
      }));
      await axios.post(
        `${API_URL}/friend-requests/${requestId}/reject`,
        {
          requesterId,
          recipientId,
        },
        { withCredentials: true }
      );
    } catch (error) {
      console.log("error:", error);
      throw error;
    }
  };

  return (
    <>
      <>
        {/* coworkers modal */}
        <Modal
          className="z-9999 p-0 m-0"
          open={showCRequestsModal}
          onClose={handleCloseCReqModal}
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
            <div className="dflex">
              <div
                className="dflex jfycenter pointer toggle-view-hover-effect"
                style={{
                  width: "50%",
                  height: "53px",
                  borderTopLeftRadius: "4px",
                }}
                onClick={() => toggleViewCoworkersModal("Coworkers")}
              >
                <div
                  className="dflex jfycenter h-100 fdir-column"
                  style={{
                    position: "relative",
                  }}
                >
                  <div
                    className={
                      showCoworkers
                        ? "chirp-heavy-font fs-15 lh-20"
                        : "chirp-medium-font fs-15 lh-20"
                    }
                    style={{
                      color: showCoworkers
                        ? "rgb(16, 23, 42)"
                        : "rgb(83, 100, 113)",
                    }}
                  >
                    Coworkers
                  </div>
                  {showCoworkers && (
                    <div
                      className="p-abs w-100"
                      style={{
                        height: "4px",
                        bottom: "0px",
                        backgroundColor: "#1C9BEF",
                        borderRadius: "4px",
                      }}
                    ></div>
                  )}
                </div>
              </div>
              <div
                className="dflex jfycenter pointer toggle-view-hover-effect"
                style={{
                  width: "50%",
                  height: "53px",
                  borderTopRightRadius: "4px",
                }}
                onClick={() => toggleViewCoworkersModal("Requests")}
              >
                <div className="dflex jfycenter h-100 fdir-column p-rel ">
                  <div
                    className={
                      showCoworkerRequests
                        ? "chirp-heavy-font fs-15 lh-20"
                        : "chirp-medium-font fs-15 lh-20"
                    }
                    style={{
                      color: showCoworkerRequests
                        ? "rgb(16, 23, 42)"
                        : "rgb(83, 100, 113)",
                    }}
                  >
                    Requests
                  </div>
                  {showCoworkerRequests && (
                    <div
                      className="p-abs w-100"
                      style={{
                        height: "4px",
                        bottom: "0px",
                        backgroundColor: "#1C9BEF",
                        borderRadius: "4px",
                      }}
                    ></div>
                  )}
                </div>
              </div>
            </div>
            {showCoworkers && (
              <>
                {user?.coworkers?.length > 0 ? (
                  <>
                    <div>
                      {user.coworkers.map((eachCoworker, itemIndex) => {
                        return (
                          <div
                            className="p-16 border-r-4 dflex algncenter each-message-parent-div"
                            style={{
                              justifyContent: "flex-start",
                              gap: "12px",
                              marginLeft: "16px",
                              marginRight: "16px",
                            }}
                            key={eachCoworker?.user?.id}
                          >
                            <div>
                              {eachCoworker?.user?.profilePicture !==
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
                                    src={eachCoworker?.user?.profilePicture}
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
                              {eachCoworker?.user?.username}
                            </div>
                            <div
                              className="dflex algncenter w-100"
                              style={{
                                justifyContent: "flex-end",
                                gap: "12px",
                              }}
                            >
                              <div
                                className="fs-15 lh-20 chirp-bold-font jfycenter algncenter pointer circle_hover_accept"
                                style={{
                                  border: "1px solid rgb(207, 217, 222)",
                                  display: "inline-flex",
                                  borderRadius: "9999px",
                                  minWidth: "32px",
                                  minHeight: "32px",
                                  padding: "0px 16px",
                                  width: "80px",
                                  color: "rgb(29, 155, 240)",
                                }}
                              >
                                Options
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div
                    className="dflex jfycenter"
                    style={{
                      padding: "32px",
                    }}
                  >
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
                        When someone adds this account as coworker they'll show
                        up here.{" "}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            {showCoworkerRequests && (
              <>
                {requests?.coworkerRequests?.length > 0 ? (
                  <>
                    <div>
                      {requests.coworkerRequests.map(
                        (eachCRequest, itemIndex) => {
                          return (
                            <div
                              className="p-16 border-r-4 dflex algncenter each-message-parent-div"
                              style={{
                                justifyContent: "flex-start",
                                gap: "12px",
                                marginLeft: "16px",
                                marginRight: "16px",
                              }}
                              key={eachCRequest.id}
                            >
                              <div>
                                {eachCRequest?.requester?.profilePicture !==
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
                                      src={
                                        eachCRequest?.requester?.profilePicture
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
                                {eachCRequest?.requester?.username}
                              </div>
                              <div
                                className="dflex algncenter w-100"
                                style={{
                                  justifyContent: "flex-end",
                                  gap: "12px",
                                }}
                              >
                                <div
                                  onClick={() => {
                                    handleRejectCRequest(
                                      itemIndex,
                                      eachCRequest.id,
                                      eachCRequest.requester.id,
                                      eachCRequest.recipient.id
                                    );
                                  }}
                                  className="fs-15 lh-20 chirp-bold-font jfycenter algncenter pointer circle_hover_reject"
                                  style={{
                                    display: "inline-flex",
                                    border: "1px solid rgb(253, 201, 206)",
                                    borderRadius: "9999px",
                                    minWidth: "32px",
                                    minHeight: "32px",
                                    padding: "0px 16px",
                                    width: "80px",
                                    color: "rgb(244, 33, 46)",
                                  }}
                                >
                                  Decline
                                </div>
                                <div
                                  onClick={() => {
                                    handleAcceptCRequest(
                                      itemIndex,
                                      eachCRequest.id,
                                      eachCRequest.requester.id,
                                      eachCRequest.recipient.id
                                    );
                                  }}
                                  className="fs-15 lh-20 chirp-bold-font jfycenter algncenter pointer circle_hover_accept"
                                  style={{
                                    border: "1px solid rgb(207, 217, 222)",
                                    display: "inline-flex",
                                    borderRadius: "9999px",
                                    minWidth: "32px",
                                    minHeight: "32px",
                                    padding: "0px 16px",
                                    width: "80px",
                                    color: "rgb(29, 155, 240)",
                                  }}
                                >
                                  Accept
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </>
                ) : (
                  <div
                    className="dflex jfycenter"
                    style={{
                      padding: "32px",
                    }}
                  >
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
                        Coworker Requests
                      </div>
                      <div
                        className="chirp-regular-font fs-15 lh-20"
                        style={{
                          color: "rgb(83, 100, 113)",
                          margin: "10px",
                        }}
                      >
                        You currently have no coworker requests.If you receive a
                        coworker request, it will be shown here.
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Modal>
      </>
      {/* friends modal  */}
      <>
        <Modal
          className="z-9999 p-0 m-0"
          open={showFRequestsModal}
          onClose={handleCloseFReqModal}
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
            <div className="dflex">
              <div
                className="dflex jfycenter pointer toggle-view-hover-effect"
                style={{
                  width: "50%",
                  height: "53px",
                  borderTopLeftRadius: "4px",
                }}
                onClick={() => toggleViewFriendsModal("Friends")}
              >
                <div
                  className="dflex jfycenter h-100 fdir-column"
                  style={{
                    position: "relative",
                  }}
                >
                  <div
                    className={
                      showFriends
                        ? "chirp-heavy-font fs-15 lh-20"
                        : "chirp-medium-font fs-15 lh-20"
                    }
                    style={{
                      color: showFriends
                        ? "rgb(16, 23, 42)"
                        : "rgb(83, 100, 113)",
                    }}
                  >
                    Friends
                  </div>
                  {showFriends && (
                    <div
                      className="p-abs w-100"
                      style={{
                        height: "4px",
                        bottom: "0px",
                        backgroundColor: "#1C9BEF",
                        borderRadius: "4px",
                      }}
                    ></div>
                  )}
                </div>
              </div>
              <div
                className="dflex jfycenter pointer toggle-view-hover-effect"
                style={{
                  width: "50%",
                  height: "53px",
                  borderTopRightRadius: "4px",
                }}
                onClick={() => toggleViewFriendsModal("Requests")}
              >
                <div className="dflex jfycenter h-100 fdir-column p-rel ">
                  <div
                    className={
                      showFriendRequests
                        ? "chirp-heavy-font fs-15 lh-20"
                        : "chirp-medium-font fs-15 lh-20"
                    }
                    style={{
                      color: showFriendRequests
                        ? "rgb(16, 23, 42)"
                        : "rgb(83, 100, 113)",
                    }}
                  >
                    Requests
                  </div>
                  {showFriendRequests && (
                    <div
                      className="p-abs w-100"
                      style={{
                        height: "4px",
                        bottom: "0px",
                        backgroundColor: "#1C9BEF",
                        borderRadius: "4px",
                      }}
                    ></div>
                  )}
                </div>
              </div>
            </div>
            {showFriends && (
              <>
                {user?.friends?.length > 0 ? (
                  <>
                    <div>
                      {user.friends.map((eachFriend, itemIndex) => {
                        return (
                          <div
                            className="p-16 border-r-4 dflex algncenter each-message-parent-div"
                            style={{
                              justifyContent: "flex-start",
                              gap: "12px",
                              marginLeft: "16px",
                              marginRight: "16px",
                            }}
                            key={eachFriend?.user?.id}
                          >
                            <div>
                              {eachFriend?.user?.profilePicture !==
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
                                    src={eachFriend?.user?.profilePicture}
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
                              {eachFriend?.user?.username}
                            </div>
                            <div
                              className="dflex algncenter w-100"
                              style={{
                                justifyContent: "flex-end",
                                gap: "12px",
                              }}
                            >
                              <div
                                className="fs-15 lh-20 chirp-bold-font jfycenter algncenter pointer circle_hover_accept"
                                style={{
                                  border: "1px solid rgb(207, 217, 222)",
                                  display: "inline-flex",
                                  borderRadius: "9999px",
                                  minWidth: "32px",
                                  minHeight: "32px",
                                  padding: "0px 16px",
                                  width: "80px",
                                  color: "rgb(29, 155, 240)",
                                }}
                              >
                                Options
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div
                    className="dflex jfycenter"
                    style={{
                      padding: "32px",
                    }}
                  >
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
                        When someone adds this account as friend they'll show up
                        here.{" "}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            {showFriendRequests && (
              <>
                {requests?.friendRequests?.length > 0 ? (
                  <>
                    <div>
                      {requests.friendRequests.map(
                        (eachCRequest, itemIndex) => {
                          return (
                            <div
                              className="p-16 border-r-4 dflex algncenter each-message-parent-div"
                              style={{
                                justifyContent: "flex-start",
                                gap: "12px",
                                marginLeft: "16px",
                                marginRight: "16px",
                              }}
                              key={eachCRequest.id}
                            >
                              <div>
                                {eachCRequest?.requester?.profilePicture !==
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
                                      src={
                                        eachCRequest?.requester?.profilePicture
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
                                {eachCRequest?.requester?.username}
                              </div>
                              <div
                                className="dflex algncenter w-100"
                                style={{
                                  justifyContent: "flex-end",
                                  gap: "12px",
                                }}
                              >
                                <div
                                  onClick={() => {
                                    handleRejectFRequest(
                                      itemIndex,
                                      eachCRequest.id,
                                      eachCRequest.requester.id,
                                      eachCRequest.recipient.id
                                    );
                                  }}
                                  className="fs-15 lh-20 chirp-bold-font jfycenter algncenter pointer circle_hover_reject"
                                  style={{
                                    display: "inline-flex",
                                    border: "1px solid rgb(253, 201, 206)",
                                    borderRadius: "9999px",
                                    minWidth: "32px",
                                    minHeight: "32px",
                                    padding: "0px 16px",
                                    width: "80px",
                                    color: "rgb(244, 33, 46)",
                                  }}
                                >
                                  Decline
                                </div>
                                <div
                                  onClick={() => {
                                    handleAcceptFRequest(
                                      itemIndex,
                                      eachCRequest.id,
                                      eachCRequest.requester.id,
                                      eachCRequest.recipient.id
                                    );
                                  }}
                                  className="fs-15 lh-20 chirp-bold-font jfycenter algncenter pointer circle_hover_accept"
                                  style={{
                                    border: "1px solid rgb(207, 217, 222)",
                                    display: "inline-flex",
                                    borderRadius: "9999px",
                                    minWidth: "32px",
                                    minHeight: "32px",
                                    padding: "0px 16px",
                                    width: "80px",
                                    color: "rgb(29, 155, 240)",
                                  }}
                                >
                                  Accept
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </>
                ) : (
                  <div
                    className="dflex jfycenter"
                    style={{
                      padding: "32px",
                    }}
                  >
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
                        Friend Requests
                      </div>
                      <div
                        className="chirp-regular-font fs-15 lh-20"
                        style={{
                          color: "rgb(83, 100, 113)",
                          margin: "10px",
                        }}
                      >
                        You currently have no friend requests.If you receive a
                        friend request, it will be shown here.
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Modal>
      </>

      <div
        className="dflex algncenter"
        style={{
          position: "sticky",
          right: "0px",
          top: "0px",
          width: "100%",
          justifyContent: "space-between",
          height: "53px",
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(12px)",
          zIndex: 9999,
        }}
      >
        <div
          onBlur={() => setShow(false)}
          onClick={() => setShow(true)}
          className="chirp-extended-heavy pointer brand_text"
          style={{
            position: "relative",
            left: "15px",
            fontSize: "16px",
            lineHeight: "24px",
          }}
        >
          <span className="color-sky-blue-text">chat</span>
          <span className="color-dark-text">swift</span>
        </div>
        <div
          onBlur={() => setShow(false)}
          onClick={() => setShow(true)}
          style={{
            position: "relative",
            right: "15px",
            pointerEvents: changingBar && "none",
          }}
          className="pointer"
        >
          {!changingBar ? (
            <>
              {!isAuthenticatedUser ? (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    width="1em"
                    height="1em"
                    fill="currentColor"
                    focusable="false"
                    aria-hidden="true"
                  >
                    <path d="M.75 2.25h22.5a.75.75 0 0 0 0-1.5H.75a.75.75 0 0 0 0 1.5m22.5 19.5H.75a.75.75 0 0 0 0 1.5h22.5a.75.75 0 0 0 0-1.5m-22.5-9h12a.75.75 0 0 0 0-1.5h-12a.75.75 0 0 0 0 1.5"></path>
                  </svg>
                </>
              ) : (
                <>
                  <div
                    style={{
                      height: "100%",
                      transitionDuration: "0.2s",
                      outlineStyle: "none",
                      width: "40px",
                      height: "40px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {user?.profilePicture !== "default_profile_picture_url" ? (
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
                          src={user?.profilePicture}
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
                </>
              )}
            </>
          ) : (
            <LoadingSpinner
              fontSize={true}
              strokeColor={"#36bbf7"}
            ></LoadingSpinner>
          )}
        </div>
      </div>
      {show && (
        <div
          onClick={() => {
            handleParentClick();
          }}
          className="dflex"
          style={{
            position: "fixed",
            left: 0,
            bottom: 0,
            top: 0,
            right: 0,
            zIndex: 9999,
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        >
          <div
            onClick={handleChildClick}
            className="mobile-top-navigation-column p-abs dflex"
            style={{
              right: "0px",
              maxWidth: "70%",
              minWidth: "280px",
              height: "100vh",
              minHeight: "0px",
              flexDirection: "column",
              flexShrink: "1",
              flexGrow: "1",
              overflowY: "auto",
              zIndex: 9999,
              pointerEvents: "auto",
              backgroundColor: "white",
              boxShadow:
                "rgba(101, 119, 134, 0.2) 0px 0px 8px 0px, rgba(101, 119, 134, 0.25) 0px 1px 3px 1px",
            }}
          >
            {isAuthenticatedUser ? (
              <>
                <div
                  className="dflex algncenter algncenter"
                  style={{
                    padding: "32px",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      textAlign: "center",
                    }}
                  >
                    <div
                      onClick={() => {
                        setShow(false);
                      }}
                      className={
                        effect === "dashboard_div"
                          ? "slide_up_effect  color-dark-text"
                          : "color-dark-text"
                      }
                      onMouseEnter={() => setEffect("dashboard_div")}
                      onMouseLeave={() => setEffect(null)}
                      style={{
                        padding: "16px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        transition: "transform 0.3s ease",
                      }}
                    >
                      Dashboard
                    </div>
                  </div>
                  <div
                    onClick={handleOpenCReqModal}
                    style={{
                      width: "100%",
                      textAlign: "center",
                      marginTop: "16px",
                    }}
                  >
                    <div
                      className={
                        effect === "coworkers_div"
                          ? "slide_up_effect  color-dark-text"
                          : "color-dark-text"
                      }
                      onMouseEnter={() => setEffect("coworkers_div")}
                      onMouseLeave={() => setEffect(null)}
                      style={{
                        padding: "16px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        transition: "transform 0.3s ease",
                      }}
                    >
                      Coworkers
                    </div>
                  </div>
                  <div
                    onClick={handleOpenFReqModal}
                    style={{
                      width: "100%",
                      marginTop: "16px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      className={
                        effect === "friends_div"
                          ? "slide_up_effect color-dark-text"
                          : " color-dark-text"
                      }
                      onMouseEnter={() => setEffect("friends_div")}
                      onMouseLeave={() => setEffect(null)}
                      style={{
                        padding: "16px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        transition: "transform 0.3s ease",
                      }}
                    >
                      Friends
                    </div>
                  </div>
                  <div
                    onClick={() =>
                      document
                        .getElementById("formuploadModal-profile-image")
                        .click()
                    }
                    style={{
                      width: "100%",
                      marginTop: "16px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      className={
                        effect === "add_picture"
                          ? "slide_up_effect color-dark-text"
                          : " color-dark-text"
                      }
                      onMouseEnter={() => setEffect("add_picture")}
                      onMouseLeave={() => setEffect(null)}
                      style={{
                        padding: "16px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        transition: "transform 0.3s ease",
                      }}
                    >
                      {user?.profilePicture !== "default_profile_picture_url"
                        ? "Change your picture"
                        : "Add picture"}
                    </div>{" "}
                    <input
                      onChange={handleChangeProfileImage}
                      type="file"
                      id="formuploadModal-profile-image"
                      name="profileImage"
                      className="form-control"
                      style={{ display: "none" }}
                    />
                  </div>

                  <div
                    style={{
                      width: "100%",
                      marginTop: "16px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      className={
                        "color-white-text border-r-4 fs-15 pointer p-16 dark-btn-hover-effect"
                      }
                      onClick={() => {
                        setShow(false);
                        handleLogout();
                      }}
                      style={{
                        transition: "transform 0.3s ease",
                        backgroundColor: "green",
                        lineHeight: "20px",
                        backgroundColor: "rgb(16,23,42)",
                      }}
                    >
                      Log out @{user?.username}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {" "}
                <div
                  className="dflex jfycenter algncenter"
                  style={{
                    padding: "32px",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      textAlign: "center",
                    }}
                  >
                    <div
                      className={
                        effect === "something"
                          ? "slide_up_effect  color-dark-text"
                          : "color-dark-text"
                      }
                      onMouseEnter={() => setEffect("something")}
                      onMouseLeave={() => setEffect(null)}
                      style={{
                        padding: "16px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        transition: "transform 0.3s ease",
                      }}
                    >
                      Something
                    </div>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      textAlign: "center",
                      marginTop: "16px",
                    }}
                  >
                    <div
                      className={
                        effect === "Something_2"
                          ? "slide_up_effect  color-dark-text"
                          : "color-dark-text"
                      }
                      onMouseEnter={() => setEffect("Something_2")}
                      onMouseLeave={() => setEffect(null)}
                      style={{
                        padding: "16px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        transition: "transform 0.3s ease",
                      }}
                    >
                      Something 2
                    </div>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      marginTop: "16px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      className={
                        effect === "Something_3"
                          ? "slide_up_effect color-dark-text"
                          : " color-dark-text"
                      }
                      onMouseEnter={() => setEffect("Something_3")}
                      onMouseLeave={() => setEffect(null)}
                      style={{
                        padding: "16px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        transition: "transform 0.3s ease",
                      }}
                    >
                      Something 3
                    </div>
                  </div>
                  <div
                    onClick={() => navigate("/")}
                    style={{
                      width: "100%",
                      marginTop: "16px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      className={
                        "color-white-text border-r-4 fs-15 pointer p-16 dark-btn-hover-effect"
                      }
                      onClick={() => {
                        setShow(false);
                      }}
                      style={{
                        transition: "transform 0.3s ease",
                        backgroundColor: "green",
                        lineHeight: "20px",
                        backgroundColor: "rgb(16,23,42)",
                      }}
                    >
                      Register
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>{" "}
        </div>
      )}
    </>
  );
}

export default Sidebar;
