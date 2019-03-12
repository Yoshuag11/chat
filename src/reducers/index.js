import { combineReducers } from 'redux';
import { AUTHORIZE, SEND_MESSAGE, ADD_CONTACT } from '../actions'
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

export default combineReducers( {
	isAuthorized,
	messages,
	contacts
})