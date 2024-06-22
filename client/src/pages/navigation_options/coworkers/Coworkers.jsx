import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../context/UserContext";

const API_URL = "http://localhost:3000";

function Coworkers() {
  const navigate = useNavigate();
  const { user, setUser, authToken, setAuthToken, updateUser } = useUser();
  const getCoworkers = async () => {
    try {
      const result = await axios.get(`${API_URL}/coworkers`, {
        withCredentials: true,
      });
      console.log("result:", result);
    } catch (error) {
      console.error("error:", error);
    }
  };

  useEffect(() => {
    getCoworkers();
  }, [user, authToken]);
  useEffect(() => {
    console.log("coworkers : auth token :", authToken);
    console.log("coworkers : user :", user);
  }, []);
  return (
    <>
      <div>Welcome {user?.username}</div>
      <div>
        Your authentication token: {authToken ? authToken : "unauthorized user"}
      </div>
    </>
  );
}

export default Coworkers;
