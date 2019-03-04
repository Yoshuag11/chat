// import { combineReducers } from 'redux';

const initialMessages = [
	{ message: 'Hello' },
	{ message: 'World' },
	{ message: 'Testing' },
	{ message: 'Messages' }
];


export default ( state = initialMessages, action ) => {
	switch ( action.type ) {
		case 'SEND_MESSAGE':
			return [
				...state,
				{
					message: action.message
				}
			];
		default:
			return state;
	}
}