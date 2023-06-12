import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

// Initial state
const initialState = {
    accessToken: null,
    username: null,
    role: null,
    error: null,
    loaded: false,
    expiry: null,
};

// Reducer function
const reducer = (state = initialState, action) => {
    switch (action.type) {
        case "SET_ACCESS_TOKEN":
            return { ...state, accessToken: action.payload };
        case "SET_USERNAME":
            return { ...state, username: action.payload };
        case "SET_ROLE":
            return { ...state, role: action.payload };
        case "SET_ERROR":
            return { ...state, error: action.payload };
        case "SET_LOADED":
            return { ...state, loaded: action.payload };
        case "SET_EXPIRY":
            return { ...state, expiry: action.payload };
        default:
            return state;
    }
};

const persistConfig = {
    key: "root",
    storage,
};

const persistedReducer = persistReducer(persistConfig, reducer);

// Create the Redux store
const store = configureStore({ reducer: persistedReducer });
const persistor = persistStore(store);

export { store, persistor };
