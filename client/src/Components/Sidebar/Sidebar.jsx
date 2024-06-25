import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import "../../index.css";
import "./Sidebar.css";
import axios from "axios";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
const API_URL = "http://localhost:3000";

function Sidebar() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticatedUser, handleLogout, updateUser } = useUser();
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
        `${API_URL}/change_profile_image`,
        {
          id: user.id,
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
      console.log("result:", result);
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
  return (
    <>
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
                        navigate("/dashboard");
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
