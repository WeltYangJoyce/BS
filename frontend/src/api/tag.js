import api from "./api";

// 获取所有 tags
export const fetchTags = () => {
  return api.get("/tags");
};
