export const SEND_MESSAGE = 'SEND_MESSAGE';
export const AUTHORIZE = 'AUTHORIZE';
export const LOGIN = 'LOGIN';
export const IS_LOGGED_IN = 'LOGIN';
export const ASYNC_AUTHORIZE = 'ASYNC_AUTHORIZE';
export const START_CHANNEL = 'START_CHANNEL';
export const CREATE_MESSAGE = 'CREATE_MESSAGE';

const action = (type, payload = {}) => ( { type, ...payload } );

export const sendMessage = message => action( SEND_MESSAGE, { message } );
export const authorize = isAuthorized => action( AUTHORIZE, { isAuthorized } );
export const login = ( username, password ) =>
	( { type: AUTHORIZE, username, password } );
export const asyncAuthorize =
	( { user = '', password = ''} = {} ) =>
		action( ASYNC_AUTHORIZE, { user, password } );
export const startChannel = () => action( START_CHANNEL );
export const createMessage = message => action( CREATE_MESSAGE, { message } );