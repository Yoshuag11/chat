import { combineReducers } from 'redux';
import { AUTHORIZE, SEND_MESSAGE } from '../actions'

const initialMessages = [
	{ message: 'Hello' },
	{ message: 'World' },
	{ message: 'Testing' },
	{ message: 'Messages' }
];

const isAuthorized = ( state = false, action ) => {
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

export default combineReducers( {
	isAuthorized,
	messages
})