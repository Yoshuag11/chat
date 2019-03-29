import { combineReducers } from 'redux';
import {
	AUTHORIZE,
	SEND_MESSAGE,
	// NEW_MESSAGE,
	ADD_CONTACT,
	SET_USER,
	// GET_REQUESTS,
	NEW_REQUEST,
	SOCKET_STATUS,
	LOAD_MESSAGES,
	LOAD_GROUPS,
	LOAD_DICTIONARY,
	USER_LOGOUT,
	SET_LANGUAGE
} from '../actions'
import Cookies from 'js-cookie';

// const initialMessages = [
// 	{ message: 'Hello' },
// 	{ message: 'World' },
// 	{ message: 'Testing' },
// 	{ message: 'Messages' }
// ];
const initDictionary = {
	"authenticate": {
		"email": "Email",
		"password": "Password",
		"login": {
			"title": "Welcome",
			"button": "Log In"
		},
		"register": {
			"title": "Not an user yet?",
			"subtitle": "Register now!",
			"button": "Sign In"
		}
	}
};
const isAuthorized = ( state = !!Cookies.get( 'isAuthorized'), action ) => {
	switch ( action.type ) {
		case AUTHORIZE:
			return action.isAuthorized;
		default:
			return state;
	}
};
const messages = ( state = [], action ) => {
	switch ( action.type ) {
		case SEND_MESSAGE:
			return [
				...state,
				action.message
			];
		case LOAD_MESSAGES:
			return action.messages;
		default:
			return state;
	}
};
const contacts = ( state = [], action ) => {
	switch ( action.type ) {
		case ADD_CONTACT:
			return [
				...state,
				action.contact
			];
		default:
			return state;
	}
};
export const user = ( state = null, action ) => {
	switch ( action.type ) {
		case SET_USER:
			return action.user;
		default:
			return state;
	}
}
// const requests = ( state = [], action ) => {
// 	switch ( action.type ) {
// 		case GET_REQUESTS:
// 			return action.requests;
// 		case NEW_REQUEST:
// 			return [ ...state, action.request ];
// 		default:
// 			return state;
// 	}
// }
const newRequest = ( state = false, action ) => {
	switch ( action.type ) {
		case NEW_REQUEST:
			return action.request;
		default:
			return state;
	}
}
const socket = ( state = false, action ) => {
	switch ( action.type ) {
		case SOCKET_STATUS:
			return action.status;
		default:
			return state;
	}
};
const groups = ( state = [], action ) => {
	switch ( action.type ) {
		case LOAD_GROUPS:
			return action.groups;
		default:
			return state;
	}
};
const dictionary = ( state = initDictionary, action ) => {
	// console.log( '********* dictionary *********');
	// console.log( 'action', action );
	switch ( action.type ) {
		case LOAD_DICTIONARY:
			return action.dictionary;
		default:
			return state;
	}
};
const language = ( state = '', action ) => {
	switch ( action.type ) {
		case SET_LANGUAGE:
			return action.language;
		default:
			return state;
	}
};
// const newMessage = ( state = null, action ) => {
// 	switch ( action.type ) {
// 		case NEW_MESSAGE:
// 			return action.message
// 		default:
// 			return state;
// 	}
// }

const appReducer = combineReducers( {
// export default combineReducers( {
	isAuthorized,
	language,
	messages,
	contacts,
	user,
	newRequest,
	// newMessage,
	socket,
	groups,
	dictionary
	// requests
} );

export default ( state, action ) => {
	if ( action.type === USER_LOGOUT ) {
		state = undefined;
	}
	return appReducer( state, action );
}