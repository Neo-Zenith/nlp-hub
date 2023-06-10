import { Component } from "react";
import { setError } from "../store/actions";
import { toast } from "react-toastify";

export default class UIService extends Component {
    displayErrorMsg(error) {
        const { dispatch } = this.props;

        const existingToast = toast.isActive(error);

        if (existingToast) {
            toast.update(existingToast, {
                type: toast.TYPE.ERROR,
                autoClose: 3000,
            });
        } else {
            toast.error(error, {
                toastId: error,
                onClose: () => {
                    dispatch(setError(null));
                },
                autoClose: 1500,
            });
        }
    }

    setErrorMsg(error) {
        const { dispatch } = this.props;
        dispatch(setError(error));
    }
}
