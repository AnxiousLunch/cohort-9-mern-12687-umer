import api from "../api/axios";

export const handleUserSignup = async (
  username: string,
  email: string,
  password: string
) => {
  const response = await api.post("/auth/register", {
    username,
    email,
    password,
  });

  return {
    access_token: response.data.access_token,
    user: response.data.user,
    msg: response.data.msg,
  };
};

export const handleUserLogin = async (
  identifier: string,
  password: string
) => {
  const response = await api.post("/auth/login", {
    identifier,
    password,
  });

  return {
    access_token: response.data.access_token,
    user: response.data.user,
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
