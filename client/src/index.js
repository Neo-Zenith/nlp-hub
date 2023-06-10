import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store/store.js";
import "./styles/styles.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <App />
            <ToastContainer
                limit={3}
                autoClose={3500}
                position="top-left"
                hideProgressBar="true"
                toastStyle={{
                    fontFamily: "Poppins",
                    fontWeight: "500",
                    fontSize: "1.8rem",
                    borderLeft: "0.5rem solid var(--color-primary-red)",
                    borderRadius: "0.5rem",
                }}
                toastClassName="custom-toast-container"
                bodyClassName="custom-toast-body"
            />
        </PersistGate>
    </Provider>
);
