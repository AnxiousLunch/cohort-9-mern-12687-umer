import api from "../api/axios";
import type { AuthResponse, AuthUser } from "../types/auth";

function normalizeUser(raw: {
  id?: number;
  user_id?: number;
  username: string;
  email: string;
}): AuthUser {
  const id = raw.id ?? raw.user_id;
  if (id === undefined) {
    throw new Error("Auth response did not include a user id");
  }
  return { id, username: raw.username, email: raw.email };
}

export const handleUserSignup = async (
  username: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await api.post("/auth/register", {
    username,
    email,
    password,
  });

  return {
    access_token: response.data.access_token,
    user: normalizeUser(response.data.user),
    msg: response.data.msg,
  };
};

export const handleUserLogin = async (
  identifier: string,
  password: string
): Promise<AuthResponse> => {
  const response = await api.post("/auth/login", {
    identifier,
    password,
  });

  return {
    access_token: response.data.access_token,
    user: normalizeUser(response.data.user),
    msg: response.data.msg,
  };
};

export const handleUserLogout = async (): Promise<void> => {
  try {
    await api.post("/auth/logout");
  } finally {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("authUser");
  }
};
