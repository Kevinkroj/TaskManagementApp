import { RESTORE_TOKEN, SIGN_IN, SIGN_OUT } from '../actions/authActions';

const initialState = {
    isLoading: true,
    isSignout: false,
    userToken: null,
};

const authReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case RESTORE_TOKEN:
            return {
                ...state,
                userToken: action.payload,
                isLoading: false,
            };
        case SIGN_IN:
            return {
                ...state,
                isSignout: false,
                userToken: action.payload,
            };
        case SIGN_OUT:
            return {
                ...state,
                isSignout: true,
                userToken: null,
            };
        default:
            return state;
    }
};

export default authReducer;
