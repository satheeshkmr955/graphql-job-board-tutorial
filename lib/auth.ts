// Disclaimer: This example keeps the access token in LocalStorage just because
// it's simpler, but in a real application you may want to use cookies instead
// for better security. Also, it doesn't handle token expiration.
import jwtDecode from "jwt-decode";

const API_URL = "http://localhost:3000";

const ACCESS_TOKEN_KEY = "accessToken";

export const getAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

type LoginArgs = {
  email: string;
  password: string;
};

export const login = async (obj: LoginArgs) => {
  const { email, password } = obj;

  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    return null;
  }

  const { token } = await response.json();

  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  return getUserFromToken(token);
};

export const getUser = () => {
  const token = getAccessToken();
  if (!token) {
    return null;
  }
  return getUserFromToken(token);
};

export const logout = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

const getUserFromToken = (token: string) => {
  const claims = jwtDecode(token);
  return {
    id: claims.sub,
    email: claims.email,
  };
};
