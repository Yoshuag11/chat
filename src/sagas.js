import {
	put, takeEvery, all, call, apply, take, fork, race, select
} from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import {
	authorize,
	setUser,
	// getRequests,
	socketStatus,
	newRequest,
	sendMessage,
	loadMessages,
	ASYNC_AUTHORIZE,
	START_CHANNEL,
	CREATE_MESSAGE,
	ASYNC_REGISTER,
	ASYNC_FETCH_USER,
	ASYNC_REQUEST,
	JOIN_CONVERSATION,
	ASYNC_LOAD_MESSAGES
	// ASYNC_FETCH_REQUESTS
} from './actions';
import { createWebSocketConnection } from './socket';

const apiHost = 'http://localhost:3000';

function createSocketChannel ( socket ) {
	return eventChannel( emit => {
		const requestHandler = request => {
			emit( { type: 'request', request } );
		};
		const messageHandler = message => {
			console.log( 'message', message );
			emit( sendMessage( message ) );
		};
		const errorHandler = errorEvent => {
			const reason = errorEvent.reason;

			if ( reason ) {
				emit( new Error( reason ) );
			}
		};
		const userConnected = user => {
			console.log( 'new user connected', user );
			emit( { type: 'userConnected', user } );
		}
		const usersConnected = users => {
			console.log( 'connected users', users );
			emit( { type: 'connectedUsers', users } );
		}
		const userDisconnected = user => {
			console.log( 'user disconnected', user );
			emit( { type: 'userDisconnected', user } );
		}

		// set up the subscription
		socket.on( 'chat message', messageHandler );
		socket.on( 'chat request', requestHandler );
		socket.on( 'chat user connected', userConnected );
		socket.on( 'chat users connected', usersConnected );
		socket.on( 'chat user disconnected', userDisconnected );

		// the subscriber must return an unsubscribe function
		// this will be invoked when the saga calls `channel.close` method
		const unsubscribe = () => {
			socket.off( 'chat message', messageHandler );
			socket.off( 'chat request', requestHandler );
			socket.off( 'error', errorHandler );
		};
		return unsubscribe;
	} );
}

function* sendRequest ( path = '', method = 'GET', payload = {} ) {
	const options = { method };

	if ( method === 'POST' ) {
		options.headers = { 'Content-Type': 'application/json' };
		options.body = JSON.stringify( payload );
	}
	return yield fetch( `${ apiHost }/${ path }`, options );
}
// function* fetchMessages ( conversationId ) {
function* fetchMessages ( payload ) {
	console.log( 'conversationId', payload.conversationId );
	const response = yield sendRequest( `conversation/${ payload.conversationId }` );

	if ( response.ok ) {
		const conversation = yield response.json();

		console.log( 'conversation', conversation );
		yield put( loadMessages( conversation.messages ) );
	} else {
		// TODO: handle error
		console.log( 'error', response );
	}
}
function* asyncAuthorize ( { email, password } ) {
	const resp = yield sendRequest( 'authorize', 'POST', { email, password } );
	const responseOK = resp.ok;
	let user;

	if ( responseOK ) {
		user = yield resp.json();
	} else {
		user = null;
	}

	yield put( authorize( responseOK ) );
	yield put( setUser( user ) );
}
function* fetchUser () {
	const resp = yield sendRequest( 'user' );
	const responseOK = resp.ok;
	let user;

	if ( responseOK ) {
		user = yield resp.json();
	} else {
		user = null;
	}

	yield put( authorize( responseOK ) );
	yield put( setUser( user ) );
}
// function* fetchRequests () {
// 	const response = yield sendRequest( 'requests' );
// 	const responseOK = response.ok;
// 	let user;

// 	if ( responseOK ) {
// 		user = yield response.json();
// 	} else {
// 		user = null;
// 	}

// 	// TODO: handle error
// 	yield put( setUser( user ) );
// }
function* asyncRegister ( { email, username, password } ) {
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify( { email, username, password } )
	};
	const resp = yield fetch( `${ apiHost }/register`, options );
	const responseOK = resp.ok;
	let user;

	if ( responseOK ) {
		user = yield resp.json();
	} else {
		user = null;
	}

	// TODO: show error when user exists
	yield put( authorize( responseOK ) );
	yield put( setUser( user ) );
}
function* request ( { to } ) {
	yield sendRequest( 'request', 'POST', { to } );
}
function* watchAuthorize () {
	yield takeEvery( ASYNC_AUTHORIZE, asyncAuthorize );
}
function* watchRegister () {
	yield takeEvery( ASYNC_REGISTER, asyncRegister );
}
function* watchSendMessage ( socket ) {
	while ( true ) {
		const payload = yield take( CREATE_MESSAGE );
		console.log( 'creating message' );
		console.log( 'payload', payload );

		yield apply( socket, socket.emit, [ 'client message', payload ] );
	}
}
function* watchJoinConversation ( socket ) {
	const callback = err => {
		console.log( 'error:', err );
	}
	while ( true ) {
		const payload = yield take( JOIN_CONVERSATION );
		console.log( 'about to join conversation' );
		console.log( 'socket', socket );

		yield apply( socket, socket.emit, [ 'client join', payload.conversationId, callback ] );
		// yield apply( socket, socket.on, [ 'client join', payload.conversationId ] );
	}
}
function* watchFetchUser () {
	yield takeEvery( ASYNC_FETCH_USER, fetchUser );
}
function* watchRequest () {
	yield takeEvery( ASYNC_REQUEST, request );
}
function* watchLoadMessages () {
	yield takeEvery( ASYNC_LOAD_MESSAGES, fetchMessages );
}
// function* watchFetchRequest () {
// 	yield takeEvery( ASYNC_FETCH_REQUESTS, fetchRequests );
// }
function* listenForMessages ( socketChannel ) {
	// Helper to get user data from within the state
	const getUser = state => state.user;
	let contacts;

	while ( true ) {
		const payload = yield take( socketChannel );
		let user = yield select( getUser );

		switch ( payload.type ) {
			case 'request':
				const request = payload.request;

				if ( request.to.email === user.email ) {
					user = {
						...user,
						requestsReceived: [
							...user.requestsReceived,
							request.from
						]
					};

					yield put( setUser( user ) );
					yield put( newRequest( true ) );
				}
				break;
			case 'userConnected':
				const userConnected = payload.user;

				contacts = user.contacts.map( contact => {
					if ( contact.userId === userConnected._id ) {
						// Create a copy of the contact
						contact = { ...contact };

						contact.status = 'connected';
					}
					return contact;
				} );

				yield put( setUser( { ...user, contacts } ) );
				break;
			case 'connectedUsers':
				console.log( 'payload', payload );
				const users = payload.users;

				contacts = user.contacts.map( contact => {
					const user = users.find( user => user._id === contact.userId );

					if ( user ) {
						// Create a copy of the contact
						contact = { ...contact };

						contact.status = 'connected';
					}
					return contact;
				} );
				yield put( setUser( { ...user, contacts } ) );
				break;
			case 'userDisconnected':
				const disconnectedUser = payload.user;

				contacts = user.contacts.map( contact => {
					if ( contact.userId === disconnectedUser._id ) {
						// Create a copy of the contact
						contact = { ...contact };

						delete contact.status;
					}
					return contact;
				} );

				yield put( setUser( { ...user, contacts } ) );
				break;
			default:
				yield put( payload );
		}
	}
}
function* initializeSocketIO () {
	const socket = yield call( createWebSocketConnection );
	const socketChannel = yield call( createSocketChannel, socket );

	try {
		// An error will cause the saga to jump to the catch block
		yield fork( listenForMessages, socketChannel );
		yield fork( watchSendMessage, socket );
		yield fork( watchJoinConversation, socket );

		console.log( 'socket initialized' );
		yield put( socketStatus( true ) );
	} catch ( error ) {
		console.log( 'socket error:', error );
		socketChannel.close();
	}
}
function* startStopChannel () {
	yield take( START_CHANNEL );
	console.log( 'about to initialize socket' );
	yield race( {
		task: call( initializeSocketIO )
		// TODO cancel action
	} );
}
export default function* rootSaga () {
	yield all( [
		watchAuthorize(),
		watchRegister(),
		watchFetchUser(),
		watchRequest(),
		// watchFetchRequest(),
		watchLoadMessages(),
		startStopChannel()
	] );
}