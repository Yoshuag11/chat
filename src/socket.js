import io from 'socket.io-client';

const socketServerURL = 'http://localhost:3001';
// const socketServerURL = 'http://192.168.1.70:3001';
// const socketServerURL = '192.168.1.70:3001';

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
	const socket = io( socketServerURL );
	return new Promise( resolve => {
		socket.on( 'connect', () => {
			console.log( 'socket connection was established' );
			resolve( socket );
		} );
	} )
};
// export default configureSocket;