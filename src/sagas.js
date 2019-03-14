import {
	put, takeEvery, all, call, apply, take, fork, race, select
} from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import {
	authorize,
	setUser,
	getRequests,
	newRequest,
	sendMessage,
	ASYNC_AUTHORIZE,
	START_CHANNEL,
	CREATE_MESSAGE,
	ASYNC_REGISTER,
	ASYNC_FETCH_USER,
	ASYNC_REQUEST,
	ASYNC_FETCH_REQUESTS
} from './actions';
import { createWebSocketConnection } from './socket';

const apiHost = 'http://localhost:3000';

function* createSocketChannel ( socket ) {
	const getUser = state => state.user;
	const user = yield select( getUser );
	return eventChannel( emit => {
		const requestHandler = function ( request ) {

			if ( request.to === user.email ) {
				console.log( 'about to send the request' );
				emit( newRequest( request ) );
			}
		};
		const messageHandler = message => {
			console.log( 'event detected within the token channel' );
			console.log( 'message', message );

			if ( message ) {
				emit( sendMessage( message ) );
			}
		};
		const errorHandler = errorEvent => {
			const reason = errorEvent.reason;

			if ( reason ) {
				emit( new Error( reason ) );
			}
		};

		// set up the subscription
		socket.on( 'chat message', messageHandler );
		socket.on( 'chat request', requestHandler );

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
function* fetchRequests () {
	const response = yield sendRequest( 'requests' );
	const requests = yield response.json();

	yield put( getRequests( requests ) );
}
function* asyncRegister ( { email, username, password } ) {
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify( { email, username, password } )
	};
	const resp = yield fetch( `${ apiHost }/register`, options );

	// TODO: show error when user exists
	yield put( authorize( resp.ok ) );
}
function* request ( { to } ) {
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify( { to } )
	};
	yield fetch( `${ apiHost }/request`, options );
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
		console.log( 'payload', payload );
		const message = payload && payload.message ? payload.message : '';

		if ( message.length ) {
			yield apply( socket, socket.emit, [ 'create message', message ] );
		}
	}
}
function* watchFetchUser () {
	yield takeEvery( ASYNC_FETCH_USER, fetchUser );
}
function* watchRequest () {
	yield takeEvery( ASYNC_REQUEST, request );
}
function* watchFetchRequest () {
	yield takeEvery( ASYNC_FETCH_REQUESTS, fetchRequests );
} 
function* listenForMessages ( socketChannel ) {
	while ( true ) {
		const payload = yield take( socketChannel );

		console.log( 'payload', payload );
		yield put( payload );
	}
}
function* initializeSocketIO () {
	const socket = yield call( createWebSocketConnection );
	const socketChannel = yield call( createSocketChannel, socket );

	try {
		// An error will cause the saga to jump to the catch block
		yield fork( listenForMessages, socketChannel );
		yield fork( watchSendMessage, socket );
	} catch ( error ) {
		console.log( 'socket error:', error );
		socketChannel.close();
	}
}
function* startStopChannel () {
	yield take( START_CHANNEL );
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
		watchFetchRequest(),
		startStopChannel()
	] );
}