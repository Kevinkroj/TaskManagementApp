const initialState = {
  users: [],
};

const userReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case "SET_USERS":
      return {
        ...state,
        users: action.payload,
      };
    default:
      return state;
  }
};

export default userReducer;