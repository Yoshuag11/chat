export const SEND_MESSAGE = 'SEND_MESSAGE';
export const AUTHORIZE = 'AUTHORIZE';
export const LOGIN = 'LOGIN';
export const IS_LOGGED_IN = 'LOGIN';
export const ASYNC_AUTHORIZE = 'ASYNC_AUTHORIZE';
export const START_CHANNEL = 'START_CHANNEL';
export const CREATE_MESSAGE = 'CREATE_MESSAGE';
export const ADD_CONTACT = 'ADD_CONTACT';
export const ASYNC_REGISTER = 'ASYNC_REGISTER';
export const SET_USER = 'SET_USER';
export const ASYNC_FETCH_USER = 'ASYNC_FETCH_USER';
export const ASYNC_REQUEST = 'ASYNC_REQUEST';
// export const ASYNC_FETCH_REQUESTS = 'ASYNC_FETCH_REQUESTS';
// export const GET_REQUESTS = 'GET_REQUESTS';
export const NEW_REQUEST = 'NEW_REQUESTS';
export const JOIN_CONVERSATION = 'JOIN_CONVERSATION';
export const SOCKET_STATUS = 'SOCKET_STATUS';
export const LOAD_MESSAGES = 'LOAD_MESSAGES';
export const ASYNC_LOAD_MESSAGES = 'ASYNC_LOAD_MESSAGES';
// export const NEW_MESSAGE = 'NEW_MESSAGE';
export const NEW_MESSAGE_READ = 'NEW_MESSAGE_READ';

const action = (type, payload = {}) => ( { type, ...payload } );

export const sendMessage = message => action( SEND_MESSAGE, { message } );
// export const newMessage = message => action( NEW_MESSAGE, { message } );
export const authorize = isAuthorized => action( AUTHORIZE, { isAuthorized } );
export const login = ( username, password ) =>
	( { type: AUTHORIZE, username, password } );
export const asyncAuthorize =
	( { email, password } = {} ) =>
		action( ASYNC_AUTHORIZE, { email, password } );
export const startChannel = () => action( START_CHANNEL );
export const createMessage =
	( conversationId, message ) => action(
		CREATE_MESSAGE, { conversationId, message } );
export const addContact = contact => action( ADD_CONTACT, { contact } );
export const asyncRegister =
	( { username, password, email } = {} ) =>
		action( ASYNC_REGISTER, { username, password, email } );
export const setUser = user => action( SET_USER, { user } );
export const asyncFetchUser = () => action( ASYNC_FETCH_USER );
export const asyncRequest = to => action( ASYNC_REQUEST, { to } );
// export const asyncFetchRequests = () => action( ASYNC_FETCH_REQUESTS );
// export const getRequests = requests => action( GET_REQUESTS, { requests } );
export const newRequest = request => action( NEW_REQUEST, { request } );
export const joinConversation =
	conversationId => action( JOIN_CONVERSATION, { conversationId } );
export const socketStatus = status => action( SOCKET_STATUS, { status } );
export const loadMessages = messages => action( LOAD_MESSAGES, { messages } );
export const asyncLoadMessages =
	conversationId => action( ASYNC_LOAD_MESSAGES, { conversationId } );
export const newMessageRead =
	conversationId => action( NEW_MESSAGE_READ, { conversationId } );