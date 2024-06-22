import { useEffect } from "react";
import { useUser } from "../../../context/UserContext";

function Friends() {
  const { user, setUser, authToken, setAuthToken, updateUser } = useUser();
  useEffect(() => {
    console.log("coworkers : auth token :", authToken);
    console.log("coworkers : user :", user);
  }, []);
  return <>Friends</>;
}

export default Friends;
