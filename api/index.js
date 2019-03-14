const express = require( 'express' );
const jwt = require( 'jsonwebtoken' );
const session = require( 'express-session' );
const mongoose = require( 'mongoose' );
const port = 3001;
const COOKIE_NAME = 'auth-service';
const JWT_SECRET = 'rubik';
const app = express();
const rp = require( 'request-promise' );
const authenticateHost = 'http://localhost:3002';
const responseError = ( res, message = 'Unauthorized', code = 401 ) => {
	res
		.status( code )
		.send( { message } );
};
const authenticateSuccess = ( res, user ) => {
	res.cookie( 'isAuthorized', true );
	res.send( user );
};
const dbUsername = 'hector';
const dbPassword = 'hector';
const dbPort = 27017;
const dbUrl = 'localhost';
const database = 'Chat';
// Helper to check whether the user is logged in or not
const userLoggedIn = async session => {
	if ( 'userToken' in session  ) {
		console.log( 'user has token!' );
		const token = session.userToken;

		// "jwt.verify" called synchronously throws an error if invalid signature
		jwt.verify( token, JWT_SECRET );

		const userData = jwt.decode( token );

		if ( userData ) {
			// if user if not found, it throws an error
			return await UserModel.findById( userData.userId );
		}
	}
};
const setToken = ( session, userId ) => {
	session.userToken = jwt.sign(
			{ userId },
			JWT_SECRET
		);
};
const userSchema = new mongoose.Schema( {
	email: String,
	username: String
} );
const requestSchema = new mongoose.Schema( {
	from: {
		username: String,
		id: mongoose.Schema.Types.ObjectId
	},
	to: String // the username to send the notification
})
const UserModel = mongoose.model( 'User', userSchema );
const RequestModel = mongoose.model( 'Request', requestSchema );

mongoose.connect(
	`mongodb://${ dbUsername }:${ dbPassword }@${ dbUrl }:${ dbPort }/${ database }?authSource=admin`,
	{ useNewUrlParser: true }
);

const db = mongoose.connection;

db.once( 'open', function () {
	console.log( '******* database connection successfully established.' );
	console.log( '******* initializing web server...' );
	app.use( session( {
		name: COOKIE_NAME,
		secret: JWT_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {
			maxAge: 2 * 60 * 60 * 1000 // two hours
			// maxAge: 60 * 1000 // two minutes
		}
	} ) );
	// TODO: add middleware to validate whether user is logged in or not
	app.use( express.json() );
	app.use( express.urlencoded( { extended: true } ) );
	app.post( '/register', async ( req, res ) => {
		res.setHeader( 'Content-Type', 'application/json' );

		const { email, password, username } = req.body;

		if (
			email === undefined || password === undefined || username === undefined
		) {
			return res
				.status( 400 )
				.send( {
					message: 'Missing information to register'
				} );
		}

		const user = new UserModel( { email, password, username } );
		const options = {
			method: 'POST',
			uri: `${ authenticateHost }/register`,
			body: { email, password },
			json: true
		};

		try {
			await rp( options );

			const usr = await user.save();

			setToken( req.session, usr._id );

			authenticateSuccess( res, usr );
		} catch( error ) {
			let message;
			let code;

			if ( error.code && error.code === 11000 ) {
				message = 'Email already registered';
				code = 409;
			} else if ( error.error ) {
				// "error" is a property of "request promise error" object
				// error.message is a property set by the authorization service
				message = error.error.message || error.error;
				code = 400;
			}

			responseError( res, message, code );
		}
	} );
	app.post( '/authorize', async ( req, res ) => {
		res.setHeader( 'Content-type', 'application/json' );

		const session = req.session;

		try {
			// Check if user is already logged in
			const usr = await userLoggedIn( session );

			if ( usr ) {
				return authenticateSuccess( res, usr );
			}
		} catch ( e ) {
			console.log( e );
			let message;
			let code;

			if ( e.name === 'JsonWebTokenError' ) {
				message = 'Invalid or expired token, please log in again';
				code = 412;
			} else {
				message = 'User information not found';
				code = 404;
			}
			return responseError( res, message, code );
		}

		const { email, password } = req.body;

		if ( email === undefined || password === undefined ) {
			return responseError( res );
		}

		UserModel.findOne( { email }, async ( err, usr ) => {
			if ( err ) {
				return responseError( res );
			}

			const options = {
				method: 'POST',
				uri: `${ authenticateHost }/authenticate`,
				body: { email, password },
				json: true
			};
	
			try {
				// If user is not authorized, the call will throw an error
				await rp( options );

				setToken( session, usr._id );

				authenticateSuccess( res, usr );
			} catch ( e ) {
				console.log( e );
				return responseError( res );
			}
		} )
	} );
	app.post( '/request', async ( req, res ) => {
		res.setHeader( 'Content-type', 'application/json' );

		console.log( 'req.body', req.body );

		const session = req.session;
		const user = await userLoggedIn( session );

		if ( !user ) {
			return responseError( res );
		}

		const { to } = req.body;
		const request = new RequestModel( {
			from: {
				username: user.username,
				id: user._id
			},
			to
		} );
		console.log( 'user', user );
		// console.log( 'req', req );
		console.log( 'to', to);
		console.log( request, 'request' );

		try {
			const reqst = await request.save();
			console.log( reqst );

			res.send( { message: 'request successfully sent' } );
		} catch ( e ) {
			console.log( 'e', e );
			responseError( res, 'Request could not be fulfilled', 400 );
		}


	} )
	app.get( '/user', async ( req, res ) => {
		try {
			const user = await userLoggedIn( req.session );

			if ( user ) {
				authenticateSuccess( res, user );
			} else {
				responseError( res, 'Unauthorized', 401 );
			}
		} catch ( e ) {
			// TODO: figure out how to manage the errors within "userLoggedIn" function
			console.log( e );
			let message;
			let code;

			if ( e.name === 'JsonWebTokenError' ) {
				message = 'Invalid or expired token, please log in again';
				code = 412;
			} else {
				message = 'User information not found';
				code = 404;
			}
			return responseError( res, message, code );
		}
	} );

	const http = require( 'http' ).Server( app );
	// const io = require( 'socket.io' )( http, {
	// 	path: '/myownpath'
	// } );
	const io = require( 'socket.io' )( http );
	let socket;

	io.on( 'connection', function ( skt ) {
		console.log( 'a user connected' );

		socket = skt;

		// io.emit( 'ping', { payload: { message: 'hello' } } );
		io.emit( 'incoming message', { message: 'hello from socket.io' } );

		socket.on( 'disconnect', () => {
			console.log( 'user disconnected' );
		} );
		socket.on( 'create message', data => {
			console.log( 'data', data );
			io.emit( 'incoming message', data );
		} );
	} );
	http.listen(
		port,
		() => console.log( `******* Listening on port "${ port }"` )
	);
} );