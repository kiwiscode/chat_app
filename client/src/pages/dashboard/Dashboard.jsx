import { useEffect } from "react";
import { useUser } from "../../context/UserContext";

function Dashboard() {
  const { user, setUser, authToken, setAuthToken, updateUser } = useUser();
  useEffect(() => {
    console.log("dashboard : auth token :", authToken);
    console.log("dashboard : user :", user);
  }, []);
  return <>Your dashboard {user?.username}</>;
}

export default Dashboard;
