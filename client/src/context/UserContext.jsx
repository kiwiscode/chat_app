import axios from "axios";
import { createContext, useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createAuthHeader } from "../utils/apiUtils";
const UserContext = createContext();
const API_URL = import.meta.env.VITE_API_URL;

export const UserProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null);
  const [isAuthenticatedUser, setIsAuthenticatedUser] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  useEffect(() => {
    const token = localStorage.getItem("encryptedToken");
    if (token) {
      setAuthToken(token);
      setIsAuthenticatedUser(true);
    }
  }, []);

  const handleLogout = async (req, res) => {
    try {
      const result = await axios.post(
        `${API_URL}/auth/logout`,
        {
          id: user.id,
        },
        {
          headers: createAuthHeader(),
        }
      );

      localStorage.removeItem("userInfo");
      localStorage.removeItem("encryptedToken");

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

  const updateUser = (newUserInfo) => {
    setUser((prevUserInfo) => ({
      ...prevUserInfo,
      ...newUserInfo,
    }));
  };
  const refreshUser = async () => {
    try {
      const result = await axios.get(`${API_URL}/users/${user?.id}`, {
        headers: createAuthHeader(),
      });
      const userR = result.data;
      localStorage.setItem("userInfo", JSON.stringify(userR));
      updateUser(userR);
      setUser(userR);
    } catch (error) {
      console.error("error:", error);
      throw error;
    }
  };

  const getToken = () => {
    const encryptedToken = localStorage.getItem("encryptedToken");
    const decryptedBytes = CryptoJS.AES.decrypt(
      encryptedToken,
      import.meta.env.VITE_SECRET_KEY
    );
    const decryptedToken = decryptedBytes.toString(CryptoJS.enc.Utf8);

    return decryptedToken;
  };
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (user) {
      setUser(user);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
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
        getToken,
      }}
    >
      {children}{" "}
    </UserContext.Provider>
  );
};
export const useUser = () => useContext(UserContext);
