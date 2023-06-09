export const setAccessToken = (accessToken) => ({
    type: "SET_ACCESS_TOKEN",
    payload: accessToken,
});

export const setUsername = (username) => ({
    type: "SET_USERNAME",
    payload: username,
});

export const setRole = (role) => ({
    type: "SET_ROLE",
    payload: role,
});

export const setError = (error) => ({
    type: "SET_ERROR",
    payload: error,
});
