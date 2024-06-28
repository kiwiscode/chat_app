import axios from "axios";
import { createContext, useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { verifyCookie } from "../utils/verify-user";

const API_URL = "https://chat-app-mpi2.onrender.com";

const UserContext = createContext();

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
  const refreshUser = async () => {
    try {
      const result = await axios.get(
        `${API_URL}/users/${user?.id}`,
        {},
        {
          withCredentials: true,
        }
      );

      console.log("result:", result);

      setUser(result.data);
    } catch (error) {
      console.error("error:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (user?.id) {
      console.log("userid:", user.id);
      refreshUser();
    }
  }, [user?.id]);

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
        refreshUser,
      }}
    >
      {children}{" "}
    </UserContext.Provider>
  );
};
export const useUser = () => useContext(UserContext);
