import {
	put, takeEvery, all, call, apply, take, fork, race
} from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import {
	authorize,
	setUser,
	ASYNC_AUTHORIZE,
	START_CHANNEL,
	SEND_MESSAGE,
	CREATE_MESSAGE,
	ASYNC_REGISTER,
	ASYNC_FETCH_USER,
	ASYNC_REQUEST
} from './actions';
import { createWebSocketConnection } from './socket';

const host = 'http://localhost:3000';

function createSocketChannel ( socket ) {
	return eventChannel( emit => {
		const handler = data => {
			console.log( 'event detected within the token channel' );
			console.log( 'data', data );

			if ( data ) {
				emit( data );
			}
		};
		const errorHandler = errorEvent => {
			const reason = errorEvent.reason;

			if ( reason ) {
				emit( new Error( reason ) );
			}
		};

		// set up the subscription
		socket.on( 'incoming message', handler );

		// the subscriber must return an unsubscribe function
		// this will be invoked when the saga calls `channel.close` method
		const unsubscribe = () => {
			socket.off( 'incoming message', handler );
			socket.off( 'error', errorHandler );
		};
		return unsubscribe;
	} );
}

function* asyncAuthorize ( { email, password } ) {
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify( { email, password } )
	};
	console.log( { email, password } );
	let user;
	const resp = yield fetch( `${ host }/authorize`, options );
	const responseOK = resp.ok;

	if ( responseOK ) {
		user = yield resp.json();
	} else {
		user = null;
	}

	yield put( authorize( responseOK ) );
	yield put( setUser( user ) );
}
function* fetchUser () {
	console.log( 'fetchUser' );
	const options = {
		method: 'GET'
	};
	const resp = yield fetch( `${ host }/user`, options );
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
function* asyncRegister ( { email, username, password } ) {
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify( { email, username, password } )
	};
	const resp = yield fetch( `${ host }/register`, options );

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
	const resp = yield fetch( `${ host }/request`, options );
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
		const message = payload && payload.message ? payload.message : '';

		if ( message.length ) {
			yield apply( socket, socket.emit, [ 'create message', payload ] );
		}
	}
}
function* watchFetchUser () {
	yield takeEvery( ASYNC_FETCH_USER, fetchUser );
}
function* watchRequest () {
	yield takeEvery( ASYNC_REQUEST, request );
}
function* listenForMessages ( socketChannel ) {
	while ( true ) {
		const payload = yield take( socketChannel );
		console.log( 'payload', payload );
		// TODO: pass the whole payload to put so that it is a valid action
		// i.e. it has the type key, along with the necessary information
		yield put( { type: SEND_MESSAGE, message: payload.message } );
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
		startStopChannel()
	] );
}