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
        console.log("here is working 4");
      }
    } catch (error) {
      console.error("error:", error);
    }
  };

  useEffect(() => {
    console.log("Path:", path);
    console.log("Cookies:", cookies);
    console.log("document.cookie:", document.cookie);
    if (cookies.token && cookies !== "undefined") {
      setAuthToken(cookies.token);
      setIsAuthenticatedUser(true);
      verifyCookie(cookies, path, navigate, removeCookie, setUser, API_URL);
      console.log("here is working 3");
    }
    if (path === "/" && cookies.token !== "undefined" && cookies.token) {
      navigate("/dashboard");
      console.log("here is working 2");
    }
    if (
      (path === "/" || path !== "/") &&
      (cookies.token === "undefined" || !cookies.token)
    ) {
      setAuthToken(null);
      setIsAuthenticatedUser(false);
      setTimeout(() => {
        navigate("/");
      }, 15000);
      console.log("here is working 1");
    }
  }, [cookies, path, navigate, removeCookie, setUser, API_URL]);

  const updateUser = (newUserInfo) => {
    setUser((prevUserInfo) => ({
      ...prevUserInfo,
      ...newUserInfo,
    }));
  };
  const refreshUser = async () => {
    console.log("here is working 4");

    try {
      const result = await axios.get(
        `${API_URL}/users/${user?.id}`,
        {},
        {
          withCredentials: true,
        }
      );

      console.log("result:", result);
      console.log("here is working 5");

      setUser(result.data);
    } catch (error) {
      console.error("error:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (user?.id) {
      console.log("here is working 6");
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
