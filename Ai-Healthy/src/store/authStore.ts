import { create } from "zustand";

const useAuthStore = create((set) => ({
  token: localStorage.getItem("token") || "",
  isLogin: false,
  userNickName: localStorage.getItem("nickName") || "",
  userId: localStorage.getItem("userId") || "",
  avatarUrl: localStorage.getItem("avatarUrl") || "",

  login: (token: string, nickName: string, userId: string, avatarUrl = "") => {
    localStorage.setItem("token", token);
    localStorage.setItem("nickName", nickName);
    localStorage.setItem("userId", userId);
    localStorage.setItem("avatarUrl", avatarUrl);
    set({ token, isLogin: true, userNickName: nickName, userId, avatarUrl });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("nickName");
    localStorage.removeItem("userId");
    localStorage.removeItem("avatarUrl");
    set({ token: "", isLogin: false, userNickName: "", userId: "", avatarUrl: "" });
  },

  updateUserInfo: (nickName: string) => {
    set({ userNickName: nickName });
    localStorage.setItem("nickName", nickName);
  },

  updateAvatar: (avatarUrl: string) => {
    set({ avatarUrl });
    localStorage.setItem("avatarUrl", avatarUrl);
  },
}));

export default useAuthStore;
