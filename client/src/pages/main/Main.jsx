import { useEffect, useRef, useState } from "react";
import LoadingSpinner from "../../Components/LoadingSpinner/LoadingSpinner";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "https://chat-app-mpi2.onrender.com";

function Main() {
  const [authModal, setAuthModal] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleParentClick = () => {
    if (!authModal && !showVerificationCodeScreen && !loginPage) {
      setAuthModal(true);
    } else if (authModal) {
      setAuthModal(false);
      setShowVerificationCodeScreen(false);
      setLoginPage(false);
    } else if (showVerificationCodeScreen && !authModal && !loginPage) {
      setShowVerificationCodeScreen(true);
      setAuthModal(false);
      setLoginPage(false);
    } else if (loginPage && !authModal && !showVerificationCodeScreen) {
      setLoginPage(true);
      setAuthModal(false);
      setShowVerificationCodeScreen(false);
    }
  };
  const handleChildClick = (event) => {
    event.stopPropagation();
  };

  const [loginPage, setLoginPage] = useState(null);
  const [loading, setLoading] = useState(null);

  const [usernameError, setUsernameError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [emptyFieldsError, setEmptyFieldsError] = useState(null);
  const [emailVerificationCodeStatus, setemailVerificationCodeStatus] =
    useState("");
  const [emailVerificationCode, setemailVerificationCode] = useState("");
  const [showVerificationCodeScreen, setShowVerificationCodeScreen] =
    useState(null);

  const [verificationCode, setVerificationCode] = useState(null);
  const [className, setClassName] = useState("animated_border_active paused");
  const [verificationCodeSending, setVerificationCodeSending] = useState("");
  const [invalidCodeError, setInvalidCodeError] = useState(null);
  const [showInfoMessage, setShowInfoMessage] = useState(null);
  const [showInfoMessageClose, setShowInfoMessageClose] = useState(null);

  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;

  const userNameCheck = async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/check-username`, {
        username: formData.username,
      });
      console.log("result auth/check-username:", response);
      setUsernameError("");
    } catch (error) {
      console.error("Error:", error);
      if (error.response.status === 409) {
        setUsernameError(
          "Username already exists. Please choose a different username."
        );
      }
    }
  };

  const emailRegex =
    /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com|co\.uk|ukmail\.com|hotmail\.tr|icloud\.com|yahoo\.com)$/;

  const validateEmail = (email) => {
    return emailRegex.test(email);
  };

  const emailCheck = async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/check-email`, {
        email: formData.email,
      });
      console.log("result auth/check-email:", response);

      setEmailError("");
    } catch (error) {
      console.error("Error:", error);
      if (error.response.status === 409) {
        setEmailError("Email already exists. Please use a different email.");
      }
    }
  };

  useEffect(() => {
    if (formData.username) {
      userNameCheck();
    }
  }, [formData.username]);
  useEffect(() => {
    if (formData.email) {
      emailCheck();
    }
  }, [formData.email]);

  useEffect(() => {
    setInvalidCodeError(null);
  }, [verificationCode]);
  const sendEmailVerificationCode = async (recipientEmail) => {
    const validation = validateEmail(formData.email);
    if (!validation) {
      setEmailError("Please enter a valid email.");
    } else {
      setLoading(true);
      try {
        const result = await axios.post(
          `${API_URL}/auth/send-email-verification-code`,
          {
            receiverEmail: recipientEmail,
          }
        );
        if (result.status === 201) {
          setemailVerificationCodeStatus(201);
          setemailVerificationCode(result.data.code);

          setTimeout(() => {
            setShowVerificationCodeScreen(true);
            setAuthModal(false);
          }, 300);

          setTimeout(() => {
            setLoading(false);
          }, 400);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const [clicked, setClicked] = useState(null);
  const [pointerEvent, setPointerEvent] = useState("");

  const sendEmailVerificationCodeAgain = async (recipientEmail) => {
    setClicked(true);
    setPointerEvent("none");
    setVerificationCodeSending(true);
    setClassName("animated_border_active");
    setTimeout(() => {
      setPointerEvent("");
    }, 6500);
    try {
      const result = await axios.post(
        `${API_URL}/auth/send-email-verification-code`,
        {
          receiverEmail: recipientEmail,
        }
      );
      if (result.status === 201) {
        setemailVerificationCodeStatus(201);
        setemailVerificationCode(result.data.code);

        setTimeout(() => {
          setAuthModal(false);
          setClassName("animated_border_active paused");
        }, 300);

        setTimeout(() => {
          setShowInfoMessage(true);
        }, 450);

        setTimeout(() => {
          setVerificationCodeSending(false);
        }, 500);

        setTimeout(() => {
          setShowInfoMessageClose(true);
        }, 5000);
        setTimeout(() => {
          setShowInfoMessage(false);
          setShowInfoMessageClose(false);
        }, 6000);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    setVerificationCode("");
    setemailVerificationCodeStatus(null);
    try {
      const result = await axios.post(
        `${API_URL}/auth/signup`,
        {
          formData,
        },
        {
          withCredentials: true,
        }
      );

      console.log("result auth/signup:", result);

      if (result) {
        setUsernameError("");
        setEmailError("");
        setPasswordError("");
        setEmptyFieldsError("");
      }

      setFormData({
        username: "",
        email: "",
        password: "",
      });

      setTimeout(() => {
        setShowVerificationCodeScreen(false);
      }, 350);

      setTimeout(() => {
        setLoginPage(true);
      }, 400);

      setTimeout(() => {
        setLoading(false);
      }, 400);
    } catch (error) {
      console.error("Error:", error.response);
    }
  };

  const [loginFormData, setLoginFormData] = useState({
    authentication: "",
    password: "",
  });
  const handleChangeLoginFormData = (e) => {
    const { name, value } = e.target;
    setLoginFormData({
      ...loginFormData,
      [name]: value,
    });
  };

  const [LOG_INusernameOrEmailErr, setLOG_INusernameOrEmailErr] = useState("");
  const [LOG_INpasswordError, setLOG_INpasswordError] = useState("");
  const handleLogin = async () => {
    try {
      const result = await axios.post(
        `${API_URL}/auth/login`,
        {
          loginFormData,
        },
        {
          withCredentials: true,
        }
      );
      if (result?.status === 200) {
        navigate("/dashboard");
        window.location.reload();
      }
    } catch (error) {
      const { message } = error.response.data;
      if (error.response.data.passwordError && message) {
        setLOG_INpasswordError(message);
        setLOG_INusernameOrEmailErr("");
      } else if (error.response.data.authenticationError && message) {
        setLOG_INusernameOrEmailErr(message);
        setLOG_INpasswordError("");
      }
      console.error("Error:", error);
    }
  };

  const divRef = useRef();
  const handleClickOutside = (event) => {
    if (divRef.current && !divRef.current.contains(event.target)) {
      setAuthModal(false);
      setShowVerificationCodeScreen(false);
      setLoginPage(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
      }}
    >
      {showInfoMessage && (
        <div
          className={
            showInfoMessageClose
              ? `top_info_message_animation_close dflex algncenter jfycenter w-100 z-9999 p-fix txt-alg-center`
              : `top_info_message_animation_open dflex algncenter jfycenter w-100 z-9999 p-fix txt-alg-center`
          }
          style={{
            top: "45px",
          }}
        >
          <div
            className="chirp-medium-font dflex jfycenter algncenter fs-15 lh-20 border-r-4 bg-color-white p-12"
            style={{
              boxShadow:
                "rgba(101, 119, 134, 0.2) 0px 0px 8px 0px, rgba(101, 119, 134, 0.25) 0px 1px 3px 1px",
              gap: ".5em",
            }}
          >
            <div className="dlfex">
              <svg
                viewBox="64 64 896 896"
                focusable="false"
                data-icon="info-circle"
                width="1em"
                height="1em"
                fill="#36bbf7"
                aria-hidden="true"
              >
                <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm32 664c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V456c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272zm-32-344a48.01 48.01 0 010-96 48.01 48.01 0 010 96z"></path>
              </svg>
            </div>
            <div>
              <span>
                A new verification code has been sent to your email address.
                Please check your inbox (and spam folder).
              </span>
            </div>
          </div>
        </div>
      )}
      <div
        ref={divRef}
        className={`color-white-text fs-15 lh-20 border-r-4 p-16 chirp-medium-font p-fix z-1 ${
          !authModal && !showVerificationCodeScreen && !loginPage
            ? "sky-blue-btn-hover-effect pointer"
            : ""
        } `}
        onClick={() => {
          if (!authModal) {
            handleParentClick();
          }
        }}
        style={{
          right: "15px",
          bottom: "15px",
          backgroundColor: "#37BCF8",
        }}
      >
        <div
          className={
            authModal || showVerificationCodeScreen || loginPage
              ? "pointer-none"
              : ""
          }
        >
          Start for free
        </div>
        {authModal ? (
          <div
            className="border-r-4 parent_shadow_div auth_modal_open_active"
            onClick={handleChildClick}
            style={{
              cursor: "default",
            }}
          >
            <div style={{}} className="auth_signup_input">
              <label
                className={`color-dark-text chirp-medium-font signup-input fs-13 lh-16`}
              >
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            {usernameError && (
              <div className="fs-13 lh-16 err-color chirp-regular-font">
                {usernameError}
              </div>
            )}
            <div style={{}} className="auth_signup_input">
              {" "}
              <label
                className={`color-dark-text chirp-medium-font signup-input fs-13 lh-16`}
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            {emailError && (
              <div className="fs-13 lh-16 err-color chirp-regular-font">
                {emailError}
              </div>
            )}
            <div style={{}} className="auth_signup_input">
              {" "}
              <label
                className={`color-dark-text chirp-medium-font signup-input fs-13 lh-16`}
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            {passwordError && (
              <div className="fs-13 lh-16 err-color chirp-regular-font">
                {passwordError}
              </div>
            )}
            <button
              className="color-white-text chirp-medium-font fs-15 border-r-4 pointer dark-btn-hover-effect"
              onClick={() => {
                if (
                  !formData.username ||
                  !formData.email ||
                  !formData.password
                ) {
                  setUsernameError("");
                  setEmailError("");
                  setPasswordError("");
                  setEmptyFieldsError(
                    "All fields are mandatory.Please provide username,email, and password"
                  );
                } else if (
                  formData.username.length < 4 ||
                  formData.username.length > 15 ||
                  /\s/.test(formData.username)
                ) {
                  setEmptyFieldsError("");
                  setEmailError("");
                  setPasswordError("");
                  setUsernameError(
                    "Username must be between 4 and 15 characters without spaces."
                  );
                } else if (
                  !regex.test(formData.password) ||
                  formData.password.length < 8
                ) {
                  setEmptyFieldsError("");
                  setUsernameError("");
                  setEmailError("");
                  setPasswordError(
                    "Password needs to have at least 8 chars and must contain at least one number, one lowercase and one uppercase letter."
                  );
                } else {
                  setEmptyFieldsError("");
                  setUsernameError("");
                  setEmailError("");
                  setPasswordError("");
                  sendEmailVerificationCode(formData.email);
                }
              }}
              style={{
                width: "120px",
                height: "40px",
                backgroundColor: "#10172A",
                border: "none",
                marginTop: "36px",
                pointerEvents: loading ? "none" : null,
              }}
            >
              {loading ? (
                <LoadingSpinner
                  fontSize={true}
                  strokeColor={"rgb(231, 233, 234)"}
                ></LoadingSpinner>
              ) : (
                <span>Sign up</span>
              )}
            </button>
            {emptyFieldsError && (
              <div className="fs-13 lh-16 err-color chirp-regular-font">
                {emptyFieldsError}
              </div>
            )}
            <div
              className="color-dark-text fs-15 chirp-medium-font"
              style={{
                marginTop: "36px",
              }}
            >
              Already have an account?
            </div>
            <button
              onClick={() => {
                setAuthModal(false);
                setLoading(false);
                setLoginPage(true);
              }}
              className={`color-white-text chirp-medium-font fs-15 border-r-4 sky-blue-btn-hover-effect b-none ${
                !loading && "pointer"
              }`}
              style={{
                width: "120px",
                height: "40px",
                backgroundColor: "#37BCF8",
                marginTop: "4px",
                pointerEvents: loading && "none",
              }}
            >
              Sign in
            </button>
          </div>
        ) : showVerificationCodeScreen ? (
          <>
            <>
              <div
                className="border-r-4 parent_shadow_div auth_modal_open_active cursor-def"
                onClick={handleChildClick}
              >
                {loading ? (
                  <LoadingSpinner
                    fontSize={true}
                    strokeColor={"#36bbf7"}
                  ></LoadingSpinner>
                ) : (
                  <>
                    <div className="chirp-bold-font color-dark-text">
                      We sent you a code
                    </div>
                    <div className="chirp-regular-font color-dark-text fs-15 lh-20">
                      Enter it below to verify{" "}
                      <span>
                        {formData?.email ? formData.email.toLowerCase() : ""}
                      </span>
                    </div>
                    <div style={{}} className="auth_signup_input">
                      <label
                        className={`color-dark-text chirp-medium-font signup-input fs-13 lh-16`}
                      >
                        Verification code
                      </label>
                      <input
                        className={
                          className && verificationCodeSending
                            ? `${className} animated_border`
                            : "animated_border"
                        }
                        type="text"
                        name="username"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                      />
                    </div>
                    {invalidCodeError && verificationCode?.length && (
                      <div className="fs-13 lh-16 err-color chirp-regular-font">
                        {invalidCodeError}
                      </div>
                    )}
                    <div className="d-inline">
                      <span
                        style={{
                          pointerEvents: pointerEvent,
                        }}
                        onClick={() => {
                          setVerificationCode("");
                          sendEmailVerificationCodeAgain(formData.email);
                        }}
                        className="pointer color-dark-text chirp-regular-font fs-13 lh-16 text_decoration_underline"
                      >
                        {"Didn't receive email?"}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        if (emailVerificationCode === verificationCode) {
                          handleSignup();
                        } else if (verificationCode?.length) {
                          setInvalidCodeError("Invalid verification code.");
                        }
                      }}
                      className={`color-white-text chirp-medium-font fs-15 border-r-4 b-none   
                      ${
                        verificationCode?.length
                          ? "sky-blue-btn-hover-effect pointer"
                          : ""
                      }`}
                      style={{
                        width: "120px",
                        height: "40px",
                        backgroundColor: "#37BCF8",
                        marginTop: "36px",
                        pointerEvents: pointerEvent,
                      }}
                    >
                      Verify
                    </button>
                  </>
                )}
              </div>
            </>
          </>
        ) : loginPage ? (
          <>
            <>
              <div
                className="border-r-4 parent_shadow_div auth_modal_open_active"
                onClick={handleChildClick}
                style={{
                  cursor: "default",
                }}
              >
                <div className="auth_signup_input">
                  <label
                    className={`color-dark-text chirp-medium-font signup-input fs-13 lh-16`}
                  >
                    Username or email
                  </label>
                  <input
                    type="text"
                    name="authentication"
                    value={loginFormData.authentication}
                    onChange={handleChangeLoginFormData}
                  />
                </div>
                {LOG_INusernameOrEmailErr && (
                  <div className="fs-13 lh-16 err-color chirp-regular-font">
                    {LOG_INusernameOrEmailErr}
                  </div>
                )}

                <div className="auth_signup_input">
                  {" "}
                  <label
                    className={`color-dark-text chirp-medium-font signup-input fs-13 lh-16`}
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={loginFormData.password}
                    onChange={handleChangeLoginFormData}
                  />
                </div>
                {LOG_INpasswordError && (
                  <div className="fs-13 lh-16 err-color chirp-regular-font">
                    {LOG_INpasswordError}
                  </div>
                )}
                <button
                  onClick={handleLogin}
                  className="color-white-text chirp-medium-font fs-15 border-r-4 pointer sky-blue-btn-hover-effect b-none"
                  style={{
                    width: "120px",
                    height: "40px",
                    backgroundColor: "#37BCF8",
                    marginTop: "36px",
                  }}
                >
                  Log in
                </button>
                <div
                  className="color-dark-text fs-15 chirp-medium-font"
                  style={{
                    marginTop: "36px",
                  }}
                >
                  Don't you have an account yet?
                </div>
                <button
                  className="color-white-text chirp-medium-font fs-15 border-r-4 pointer dark-btn-hover-effect b-none"
                  onClick={() => {
                    setAuthModal(true);
                    setLoginPage(false);
                    setLoading(false);
                  }}
                  style={{
                    width: "120px",
                    height: "40px",
                    backgroundColor: "#10172A",
                    marginTop: "4px",
                  }}
                >
                  Sign up
                </button>
              </div>
            </>
          </>
        ) : null}
      </div>
      <div
        className={`color-dark-text fs-15 lh-20 border-r-4 pointer-none p-16 chirp-regular-font p-fix z-1`}
        style={{
          left: "15px",
          bottom: "15px",
        }}
      >
        © Aykut Kav 2024
      </div>
      <div
        onClick={() => {
          setAuthModal(false);
        }}
      >
        <div className="w-100">
          <div
            className="chirp-heavy-font color-dark-text"
            style={{
              maxWidth: "50%",
              padding: "60px",
              fontSize: "72px",
              lineHeight: "72px",
            }}
          >
            <span>Platform for efficient communication</span>
            <div
              className="chirp-regular-font color-soft-dark-text"
              style={{
                fontSize: "18px",
                lineHeight: "28px",
                marginTop: "1rem",
              }}
            >
              Connect effortlessly with colleagues and friends on our platform
              designed for seamless communication. Strengthen collaboration with
              secure and effective communication tools, enhancing both
              professional and personal relationships. Get started now and enjoy
              the benefits of streamlined communication!
            </div>
          </div>
        </div>
        <div
          className="dflex w-100"
          style={{
            fontSize: "36px",
            lineHeight: "36px",
            justifyContent: "flex-end",
          }}
        >
          <div
            className="chirp-heavy-font color-dark-text"
            style={{
              maxWidth: "50%",
              padding: "60px",
              fontSize: "72px",
              lineHeight: "72px",
            }}
          >
            Powerful Instant Messaging
            <div
              className="chirp-regular-font color-soft-dark-text"
              style={{
                fontSize: "18px",
                lineHeight: "28px",
                marginTop: "1rem",
              }}
            >
              Stay connected instantly with robust features designed to enhance
              communication efficiency and teamwork.
            </div>
          </div>
        </div>
        <img
          className="p-abs h-100"
          src="https://tailwindui.com/img/beams-home@95.jpg"
          alt=""
          style={{
            marginLeft: "-67.5rem",
            width: "163rem",
            top: "-1rem",
            left: "50%",
            zIndex: -1,
            maxWidth: "100%",
          }}
        />
      </div>
    </div>
  );
}

export default Main;
