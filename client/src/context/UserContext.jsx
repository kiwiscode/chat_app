import axios from "axios";
import { createContext, useState, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";

const UserContext = createContext();
const API_URL = "http://localhost:3000";
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [isAuthenticatedUser, setIsAuthenticatedUser] = useState(false);
  const path = useLocation();

  const updateUser = (newUserInfo) => {
    setUser((prevUserInfo) => ({
      ...prevUserInfo,
      ...newUserInfo,
    }));
  };

  const logout = async (req, res) => {
    try {
      const result = await axios.post(
        `${API_URL}/auth/logout`,
        {},
        {
          withCredentials: "include",
        }
      );
      const { status } = result;

      if (status === 200) {
        setUser(null);
        setAuthToken(null);
        setIsAuthenticatedUser(null);
      }
    } catch (error) {
      console.error("error:", error);
    }
  };

  const getUser = async (req, res) => {
    try {
      const result = await axios.get(`${API_URL}/verify_user`, {
        withCredentials: true,
      });
      console.log("result:", result);

      setUser(result.data.user);
      setAuthToken(result.data.token);
      setIsAuthenticatedUser(true);
    } catch (error) {
      console.error("error:", error);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

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
        logout,
      }}
    >
      {children}{" "}
    </UserContext.Provider>
  );
};
export const useUser = () => useContext(UserContext);
