import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store/store.js";
import "./styles/styles.css";
import { ToastContainer } from "react-toastify";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <App />
            <ToastContainer
                limit={3}
                autoClose={3500}
                position="top-right"
                hideProgressBar="true"
                toastStyle={{
                    fontFamily: "Quicksand",
                    fontWeight: "400",
                    fontSize: "0.7rem",
                    border: "0.05rem solid var(--color-primary-red)",
                    borderRadius: "0.5rem",
                }}
            />
        </PersistGate>
    </Provider>
);
