import {
	put, takeEvery, all, call, apply, take, fork, race, select, cancelled
} from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import {
	authorize,
	setUser,
	// getRequests,
	socketStatus,
	newRequest,
	sendMessage,
	stopChannel,
	userLogout,
	// newMessage,
	loadMessages,
	loadGroups,
	// closeSocket,
	joinConversation,
	joinGroups,
	userAddedToGroup,
	loadDictionary,
	initializeSagas,
	setLanguage,
	ASYNC_AUTHORIZE,
	START_CHANNEL,
	STOP_CHANNEL,
	CREATE_MESSAGE,
	ASYNC_REGISTER,
	ASYNC_FETCH_USER,
	ASYNC_REQUEST,
	JOIN_CONVERSATION,
	ASYNC_LOAD_MESSAGES,
	NEW_MESSAGE_READ,
	CREATE_GROUP_CONVERSATION,
	ASYNC_LOAD_GROUPS,
	JOIN_GROUPS,
	ADD_PARTICIPANTS,
	USER_ADDED_TO_GROUP,
	// CLOSE_SOCKET,
	LOG_OUT,
	ASYNC_LOAD_DICTIONARY,
	ASYNC_SET_DICTIONARY,
	ASYNC_ACCEPT_REQUEST,
	INITIALIZE_SAGAS
	// ASYNC_FETCH_REQUESTS
} from './actions';
import { createWebSocketConnection } from './socket';
import Cookies from 'js-cookie';

const apiHost = 'http://localhost:3000';
// const apiHost = 'http://192.168.1.70:3000';
// const apiHost = '192.168.1.70:3000';
const getUser = state => state.user;
let conversationsJoined = [];
let userGroups = [];
const callback = error => {
	if ( error) {
		console.log( 'error:', error );
	}
};

function createSocketChannel ( socket ) {
	return eventChannel( emit => {
		const emitData = ( type, payload = {} ) => {
			emit( { type, ...payload } );
		};
		const requestHandler = request => {
			emitData( 'request', { request } );
			// emit( { type: 'request', request } );
		};
		const messageHandler = message => {
			// console.log( 'message received', message );
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
		};
		const usersConnected = connectedUsers => {
			emit( { type: 'connectedUsers', connectedUsers } );
		};
		const userDisconnected = user => {
			console.log( 'user disconnected', user );
			emit( { type: 'userDisconnected', user } );
		};
		const socketDisconnected = () => {
			console.log( '********* socketDisconnected *********' );
			emitData( 'socketDisconnected' );
		}
		const socketReconnect = () => {
			console.log( '********* socketReconnect *********' );
			emitData( 'socketReconnect' );
		}
		const addedToNewGroup = () => {
			console.log( '********* addedToNewGroup *********' );
			emitData( 'addedToNewGroup' );
		}

		// set up the subscription
		socket.on( 'chat message', messageHandler );
		socket.on( 'chat request', requestHandler );
		socket.on( 'chat user connected', userConnected );
		socket.on( 'chat users connected', usersConnected );
		socket.on( 'chat user disconnected', userDisconnected );
		socket.on( 'chat added to group', addedToNewGroup );
		socket.on( 'disconnect', socketDisconnected );
		socket.on( 'reconnect', socketReconnect );
		// socket.on( 'connect', () => {
		// 	console.log( 'hey dan' );
		// } );

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

	const response = yield fetch( `${ apiHost }/${ path }`, options );

	if ( response.status === 401 ) {
		// yield put( setUser( null ) );
		// yield put( authorize( false ) );
		// yield put( closeSocket() );
		yield put( userLogout() );
		yield put( stopChannel() );
		throw new Error( 'Unauthorized' );
	}
	return response;
	// return yield fetch( `${ apiHost }/${ path }`, options );
}
function* asyncAddParticipant ( payload ) {
	console.log( '********* asyncAddParticipant *********' );
	const { groupId, participants } = payload;
	const response = yield sendRequest(
		`conversation/group/${ groupId }`,
		'POST',
		{ participants }
	);

	if ( response.ok ) {
		const groups = yield response.json();

		console.log( 'participant added' );
		console.log( 'groups', groups );

		// yield put( setUser( user ) );
		userGroups = groups;

		yield put( loadGroups( groups ) );
		yield put( joinGroups() );

		for ( let participantId of participants ) {
			yield put( userAddedToGroup( participantId ) )
		}
	}
}
function* createGroupConversation ( payload ) {
	console.log( 'about to creat group conversation' );
	console.log( 'payload', payload );
	const { participants, name } = payload;
	const response = yield sendRequest(
		'conversation/group',
		'POST',
		{ participants, name }
	);

	if ( response.ok ) {
		const groups = yield response.json();

		console.log( 'group created' );
		console.log( 'groups', groups );
		// yield put( setUser( user ) );

		userGroups = groups;

		yield put( loadGroups( groups ) );
		yield put( joinGroups() );

		for ( let participantId of participants ) {
			yield put( userAddedToGroup( participantId ) )
		}
	}
}
// function* fetchMessages ( conversationId ) {
function* fetchMessages ( payload ) {
	console.log( 'about to fetch messages' );
	console.log( 'conversationId', payload.conversationId );
	try {
		const response = yield sendRequest( `conversation/${ payload.conversationId }` );

		if ( response.ok ) {
			const conversation = yield response.json();
	
			console.log( 'conversation loaded' );
			// console.log( 'conversation', conversation );
			yield put( loadMessages( conversation.messages ) );
		} else {
			console.log( 'error', response );
		}
	} catch ( error ) {
		console.log( 'error', error );
	}
}
// function* asynLoadGroups () {
// 	console.log( '********* asynLoadGroups *********' );
// 	let groups;

// 	if ( userGroups.length > 0 ) {
// 		groups = userGroups;
// 	} else {
// 		// TODO: handle errors
// 		groups = yield fetchGroups();
// 	}

// 	yield put( loadGroups( groups ) );
// }
function* fetchGroups () {
	console.log( '********* fetchGroups *********' );
	const response = yield sendRequest( 'groups' );

	if ( response.ok ) {
		const groups = yield response.json();

		console.log( 'groups loaded' );
		// console.log( 'groups', groups );

		userGroups = groups;

		yield put( loadGroups( userGroups ) );
		// connect all groups
		yield put( joinGroups() );
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
	yield fetchGroups();
}
function* fetchUser () {
	console.log( '********* fetchUser *********')
	try {
		const resp = yield sendRequest( 'user' );
		const responseOK = resp.ok;
		let user;
	
		if ( responseOK ) {
			user = yield resp.json();

			yield fetchGroups();
		} else {
			user = null;
		}
	
		yield put( authorize( responseOK ) );
		yield put( setUser( user ) );
		// yield fetchGroups();
	} catch ( error ) {
		console.log( 'error', error );
	}
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
function* asyncLoadDictionary () {
	console.log( '********* asyncLoadDictionary *********' );
	const response = yield sendRequest( 'dictionary' );

	if ( response.ok ) {
		const dictionary = yield response.json();

		// yield put( loadDictionary( dictionary ) );
		// yield put( setLanguage() );
		yield languageHandler( dictionary );
	}
}
function* asyncSetDictionary ( payload ) {
	console.log( '********* asyncSetDictionary *********' );
	const { language } = payload;
	const response = yield sendRequest(
		'dictionary',
		'POST',
		{ language }
	);

	if ( response.ok ) {
		const dictionary = yield response.json();

		// yield put( loadDictionary( dictionary ) );
		// yield put( setLanguage( Cookies.get( 'language' ) ) );
		yield languageHandler( dictionary );
	}
}
function* languageHandler ( dictionary ) {
	console.log( '********* languageHandler *********' );
	yield put( loadDictionary( dictionary ) );
	yield put( setLanguage( Cookies.get( 'language') ) );
}
function* asyncAcceptRequest ( payload ) {
	const { requestId } = payload;
	const response = yield sendRequest(
		'request/accept',
		'POST',
		{ requestId }
	);

	if ( response.ok ) {
		yield fetchUser();
	} else {
		console.log( 'error', response );
		throw new Error( 'Error while trying to accept request' );
	}
}
function* asyncRegister ( { email, username, password } ) {
	// const options = {
	// 	method: 'POST',
	// 	headers: {
	// 		'Content-Type': 'application/json'
	// 	},
	// 	body: JSON.stringify( { email, username, password } )
	// };
	// const resp = yield fetch( `${ apiHost }/register`, options );
	const response =
		yield sendRequest(
			'register',
			'POST',
			{ email, username, password }
		);
	const responseOK = response.ok;
	let user;

	if ( responseOK ) {
		user = yield response.json();
	} else {
		user = null;
	}

	// TODO: show error when user exists
	// yield fetchUser();
	yield put( authorize( responseOK ) );
	yield put( setUser( user ) );
}
function* request ( { to } ) {
	yield sendRequest( 'request', 'POST', { to } );
}
function* logOut () {
	// TODO: handle errors
	yield sendRequest( 'logout', 'POST' );
	// yield put( socketStatus( false ) );
	// yield put( authorize( false ) );
	// yield put( setUser( null ) );
	yield put( userLogout() );
	yield asyncLoadDictionary();
	yield put( stopChannel() );
	// yield put( initializeSagas() );
}
function* newMessageRead( payload ) {
	console.log( 'trying to set a message as read' );
	// console.log( 'payload', payload );
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

				// user = { ...user, contacts };
				return yield put( setUser( { ...user, contacts } ) );
			}
			break;
		case 'group':
			// console.log( 'userGroups', userGroups );
			const group = userGroups.find(
				// group.conversationId is a string value
				group => group.conversationId === conversationId && group.newMessage
			);

			// TODO: set error when group is not found
			if ( group ) {
				console.log( 'about to remove "new message" notification' );
				console.log( 'newMessageRead', conversationId );
				const groups = userGroups.map( group => {
					console.log( 'group.conversationId', group.conversationId );
					console.log( 'typeof group.conversationId', typeof group.conversationId );
					if ( group.conversationId.toString() === conversationId ) {
						// create a copy of the group
						group = { ...group };

						delete group.newMessage;
					}
					return group;
				} );

				// user = { ...user, groups };
				userGroups = groups;
				return yield put( loadGroups( userGroups ) );
			}
			break;
		default:
			// TODO: throw error
			console.log( 'wrong conversationType value:', conversationType );
			return;
	}

	// yield put( setUser( { ...user, contacts } ) );
	// yield put( setUser( user ) );
}
// Watchers
function* watchCreateGroupConversation () {
	yield takeEvery( CREATE_GROUP_CONVERSATION, createGroupConversation );
}
function* watchAddParticipant () {
	yield takeEvery( ADD_PARTICIPANTS, asyncAddParticipant );
}
function* watchAuthorize () {
	yield takeEvery( ASYNC_AUTHORIZE, asyncAuthorize );
}
function* watchRegister () {
	yield takeEvery( ASYNC_REGISTER, asyncRegister );
}
function* watchAcceptRequest () {
	yield takeEvery( ASYNC_ACCEPT_REQUEST, asyncAcceptRequest );
}
function* watchSendMessage ( socket ) {
	while ( true ) {
		const payload = yield take( CREATE_MESSAGE );
		console.log( 'creating message' );
		// console.log( 'payload', payload );
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
function* asyncJoinGroups ( socket ) {
	yield apply(
		socket,
		socket.emit,
		[
			'client join groups',
			callback
		]
	);
}
// function* watchCloseSocketConnection ( socket ) {
// 	console.log( '********* watchCloseSocketConnection *********' );
// 	yield take( CLOSE_SOCKET );

// 	console.log( 'about to close socket' );

// 	socket.close();
// }
function* watchUserAddedToGroup ( socket ) {
	console.log( '********* watchUserAddedToGroup *********');

	while ( true ) {
		const payload = yield take( USER_ADDED_TO_GROUP );
		const { participantId } = payload;

		console.log( 'about no notify participants that they were added to a new group')
		console.log( 'payload', payload );

		yield apply(
			socket,
			socket.emit,
			[
				'client user added to group',
				{ participantId }
			]
		);
	}
} 
function* watchJoinGroups ( socket ) {
	console.log( '********* watchJoinGroups *********');

	while ( true ) {
		yield take( JOIN_GROUPS );
		console.log( 'about to join groups' );
		yield call( asyncJoinGroups, socket );
		// yield apply(
		// 	socket,
		// 	socket.emit,
		// 	[
		// 		'client join groups',
		// 		callback
		// 	]
		// );
	}
}
function* watchJoinConversation ( socket ) {
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
function* watchLoadDictionary () {
	yield takeEvery( ASYNC_LOAD_DICTIONARY, asyncLoadDictionary );
}
function* watchSetDictionary () {
	yield takeEvery( ASYNC_SET_DICTIONARY, asyncSetDictionary );
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
function* watchLoadGroups () {
	yield takeEvery( ASYNC_LOAD_GROUPS, fetchGroups );
}
function* watchNewMessageRead () {
	yield takeEvery( NEW_MESSAGE_READ, newMessageRead );
}
function* watchLogOut () {
	yield takeEvery( LOG_OUT, logOut );
}
// function* watchFetchRequest () {
// 	yield takeEvery( ASYNC_FETCH_REQUESTS, fetchRequests );
// }
// function* listenForMessages ( socketChannel ) {
// 	// Helper to get user data from within the state
// 	// const getUser = state => state.user;
// 	let contacts;

// 	while ( true ) {
// 		const payload = yield take( socketChannel );
// 		let user = yield select( getUser );

// 		switch ( payload.type ) {
// 			case 'request':
// 				const request = payload.request;

// 				if ( request.to.email === user.email ) {
// 					user = {
// 						...user,
// 						requestsReceived: [
// 							...user.requestsReceived,
// 							{
// 								...request.from,
// 								requestId: request._id
// 							}
// 						]
// 					};

// 					yield put( setUser( user ) );
// 					yield put( newRequest( true ) );
// 				}
// 				break;
// 			case 'userConnected':
// 				const userConnectedPayload = payload.user;
// 				// check if the user connected is part of current user's contacts
// 				const userConnected = user.contacts.find(
// 					contact => contact.userId === userConnectedPayload._id
// 				);

// 				if ( userConnected ) {
// 					console.log( 'connected user is a contact!');
// 					console.log( 'user connected full info', userConnected );
// 					const conversationId = userConnected.conversationId;

// 					// yield put( { type: JOIN_CONVERSATION, conversationId } );
// 					yield put(
// 						joinConversation( {
// 							conversationId,
// 							conversationType: 'conversation'
// 						} )
// 					);

// 					// When it comes to contacts, the real user's id is withing the
// 					// property "userId" rather than "_id", since "_id" is the
// 					// actual id of the sub-document, which can be useful in case of,
// 					// for instance, delete a contact.
// 					contacts = user.contacts.map( contact => {
// 						if ( contact.userId === userConnected.userId ) {
// 							// Create a copy of the contact to avoid modifying
// 							// any existent user
// 							contact = { ...contact };

// 							contact.connected = true;
// 						}
// 						return contact;
// 					} );

// 					yield put( setUser( { ...user, contacts } ) );
// 				}
// 				break;
// 			case 'connectedUsers':
// 				console.log( 'connected users' );
// 				// console.log( 'payload', payload );
// 				const { connectedUsers } = payload;
// 				const contactsToConnectTo = [];

// 				// look up for connected contacts
// 				contacts = user.contacts.map( contact => {
// 					const user =
// 						connectedUsers.find( user => user._id === contact.userId );

// 					if ( user ) {
// 						// Create a copy of the contact
// 						contact = { ...contact };
// 						contact.connected = true;

// 						contactsToConnectTo.push( contact );
// 					}
// 					return contact;
// 				} );

// 				console.log( 'available contacts to connect to:', contactsToConnectTo );

// 				// connect conversations of connected users
// 				for (let contact of contactsToConnectTo ) {
// 					if ( contact.connected ) {
// 						const conversationId = contact.conversationId;

// 						// Join to the chats so the user can interact with each contact
// 						// yield put( { type: JOIN_CONVERSATION, conversationId } );
// 						yield put(
// 							joinConversation( {
// 								conversationId,
// 								conversationType: 'conversation'
// 							} )
// 						);
// 					}
// 				}
// 				// // connect to available groups
// 				// for ( let conversationId of user.groups ) {
// 				// 	yield put(
// 				// 		joinConversation( {
// 				// 			conversationId,
// 				// 			conversationType: 'group'
// 				// 		} ) 
// 				// 	);
// 				// }

// 				yield put( setUser( { ...user, contacts } ) );
// 				break;
// 			case 'socketDisconnected':
// 				yield put( socketStatus( false ) );
// 				// yield put( authorize( false ) );
// 				// yield put( setUser( null ) );
// 				break;
// 			case 'socketReconnect':
// 				console.log( '********* socketReconnect *********' );
// 				yield put( socketStatus( true ) );
// 				yield fetchUser();
// 				break;
// 			case 'addedToNewGroup':
// 				console.log( '********* addedToNewGroup *********' );
// 				yield fetchGroups();
// 				break;
// 			case 'userDisconnected':
// 				const disconnectedUser = payload.user;

// 				contacts = user.contacts.map( contact => {
// 					if ( contact.userId === disconnectedUser._id ) {
// 						// Create a copy of the contact
// 						contact = { ...contact };

// 						delete contact.connected;
// 					}
// 					return contact;
// 				} );

// 				yield put( setUser( { ...user, contacts } ) );
// 				break;
// 			case 'messageReceived':
// 				const {
// 					message,
// 					message: {
// 						conversationType,
// 						conversationId
// 					}
// 				} = payload;

// 				if ( conversationType === 'group' ) {
// 					const groups = userGroups.map( group => {
// 						console.log( 'group.conversationId', group.conversationId );
// 						console.log( 'typeof group.conversationId', typeof group.conversationId );
// 						if ( group.conversationId.toString() === conversationId ) {
// 							// Create a copy of the group
// 							group = { ...group };
	
// 							group.newMessage = true;
// 						}
// 						return group;
// 					} );

// 					// user = { ...user, groups };
// 					userGroups = groups;

// 					yield put( loadGroups( userGroups ) );
// 				} else {
// 					contacts = user.contacts.map( contact => {
// 						if ( contact.conversationId === conversationId ) {
// 							// Create a copy of the contact
// 							contact = { ...contact };
	
// 							contact.newMessage = true;
// 						}
// 						return contact;
// 					} );

// 					// user = { ...user, contacts };
// 					yield put( setUser( { ...user, contacts } ) );
// 				}
// 				// console.log(
// 				// 	'newMessage( payload.message )',
// 				// 	newMessage( payload.message )
// 				// );
// 				yield put( sendMessage( message ) );
// 				// yield put( newMessage( payload.message ) );
// 				// yield put( setUser( user ) );
// 				break;
// 			default:
// 				console.log( 'payload', payload );
// 				yield put( payload );
// 		}
// 	}
// }
function* initializeSocketIO () {
	console.log( '********* initializeSocketIO *********' );
	const socket = yield call( createWebSocketConnection );
	const socketChannel = yield call( createSocketChannel, socket );
	const { __v, contacts, requestsSent, requestsReceived, ...user } = yield select( getUser );

	// explicitly connect user to the chat system
	yield apply( socket, socket.emit, [ 'client join', user ] );
	// join user to all chat conversations
	yield fork( asyncJoinGroups, socket );

	try {
		// An error will cause the saga to jump to the catch block
		// yield fork( listenForMessages, socketChannel );
		yield fork( watchSendMessage, socket );
		yield fork( watchJoinConversation, socket );
		yield fork( watchJoinGroups, socket );
		yield fork( watchUserAddedToGroup, socket );
		// yield fork( watchCloseSocketConnection, socket );

		console.log( 'socket initialized' );
		yield put( socketStatus( true ) );

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
								{
									...request.from,
									requestId: request._id
								}
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
						yield put(
							joinConversation( {
								conversationId,
								conversationType: 'conversation'
							} )
						);

						// When it comes to contacts, the real user's id is withing the
						// property "userId" rather than "_id", since "_id" is the
						// actual id of the sub-document, which can be useful in case of,
						// for instance, delete a contact.
						contacts = user.contacts.map( contact => {
							if ( contact.userId === userConnected.userId ) {
								// Create a copy of the contact to avoid modifying
								// any existent user
								contact = { ...contact };

								contact.connected = true;
							}
							return contact;
						} );

						yield put( setUser( { ...user, contacts } ) );
					}
					break;
				case 'connectedUsers':
					console.log( 'connected users' );
					// console.log( 'payload', payload );
					const { connectedUsers } = payload;
					const contactsToConnectTo = [];

					// look up for connected contacts
					contacts = user.contacts.map( contact => {
						const user =
							connectedUsers.find( user => user._id === contact.userId );

						if ( user ) {
							// Create a copy of the contact
							contact = { ...contact };
							contact.connected = true;

							contactsToConnectTo.push( contact );
						}
						return contact;
					} );

					console.log( 'available contacts to connect to:', contactsToConnectTo );

					// connect conversations of connected users
					for (let contact of contactsToConnectTo ) {
						if ( contact.connected ) {
							const conversationId = contact.conversationId;

							// Join to the chats so the user can interact with each contact
							// yield put( { type: JOIN_CONVERSATION, conversationId } );
							yield put(
								joinConversation( {
									conversationId,
									conversationType: 'conversation'
								} )
							);
						}
					}
					// // connect to available groups
					// for ( let conversationId of user.groups ) {
					// 	yield put(
					// 		joinConversation( {
					// 			conversationId,
					// 			conversationType: 'group'
					// 		} ) 
					// 	);
					// }

					yield put( setUser( { ...user, contacts } ) );
					break;
				case 'socketDisconnected':
					yield put( socketStatus( false ) );
					// yield put( authorize( false ) );
					// yield put( setUser( null ) );
					break;
				case 'socketReconnect':
					console.log( '********* socketReconnect *********' );
					yield put( socketStatus( true ) );
					yield fetchUser();
					break;
				case 'addedToNewGroup':
					console.log( '********* addedToNewGroup *********' );
					yield fetchGroups();
					break;
				case 'userDisconnected':
					const disconnectedUser = payload.user;

					contacts = user.contacts.map( contact => {
						if ( contact.userId === disconnectedUser._id ) {
							// Create a copy of the contact
							contact = { ...contact };

							delete contact.connected;
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
						const groups = userGroups.map( group => {
							console.log( 'group.conversationId', group.conversationId );
							console.log( 'typeof group.conversationId', typeof group.conversationId );
							if ( group.conversationId.toString() === conversationId ) {
								// Create a copy of the group
								group = { ...group };
		
								group.newMessage = true;
							}
							return group;
						} );

						// user = { ...user, groups };
						userGroups = groups;

						yield put( loadGroups( userGroups ) );
					} else {
						contacts = user.contacts.map( contact => {
							if ( contact.conversationId === conversationId ) {
								// Create a copy of the contact
								contact = { ...contact };
		
								contact.newMessage = true;
							}
							return contact;
						} );

						// user = { ...user, contacts };
						yield put( setUser( { ...user, contacts } ) );
					}
					// console.log(
					// 	'newMessage( payload.message )',
					// 	newMessage( payload.message )
					// );
					yield put( sendMessage( message ) );
					// yield put( newMessage( payload.message ) );
					// yield put( setUser( user ) );
					break;
				default:
					console.log( 'payload', payload );
					yield put( payload );
			}
		}
	} catch ( error ) {
		console.log( 'socket error:', error );
		socketChannel.close();
	} finally {
		console.log( 'initializeSocketIO cancelled' );
		if ( yield cancelled() ) {
			console.log( 'initializeSocketIO cancelled' );
			// socketChannel.close();
			socket.close();
			console.log( 'trying to restart sagas' );
			yield put( initializeSagas() );
		}
	}
}
function* startStopChannel () {
	yield take( START_CHANNEL );
	console.log( 'about to initialize socket' );
	yield race( {
		task: call( initializeSocketIO ),
		cancel: take( STOP_CHANNEL )
	} );
}
function* rootSaga() {
	yield all( [
		watchAuthorize(),
		watchRegister(),
		watchFetchUser(),
		watchRequest(),
		// watchFetchRequest(),
		watchLoadMessages(),
		watchCreateGroupConversation(),
		watchNewMessageRead(),
		watchLogOut(),
		watchLoadGroups(),
		watchAddParticipant(),
		watchLoadDictionary(),
		watchSetDictionary(),
		watchAcceptRequest(),
		startStopChannel()
	] );
};
export default function* () {
	while ( true ) {
		console.log( 'looping sagas initialization' );
		yield take( INITIALIZE_SAGAS );
		console.log( 'about to initialize sagas' );
		yield fork( rootSaga );
	}
}
// export default function* rootSaga () {
// 	yield all( [
// 		watchAuthorize(),
// 		watchRegister(),
// 		watchFetchUser(),
// 		watchRequest(),
// 		// watchFetchRequest(),
// 		watchLoadMessages(),
// 		watchCreateGroupConversation(),
// 		watchNewMessageRead(),
// 		watchLogOut(),
// 		watchLoadGroups(),
// 		watchAddParticipant(),
// 		watchLoadDictionary(),
// 		watchSetDictionary(),
// 		watchAcceptRequest(),
// 		startStopChannel()
// 	] );
// };