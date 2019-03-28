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
export const CREATE_GROUP_CONVERSATION = 'CREATE_GROUP_CONVERSATION';
export const ASYNC_LOAD_GROUPS = 'ASYNC_LOAD_GROUPS';
export const LOAD_GROUPS = 'LOAD_GROUPS';
export const JOIN_GROUPS = 'JOIN_GROUPS';
export const ADD_PARTICIPANTS = 'ADD_PARTICIPANTS';
export const USER_ADDED_TO_GROUP = 'USER_ADDED_TO_GROUP';
export const CLOSE_SOCKET = 'CLOSE_SOCKET';
export const LOAD_DICTIONARY = 'LOAD_DICTIONARY';
export const ASYNC_LOAD_DICTIONARY = 'ASYNC_LOAD_DICTIONARY';
export const ASYNC_SET_DICTIONARY = 'ASYNC_SET_DICTIONARY';
export const ASYNC_ACCEPT_REQUEST = 'ASYNC_ACCEPT_REQUEST';

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
export const createMessage = data => action( CREATE_MESSAGE, data );
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
export const joinConversation = data => action( JOIN_CONVERSATION, data );
export const socketStatus = status => action( SOCKET_STATUS, { status } );
export const loadMessages = messages => action( LOAD_MESSAGES, { messages } );
export const asyncLoadMessages =
	conversationId => action( ASYNC_LOAD_MESSAGES, { conversationId } );
export const newMessageRead = data => action( NEW_MESSAGE_READ, data );
export const createGroupConversation =
	data => action( CREATE_GROUP_CONVERSATION, data );
export const loadGroups = groups => action( LOAD_GROUPS, { groups } );
export const joinGroups = () => action( JOIN_GROUPS );
export const addParticipants = payload => action( ADD_PARTICIPANTS, payload );
export const userAddedToGroup =
	participantId => action( USER_ADDED_TO_GROUP, { participantId } );
export const closeSocket = () => action( CLOSE_SOCKET );
export const loadDictionary =
	dictionary => action( LOAD_DICTIONARY, { dictionary } );
export const asyncLoadDictionary =  () => action( ASYNC_LOAD_DICTIONARY );
export const asyncSetDictionary =
	language => action( ASYNC_SET_DICTIONARY, { language } );
export const asyncAcceptRequest =
	requestId => action( ASYNC_ACCEPT_REQUEST, { requestId } );