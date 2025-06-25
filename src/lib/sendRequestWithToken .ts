import getIdTokenAuth from "./getIdTokenAuth";

export const sendRequestWithToken = async () => {
  const token = await getIdTokenAuth();

  if (!token) {
    console.error("No token available");
    return;
  }

  const response = await fetch("/api/protected", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return data;
};
