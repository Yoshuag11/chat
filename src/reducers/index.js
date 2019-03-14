import { combineReducers } from 'redux';
import {
	AUTHORIZE, SEND_MESSAGE, ADD_CONTACT, SET_USER, GET_REQUESTS, NEW_REQUEST
} from '../actions'
import Cookies from 'js-cookie';

const initialMessages = [
	{ message: 'Hello' },
	{ message: 'World' },
	{ message: 'Testing' },
	{ message: 'Messages' }
];

const isAuthorized = ( state = !!Cookies.get( 'isAuthorized'), action ) => {
	switch ( action.type ) {
		case AUTHORIZE:
			return action.isAuthorized;
		default:
			return state;
	}
};
const messages = ( state = initialMessages, action ) => {
	switch ( action.type ) {
		case SEND_MESSAGE:
			console.log( 'action', action );
			return [
				...state,
				{
					message: action.message
				}
			];
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
const requests = ( state = [], action ) => {
	switch ( action.type ) {
		case GET_REQUESTS:
			return action.requests;
		case NEW_REQUEST:
			return [ ...state, action.request ];
		default:
			return state;
	}
}
const newRequest = ( state = false, action ) => {
	switch ( action.type ) {
		case NEW_REQUEST:
			return true;
		default:
			return state;
	}
}

export default combineReducers( {
	isAuthorized,
	messages,
	contacts,
	user,
	newRequest,
	requests
} );