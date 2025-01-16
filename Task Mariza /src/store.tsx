// store.tsx

import { legacy_createStore as createStore } from 'redux';
import { combineReducers } from 'redux';
import authReducer from './reducers/authReducer';
import userReducer from './reducers/userReducer';

const rootReducer = combineReducers({
    auth: authReducer,
    user: userReducer,  // Add userReducer here
});

const store = createStore(rootReducer);

export default store;
