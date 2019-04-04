import io from 'socket.io-client';

// const socketServerURL = 'http://localhost:3001';
// const socketServerURL = 'http://localhost:3001/socket';
// const socketServerURL = '/socket.io';
// const socketServerURL = 'http://api:3001';
// const socketServerURL = 'http://192.168.1.73:3001';
// const socketServerURL = '192.168.1.73:3001';

// const socket = io( 'http://localhost:3001', {
// 	path: '/myownpath'
// } );
// const configureSocket = dispatch => {
// 	// make sure socket is connected to the port
// 	socket.on( 'connect', () => {
// 		console.log( 'connected' );
// 	} );
// };
export const createWebSocketConnection = () => {
	// const socket = io( socketServerURL, { path: '/myownpath' } );
	// const socket = io( socketServerURL );
	const socket = io();
	return new Promise( resolve => {
		socket.on( 'connect', () => {
			console.log( 'socket connection was established' );
			resolve( socket );
		} );
	} )
};
// export default configureSocket;