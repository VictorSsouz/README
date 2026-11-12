import axios from "axios";

export const adminApi = (token) =>
  axios.create({
    baseURL: `${process.env.REACT_APP_BACKEND_URL}/api`,
    headers: { Authorization: `Bearer ${token}` },
  });

export function formatApiError(err) {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((e) => e?.msg).filter(Boolean).join(" ");
  return "Algo deu errado. Tente novamente.";
}
