import { Navigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";

function IsAuthenticatedUser({ children }) {
  const { isAuthenticatedUser } = useUser();

  if (!isAuthenticatedUser) {
    return <Navigate to="/" />;
  } else {
    return children;
  }
}

export default IsAuthenticatedUser;
