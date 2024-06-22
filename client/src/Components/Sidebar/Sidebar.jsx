import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import "../../index.css";
import "./Sidebar.css";

function Sidebar() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticatedUser, logout } = useUser();
  const handleParentClick = () => {
    setShow(false);
  };
  const handleChildClick = (event) => {
    event.stopPropagation();
  };

  const [effect, setEffect] = useState(null);

  return (
    <>
      <div
        style={{
          position: "sticky",
          right: "0px",
          top: "0px",
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
          height: "53px",
          alignItems: "center",
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
        </div>
      </div>
      {show && (
        <div
          onClick={() => {
            handleParentClick();
          }}
          style={{
            position: "fixed",
            display: "flex",
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
            className="mobile-top-navigation-column"
            style={{
              position: "absolute",
              right: "0px",
              maxWidth: "70%",
              minWidth: "280px",
              height: "100vh",
              minHeight: "0px",
              display: "flex",
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
                  style={{
                    padding: "32px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
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
                      onClick={() => {
                        navigate("/coworkers");
                      }}
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
                      onClick={() => {
                        navigate("/friends");
                      }}
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
                        logout();
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
                  style={{
                    padding: "32px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
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
