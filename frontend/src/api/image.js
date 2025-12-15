import axios from "axios";

const API_BASE = "http://127.0.0.1:5000/api";

export function uploadImage(file, userId) {
  const formData = new FormData();
  formData.append("file", file);

  return axios.post(`${API_BASE}/images`, formData, {
    headers: {
      "X-User-Id": userId,
    },
  });
}

export function fetchImages() {
  return axios.get(`${API_BASE}/images`);
}

export function deleteImage(imageId, userId) {
  return axios.delete(`${API_BASE}/images/${imageId}`, {
    headers: {
      "X-User-Id": userId,
    },
  });
}

