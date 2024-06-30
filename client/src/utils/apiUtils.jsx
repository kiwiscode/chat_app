import CryptoJS from "crypto-js";

export function createAuthHeader() {
  const encryptedToken = localStorage.getItem("encryptedToken");
  if (encryptedToken) {
    const secretKey = import.meta.env.VITE_SECRET_KEY;
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedToken, secretKey);
    const decryptedToken = decryptedBytes.toString(CryptoJS.enc.Utf8);

    return `Authorization: Bearer ${decryptedToken}`;
  } else {
    return "";
  }
}
