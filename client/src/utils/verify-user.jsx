import axios from "axios";

export const verifyCookie = async (
  cookies,
  navigate,
  removeCookie,
  setUsername,
  API_URL
) => {
  if (!cookies.token) {
    navigate("/");
    console.error("here is working verify-user 1");
    return;
  }
  try {
    const { data } = await axios.post(
      `${API_URL}/user-verify`,
      {},
      { withCredentials: true }
    );
    const { status, user } = data;
    setUsername(user);
    if (!status) {
      removeCookie("token");
      navigate("/");
      console.error("here is working verify-user 2");
    }
  } catch (error) {
    console.error("Error verifying cookie:", error);
    removeCookie("token");
    navigate("/");
    console.error("here is working verify-user 3");
  }
};
