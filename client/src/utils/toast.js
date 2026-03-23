import { toast } from "react-toastify";

export const getErrorMessage = (error, fallback) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return fallback || "Request failed";
};

export const showError = (error, fallback) => {
  toast.error(getErrorMessage(error, fallback));
};

export const showSuccess = (message, fallback) => {
  const resolved = message || fallback || "Success";
  toast.success(resolved);
};
