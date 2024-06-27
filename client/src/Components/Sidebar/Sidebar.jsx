import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import "../../index.css";
import "./Sidebar.css";
import axios from "axios";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import useWindowDimensions from "../../utils/window-dimensions";
import { Modal } from "@mui/material";
import config from "../../config/config";
const API_URL = config.backendUrl;

function Sidebar() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticatedUser, handleLogout, updateUser, refreshUser } =
    useUser();

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

  // coworkers && friends modal
  const { width } = useWindowDimensions();

  const [showCRequestsModal, setShowCRequestsModal] = useState(false);
  const [showFRequestsModal, setShowFRequestsModal] = useState(false);
  const [showCoworkers, setShowCoworkers] = useState(false);
  const [showCoworkerRequests, setShowCoworkerRequests] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showFriendRequests, setShowFriendRequests] = useState(false);

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
    refreshUser();
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
      await axios.post(
        `${API_URL}/coworker-requests/${requestId}/accept`,
        {
          requesterId,
          recipientId,
        },
        { withCredentials: true }
      );
      refreshUser();
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
      await axios.post(
        `${API_URL}/coworker-requests/${requestId}/reject`,
        {
          requesterId,
          recipientId,
        },
        { withCredentials: true }
      );
      refreshUser();
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
      await axios.post(
        `${API_URL}/friend-requests/${requestId}/accept`,
        {
          requesterId,
          recipientId,
        },
        { withCredentials: true }
      );
      refreshUser();
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
      await axios.post(
        `${API_URL}/friend-requests/${requestId}/reject`,
        {
          requesterId,
          recipientId,
        },
        { withCredentials: true }
      );
      refreshUser();
    } catch (error) {
      console.log("error:", error);
      throw error;
    }
  };

  const pendingCoworkerRequests =
    user?.receivedCoworkerRequests?.filter(
      (request) => request.status === "pending"
    ) || [];
  const pendingFriendRequests =
    user?.receivedFriendRequests?.filter(
      (request) => request.status === "pending"
    ) || [];

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
    try {
      await axios.delete(`${API_URL}/coworker/${userId}/users/${user?.id}`);
      setShowRemoveCoworkerModal(false);
      setCoworkerToRemove(null);
      refreshUser();
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
    try {
      await axios.delete(`${API_URL}/friend/${userId}/users/${user?.id}`);
      setShowRemoveFriendModal(false);
      setFriendToRemove(null);
      refreshUser();
      getAllUsers();
    } catch (error) {
      console.error("error:", error);
      throw error;
    }
  };

  const [hovered_index, setHovered_index] = useState(null);
  const [hovered_div, setHovered_div] = useState(null);

  return (
    <>
      <>
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
              className="shadow_div_white p-abs border-r-4 none-outline"
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                maxWidth: 320,
                borderRadius: "16px",
              }}
            >
              <div
                className="dflex fdir-column"
                style={{
                  padding: "32px",
                }}
              >
                <span
                  style={{
                    marginBottom: "8px",
                  }}
                  className="fs-20 lh-24 chirp-bold-font"
                >
                  Remove coworker?
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
                    Are you sure you want to remove @
                    {coworkerToRemove?.username} from your coworkers list? This
                    will delete the coworker relationship, and you both will no
                    longer see each other in your coworkers list.
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
                      borderRadius: "9999px",
                      paddingLeft: "24px",
                      paddingRight: "24px",
                      backgroundColor: "rgb(244,33,45)",
                      color: "rgb(231, 233, 234)",
                      border: "1px solid rgb(207, 217, 222)",
                    }}
                    className="w-100 border-r-999 fs-15 lh-20 chirp-bold-font red-btn-hover-effect pointer"
                  >
                    <div
                      style={{
                        width: "100%",
                        textAlign: "center",
                      }}
                    >
                      Remove
                    </div>
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
              className="shadow_div_white p-abs border-r-4 none-outline"
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                maxWidth: 320,
                borderRadius: "16px",
              }}
            >
              <div
                className="dflex fdir-column"
                style={{
                  padding: "32px",
                }}
              >
                <span
                  style={{
                    marginBottom: "8px",
                  }}
                  className="fs-20 lh-24 chirp-bold-font"
                >
                  Remove friend?
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
                    Are you sure you want to remove @{friendToRemove?.username}{" "}
                    from your friends list? This will delete your friendship,
                    and you both will no longer see each other in your friends
                    list.
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
                      borderRadius: "9999px",
                      paddingLeft: "24px",
                      paddingRight: "24px",
                      backgroundColor: "rgb(244,33,45)",
                      color: "rgb(231, 233, 234)",
                      border: "1px solid rgb(207, 217, 222)",
                    }}
                    className="w-100 border-r-999 fs-15 lh-20 chirp-bold-font red-btn-hover-effect pointer"
                  >
                    <div
                      style={{
                        width: "100%",
                        textAlign: "center",
                      }}
                    >
                      Remove
                    </div>
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
        {/* showRemoveFriendModal */}
        {/* coworkers modal */}
        <Modal
          className="z-9999 p-0 m-0"
          open={showCRequestsModal}
          onClose={handleCloseCReqModal}
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
              width: 600,
              height: 600,
              borderRadius: "16px",
            }}
          >
            <div className="dflex">
              <div
                className="dflex jfycenter pointer toggle-view-hover-effect"
                style={{
                  width: "50%",
                  height: "53px",
                  borderTopLeftRadius: "16px",
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
                  borderTopRightRadius: "16px",
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
                            onMouseEnter={() =>
                              setHovered_index(eachCoworker?.id)
                            }
                            onMouseLeave={() => setHovered_index(null)}
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
                              onClick={() =>
                                openRemoveCoworkerModal(eachCoworker?.user)
                              }
                              className="dflex algncenter w-100"
                              style={{
                                justifyContent: "flex-end",
                                gap: "12px",
                                display:
                                  hovered_index === eachCoworker?.id
                                    ? ""
                                    : "none",
                              }}
                            >
                              <div
                                onMouseEnter={() =>
                                  setHovered_div(eachCoworker?.id)
                                }
                                onMouseLeave={() => setHovered_div(null)}
                                className="dflex algncenter jfycenter border-r-50 pointer"
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  backgroundColor:
                                    hovered_div === eachCoworker?.id &&
                                    "#e4eef7",
                                  transitionDuration: "0.2s",
                                }}
                              >
                                <svg
                                  fill={
                                    hovered_div === eachCoworker?.id
                                      ? "rgb(29,155,240)"
                                      : "rgb(83,100,113)"
                                  }
                                  width={`1.25em`}
                                  height={`1.25em`}
                                  viewBox="0 0 24 24"
                                  aria-hidden="true"
                                >
                                  <g>
                                    <path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path>
                                  </g>
                                </svg>
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
                {user?.receivedCoworkerRequests?.length > 0 &&
                pendingCoworkerRequests?.length ? (
                  <>
                    <div>
                      {user.receivedCoworkerRequests.map(
                        (eachCRequest, itemIndex) => {
                          return (
                            <>
                              {eachCRequest?.status === "pending" ? (
                                <>
                                  <div
                                    className="p-16 border-r-4 dflex algncenter each-message-parent-div"
                                    style={{
                                      justifyContent: "flex-start",
                                      gap: "12px",
                                      marginLeft: "16px",
                                      marginRight: "16px",
                                    }}
                                    key={eachCRequest?.id}
                                  >
                                    <div>
                                      {eachCRequest?.requester
                                        ?.profilePicture !==
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
                                              eachCRequest?.requester
                                                ?.profilePicture
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
                                          border:
                                            "1px solid rgb(253, 201, 206)",
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
                                          border:
                                            "1px solid rgb(207, 217, 222)",
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
                                  </div>{" "}
                                </>
                              ) : null}
                            </>
                          );
                        }
                      )}
                    </div>
                  </>
                ) : !pendingCoworkerRequests?.length ? (
                  <>
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
                          You currently have no coworker requests.If you receive
                          a coworker request, it will be shown here.
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
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
                          You currently have no coworker requests.If you receive
                          a coworker request, it will be shown here.
                        </div>
                      </div>
                    </div>
                  </>
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
              borderRadius: "16px",
            }}
          >
            <div className="dflex">
              <div
                className="dflex jfycenter pointer toggle-view-hover-effect"
                style={{
                  width: "50%",
                  height: "53px",
                  borderTopLeftRadius: "16px",
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
                  borderTopRightRadius: "16px",
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
                            onMouseEnter={() =>
                              setHovered_index(eachFriend?.id)
                            }
                            onMouseLeave={() => setHovered_index(null)}
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
                              onClick={() =>
                                openRemoveFriendModal(eachFriend?.user)
                              }
                              className="dflex algncenter w-100"
                              style={{
                                justifyContent: "flex-end",
                                gap: "12px",
                                display:
                                  hovered_index === eachFriend?.id
                                    ? ""
                                    : "none",
                              }}
                            >
                              <div
                                onMouseEnter={() =>
                                  setHovered_div(eachFriend?.id)
                                }
                                onMouseLeave={() => setHovered_div(null)}
                                className="dflex algncenter jfycenter border-r-50 pointer"
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  backgroundColor:
                                    hovered_div === eachFriend?.id && "#e4eef7",
                                  transitionDuration: "0.2s",
                                }}
                              >
                                <svg
                                  fill={
                                    hovered_div === eachFriend?.id
                                      ? "rgb(29,155,240)"
                                      : "rgb(83,100,113)"
                                  }
                                  width={`1.25em`}
                                  height={`1.25em`}
                                  viewBox="0 0 24 24"
                                  aria-hidden="true"
                                >
                                  <g>
                                    <path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path>
                                  </g>
                                </svg>
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
                {user?.receivedFriendRequests?.length > 0 &&
                pendingFriendRequests?.length ? (
                  <>
                    <div>
                      {user.receivedFriendRequests.map(
                        (eachCRequest, itemIndex) => {
                          return (
                            <>
                              {eachCRequest?.status === "pending" ? (
                                <div
                                  className="p-16 border-r-4 dflex algncenter each-message-parent-div"
                                  style={{
                                    justifyContent: "flex-start",
                                    gap: "12px",
                                    marginLeft: "16px",
                                    marginRight: "16px",
                                  }}
                                  key={eachCRequest?.id}
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
                                            eachCRequest?.requester
                                              ?.profilePicture
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
                              ) : null}
                            </>
                          );
                        }
                      )}
                    </div>
                  </>
                ) : !pendingFriendRequests?.length ? (
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
                        refreshUser();
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
                    onClick={() => {
                      refreshUser();
                      handleOpenCReqModal();
                    }}
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
                    onClick={() => {
                      refreshUser();
                      handleOpenFReqModal();
                    }}
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
