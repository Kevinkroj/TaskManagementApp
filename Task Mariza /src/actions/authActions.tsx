export const RESTORE_TOKEN = 'RESTORE_TOKEN';
export const SIGN_IN = 'SIGN_IN';
export const SIGN_OUT = 'SIGN_OUT';

export const restoreToken = (token: string) => ({
    type: RESTORE_TOKEN,
    payload: token,
});

export const signIn = (token: string) => ({
    type: SIGN_IN,
    payload: token,
});

export const signOut = () => ({
    type: SIGN_OUT,
    payload: null,
});
