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
	// newMessage,
	loadMessages,
	joinConversation,
	ASYNC_AUTHORIZE,
	START_CHANNEL,
	CREATE_MESSAGE,
	ASYNC_REGISTER,
	ASYNC_FETCH_USER,
	ASYNC_REQUEST,
	JOIN_CONVERSATION,
	ASYNC_LOAD_MESSAGES,
	NEW_MESSAGE_READ,
	CREATE_GROUP_CONVERSATION
	// ASYNC_FETCH_REQUESTS
} from './actions';
import { createWebSocketConnection } from './socket';

const apiHost = 'http://localhost:3000';
const getUser = state => state.user;
let conversationsJoined = [];

function createSocketChannel ( socket ) {
	return eventChannel( emit => {
		const requestHandler = request => {
			emit( { type: 'request', request } );
		};
		const messageHandler = message => {
			console.log( 'message received', message );
			emit( { type: 'messageReceived', message } );
			// emit( sendMessage( message ) );
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
function* createGroupConversation ( payload ) {
	console.log( 'about to creat group conversation' );
	console.log( 'payload', payload );
	const { users, name } = payload;
	const response = yield sendRequest(
		'conversation/group',
		'POST',
		{ users, name }
	);

	if ( response.ok ) {
		const user = yield response.json();

		console.log( 'group created' );
		yield put( setUser( user ) );
	}
}
// function* fetchMessages ( conversationId ) {
function* fetchMessages ( payload ) {
	console.log( 'about to fetch messages' );
	console.log( 'conversationId', payload.conversationId );
	const response = yield sendRequest( `conversation/${ payload.conversationId }` );

	if ( response.ok ) {
		const conversation = yield response.json();

		console.log( 'conversation loaded' );
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
function* newMessageRead( payload ) {
	console.log( 'trying to set a message a read' );
	console.log( 'payload', payload );
	// TODO: add error when conversationId was not provided
	let user = yield select( getUser );
	const { conversationId, conversationType } = payload;

	switch ( conversationType ) {
		case 'conversation':
			const contact = user.contacts.find( contact =>
				contact.conversationId === conversationId && contact.newMessage );

			if ( contact ) {
				console.log( 'about to remove "new message" notification' );
				console.log( 'newMessageRead', conversationId );
				const contacts = user.contacts.map( contact => {
					if ( contact.conversationId === conversationId ) {
						// create a copy of the contact
						contact = { ...contact };

						delete contact.newMessage;
					}
					return contact;
				} );

				user = { ...user, contacts };
			}
			break;
		case 'group':
			const group = user.groups.find( group =>
				group.conversationId === conversationId && group.newMessage );

			if ( group ) {
				console.log( 'about to remove "new message" notification' );
				console.log( 'newMessageRead', conversationId );
				const groups = user.groups.map( group => {
					if ( group.conversationId === conversationId ) {
						// create a copy of the group
						group = { ...group };

						delete group.newMessage;
					}
					return group;
				} );

				user = { ...user, groups };
			}
			break;
		default:
			// TODO: throw error
			console.log( 'wrong conversationType value:', conversationType );
			return;
	}

	// yield put( setUser( { ...user, contacts } ) );
	yield put( setUser( user ) );

}
// Watchers
function* watchCreateGroupConversation () {
	yield takeEvery( CREATE_GROUP_CONVERSATION, createGroupConversation );
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
		const { conversationId, message, conversationType } = payload;

		yield apply(
			socket,
			socket.emit,
			[
				'client message',
				{ conversationId, message, conversationType }
			] 
		);
	}
}
function* watchJoinConversation ( socket ) {
	const callback = error => {
		if ( error) {
			console.log( 'error:', error );
		}
	}

	while ( true ) {
		const payload = yield take( JOIN_CONVERSATION );
		const conversationId = payload.conversationId;

		if (
			!conversationsJoined.find(
				conversation => conversation === conversationId )
		) {
			// console.log( 'loading messages asynchronously' );
			// asyncLoadMessages( conversationId );
			console.log( 'about to join conversation' );
			console.log( 'socket', socket );
			const { conversationType } = payload;

			yield apply(
				socket,
				socket.emit,
				[
					'client join conversation',
					{
						conversationId,
						conversationType
					},
					callback
				]
			);
			// yield apply( socket, socket.on, [ 'client join', payload.conversationId ] );

			conversationsJoined.push( conversationId );
		};
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
function* watchNewMessageRead () {
	yield takeEvery( NEW_MESSAGE_READ, newMessageRead );
}
// function* watchFetchRequest () {
// 	yield takeEvery( ASYNC_FETCH_REQUESTS, fetchRequests );
// }
function* listenForMessages ( socketChannel ) {
	// Helper to get user data from within the state
	// const getUser = state => state.user;
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
				const userConnectedPayload = payload.user;
				// check if the user connected is part of current user's contacts
				const userConnected = user.contacts.find(
					contact => contact.userId === userConnectedPayload._id
				);

				if ( userConnected ) {
					console.log( 'connected user is a contact!');
					console.log( 'user connected full info', userConnected );
					const conversationId = userConnected.conversationId;

					// yield put( { type: JOIN_CONVERSATION, conversationId } );
					yield put( joinConversation( { conversationId } ) );

					// When it comes to contacts, the real user's id is withing the
					// property "userId" rather than "_id", since "_id" is the
					// actual id of the sub-document, which can be useful in case of,
					// for instance, delete a contact.
					contacts = user.contacts.map( contact => {
						if ( contact.userId === userConnected.userId ) {
							// Create a copy of the contact to avoid modifying
							// any existent user
							contact = { ...contact };

							contact.status = 'connected';
						}
						return contact;
					} );

					yield put( setUser( { ...user, contacts } ) );
				}
				break;
			case 'connectedUsers':
				console.log( 'connected users' );
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

				// connect conversations of connected users
				for (let contact of contacts ) {
					if ( contact.status ) {
						const conversationId = contact.conversationId;

						// Join to the chats so the user can interact with each contact
						// yield put( { type: JOIN_CONVERSATION, conversationId } );
						yield put( joinConversation( { conversationId } ) )
					}
				}
				// connect to available groups
				for ( let group of user.groups ) {
					const { conversationId } = group;

					yield put(
						joinConversation( {
							conversationId,
							conversationType: 'group'
						} ) 
					);
				}

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
			case 'messageReceived':
				const {
					message,
					message: {
						conversationType,
						conversationId
					}
				} = payload;

				if ( conversationType === 'group' ) {
					const groups = user.groups.map( group => {
						if ( group.conversationId === conversationId ) {
							// Create a copy of the group
							group = { ...group };
	
							group.newMessage = true;
						}
						return group;
					} );

					user = { ...user, groups };
				} else {
					contacts = user.contacts.map( contact => {
						if ( contact.conversationId === conversationId ) {
							// Create a copy of the contact
							contact = { ...contact };
	
							contact.newMessage = true;
						}
						return contact;
					} );

					user = { ...user, contacts };
				}
				// console.log(
				// 	'newMessage( payload.message )',
				// 	newMessage( payload.message )
				// );
				yield put( sendMessage( message ) );
				// yield put( newMessage( payload.message ) );
				yield put( setUser( user ) );
				break;
			default:
				console.log( 'payload', payload );
				yield put( payload );
		}
	}
}
function* initializeSocketIO () {
	const socket = yield call( createWebSocketConnection );
	const socketChannel = yield call( createSocketChannel, socket );
	const { __v, contacts, requestsSent, requestsReceived, ...user } = yield select( getUser );

	// explicitly connect user to the chat system
	yield apply( socket, socket.emit, [ 'client join', user ] );

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
		watchCreateGroupConversation(),
		watchNewMessageRead(),
		startStopChannel(),
	] );
}