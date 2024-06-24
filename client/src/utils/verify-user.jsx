import axios from "axios";

export const verifyCookie = async (
  cookies,
  path,
  navigate,
  removeCookie,
  setUsername,
  API_URL
) => {
  if (!cookies.token) {
    navigate("/");
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
    }
  } catch (error) {
    console.error("Error verifying cookie:", error);
    removeCookie("token");
    navigate("/");
  }
};

export const logout = (removeCookie, navigate) => {
  removeCookie("token");
  navigate("/");
};
