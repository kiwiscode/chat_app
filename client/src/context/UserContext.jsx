import axios from "axios";
import { createContext, useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { verifyCookie, logout } from "../utils/verify-user";
const UserContext = createContext();
const API_URL = "http://localhost:3000";
export const UserProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null);
  const [isAuthenticatedUser, setIsAuthenticatedUser] = useState(false);
  const [user, setUser] = useState(null);
  const [cookies, removeCookie] = useCookies([]);
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const handleLogout = async (req, res) => {
    try {
      const result = await axios.post(
        `${API_URL}/auth/logout`,
        { id: user.id },
        {
          withCredentials: true,
        }
      );

      console.log("result logout:", result);

      if (result?.status === 200) {
        setUser(null);
        setAuthToken(null);
        setIsAuthenticatedUser(false);
        navigate("/");
      }
    } catch (error) {
      console.error("error:", error);
    }
  };

  useEffect(() => {
    if (cookies.token && cookies !== "undefined") {
      setAuthToken(cookies.token);
      setIsAuthenticatedUser(true);
      verifyCookie(cookies, path, navigate, removeCookie, setUser, API_URL);
    }

    if (path === "/" && cookies.token !== "undefined" && cookies.token) {
      navigate("/dashboard");
    }
    if (
      (path === "/" || path !== "/") &&
      (cookies.token === "undefined" || !cookies.token)
    ) {
      setAuthToken(null);
      setIsAuthenticatedUser(false);
      navigate("/");
    }
  }, [cookies]);

  const updateUser = (newUserInfo) => {
    setUser((prevUserInfo) => ({
      ...prevUserInfo,
      ...newUserInfo,
    }));
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        authToken,
        setAuthToken,
        isAuthenticatedUser,
        setIsAuthenticatedUser,
        updateUser,
        handleLogout,
      }}
    >
      {children}{" "}
    </UserContext.Provider>
  );
};
export const useUser = () => useContext(UserContext);
