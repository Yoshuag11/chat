const express = require( 'express' );
const jwt = require( 'jsonwebtoken' );
const session = require( 'express-session' );
const mongoose = require( 'mongoose' );
const moment = require( 'moment' );
const port = 3001;
const COOKIE_NAME = 'auth-service';
const JWT_SECRET = 'rubik';
const app = express();
const rp = require( 'request-promise' );
const {
	conversationSchema,
	requestSchema,
	userSchema,
	contactSchema,
	messageScheme,
	groupParticipantSchema,
	groupSchema
} = require( './schemas' );
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
const UserModel = mongoose.model( 'User', userSchema );
const RequestModel = mongoose.model( 'Request', requestSchema );
const ConversationModel = mongoose.model( 'Conversation', conversationSchema );
const ContactModel = mongoose.model( 'Contact', contactSchema );
const MessageModel = mongoose.model( 'Message', messageScheme );
const GroupParticipantModel =
	mongoose.model( 'GroupParticipant', groupParticipantSchema );
const GroupModel = mongoose.model( 'Group', groupSchema );
// list of connected users
let connectedUsers = [];
let currentSession;

mongoose.set( 'useFindAndModify', false );
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
	app.use( async ( req, res, next ) => {
		currentSession = req.session;
		res.setHeader( 'Content-type', 'application/json' );

		const path = req.url;

		if ( path === '/register' ) {
			return next();
		}

		try {
			// Check if user is already logged in
			const user = await userLoggedIn( currentSession );

			if ( !user ) {
				return path === '/authorize'
					? next()
					: responseError( res );
			}

			req.user = user;

			next();
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
	})
	app.post( '/register', async ( req, res ) => {
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

		// const user = new UserModel( { email, username, requests: [], contacts: [] } );
		const user = new UserModel( { email, username } );
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
			console.log( 'error', error );
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
		let user = req.user;

		if ( user ) {
			return authenticateSuccess( res, user );
		}

		const { email, password } = req.body;

		if ( email === undefined || password === undefined ) {
			return responseError( res );
		}

		user =  await UserModel.findOne( { email } );

		if ( !user ) {
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

			setToken( req.session, user._id );
			authenticateSuccess( res, user );
		} catch ( e ) {
			console.log( e );
			return responseError( res );
		}
	} );
	app.post( '/request', async ( req, res ) => {
		const user = req.user;
		// TODO: validate that such user exists before going further
		const { to: email } = req.body;
		const contactUser = await UserModel.findOne( { email } );

		if ( !contactUser ) {
			// We don't throw error so that users don´t try to figure out which users
			// are registered already
			return res.send( { message: 'request successfully sent' } );
		}

		let request = new RequestModel( {
			from: {
				userId: user._id,
				email: user.email,
				username: user.username
			},
			status: 'pending',
			to: {
				userId: contactUser._id,
				email,
				username: contactUser.username
			}
		} );

		try {
			request = await request.save();

			await UserModel.findByIdAndUpdate(
				user._id,
				{
					$set: {
						requestsSent: [
							...user.requestsSent,
							{
								requestId: request._id,
								...request.to
							}
						]
					}
				}
			);

			await UserModel.findByIdAndUpdate(
				contactUser._id,
				{
					$set: {
						requestsReceived: [
							...contactUser.requestsReceived,
							{
								requestId: request._id,
								...request.from
							}
						]
					}
				}
			);

			res.send( { message: 'request successfully sent' } );
			io.emit( 'chat request', request );
		} catch ( e ) {
			console.log( 'e', e );
			responseError( res, 'Request could not be fulfilled', 400 );
		}
	} );
	app.post( '/request/accept', async ( req, res ) => {
		const user = req.user;
		const { id } = req.body;
		// validate that the request indeed belongs to the user
		const request =
			user.requestsReceived.find( request => request.requestId == id );

		if ( !request ) {
			return responseError( res );
		}

		// get all request´s data
		const wholeRequest = await RequestModel.findById( id );

		if ( !wholeRequest ) {
			return responseError( res );
		}

		const conversation =
			await ( new ConversationModel() ).save();
		const contactInformation = wholeRequest.from;
		const contactModelInstanceFrom = new ContactModel( {
			username: contactInformation.username,
			userId: contactInformation.userId,
			conversationId: conversation._id
		} );
		const contactModelInstanceTo = new ContactModel( {
			username: user.username,
			userId: user._id,
			conversationId: conversation._id
		} );
		const contact = await UserModel.findById( contactInformation.userId );

		// update requester's contact list
		await UserModel.findByIdAndUpdate(
			contact._id,
			{
				$set: {
					contacts: [
						...contact.contacts,
						contactModelInstanceTo
					],
					requestsSent:
						contact.requestsSent.filter(
							request => request.requestId != id
						)
				}
			}
		);
		// update user's contact list
		await UserModel.findByIdAndUpdate(
			user._id,
			{
				$set: {
					contacts: [
						...user.contacts,
						contactModelInstanceFrom
					],
					requestsReceived:
						user.requestsReceived.filter(
							request => request.requestId != id
						)
				}
			}
		);
		await RequestModel.findByIdAndUpdate(
			id,
			{
				$set: {
					status: 'accepted'
				}
			}
		)

		res.send( { message: 'Contact added correctly' } );
	} );
	app.post( '/conversation/group', async ( req, res ) => {
		// TODO: handle creation error
		const conversation =
			await ( new ConversationModel( { type: 'group' } ) ).save();
		// const { user, body: { name, participants } } = req;
		const { name, participants: reqParticipants } = req.body;
		console.log( 'req.body', req.body );
		console.log( 'reqParticipants', reqParticipants );
		// Check whether I need to to the "toObject" operation right from the 
		// middleware that sets user value.
		const user = req.user.toObject();
		const participants = [];
		const currentTime = moment().seconds(0).milliseconds(0).toISOString();

		for ( let participantId of reqParticipants ) {
			console.log( 'participantId', participantId );
			const contact = user.contacts.find(
				contact => {
					console.log( 'typeof contact.userId', typeof contact.userId );
					return contact.userId.toString() === participantId
				}
			);

			console.log( 'contact', contact );

			if ( !contact ) {
				return responseError( res );
			}

			console.log( 'contact', contact );

			const { username, userId } = contact;
			const groupParticipant =
				new GroupParticipantModel( {
					username,
					userId,
					joinedAt: currentTime
				} );

			participants.push( groupParticipant );
		}

		// create current user as part of the participants so that other can
		// see they(?) as well
		const { username, _id: userId } = user
		const groupParticipant =
			new GroupParticipantModel( {
				username,
				userId,
				joinedAt: currentTime
			} );

		participants.push( groupParticipant );

		console.log( 'group participants', participants );

		const group = await (
			new GroupModel( {
				name,
				participants,
				conversationId: conversation._id
			} )
		).save();
		const groupId = group._id;

		// add the conversation to every user
		for ( let participantId of reqParticipants ) {
			const contact = await UserModel.findById( participantId );

			await UserModel.findByIdAndUpdate(
				participantId,
				{
					$set: {
						groups: [
							...contact.groups,
							groupId
						]
					}
				}
			);
		}

		// update user that requested the group
		await UserModel.findByIdAndUpdate(
			user._id,
			{
				$set: {
					groups: [
						...user.groups,
						groupId
					]
				}
			}
		);

		// TODO: handle possible mongodb errors
		res.send( await UserModel.findById( user._id ) );
	} );
	app.post( '/conversation/group/:conversationId', async ( req, res ) => {
		// TODO: handle creation error
		const conversation =
			await ( new ConversationModel( { type: 'group' } ) ).save();
		// const { user, body: { name, users } } = req;
		const { name, users } = req.body;
		// Check whether I need to to the "toObject" operation right from the 
		// middleware that sets user value.
		const user = req.user.toObject();
		const participants = [];

		for ( let userId of users ) {
			console.log( 'userId', userId );
			const contact = user.contacts.find(
				contact => contact.userId.toString() === userId
			);

			console.log( 'contact', contact );

			if ( !contact ) {
				return responseError( res );
			}

			console.log( 'contact', contact );

			const { username, userId } = contact;
			const groupParticipant =
				new GroupParticipantModel( {
					username,
					userId,
					joinedAt: moment().seconds(0).milliseconds(0).toISOString()
				} );
			console.log( 'groupParticipant', groupParticipant );

			participants.push( groupParticipant );
		}

		// create current user as part of the participants so that other can
		// see they(?) as well
		const groupParticipant =
			new GroupParticipantModel( ( { username, _id: userId } = user ) );

		participants.push( groupParticipant );

		const group = await (
			new GroupModel( {
				name,
				participants,
				conversationId: conversation._id
			} )
		).save();

		// add the conversation to every user
		for ( let userId of users ) {
			const contact = await UserModel.findById( userId );

			await UserModel.findByIdAndUpdate(
				userId,
				{
					$set: {
						groups: [
							...contact.groups,
							group
						]
					}
				}
			);
		}

		// update user that requested the group
		await UserModel.findByIdAndUpdate(
			user._id,
			{
				$set: {
					groups: [
						...user.groups,
						group
					]
				}
			}
		);

		// TODO: handle possible mongodb errors
		res.send( await UserModel.findById( user._id ) );
	} );
	app.get( '/user', ( req, res ) => {
		authenticateSuccess( res, req.user );
	} );
	app.get( '/conversation/:id', async ( req, res ) => {
		const contact = req.user.contacts.find(
				contact => contact.conversationId = req.params.id
			);

		if ( !contact ) {
			return responseError( res );
		}

		const conversation =
			await ConversationModel.findById( contact.conversationId );

		res.send( conversation );
	} );
	app.get( '/groups', async ( req, res ) => {
		console.log( '*******api "/groups" called' );
		const user = req.user.toObject();
		const groups = await GroupModel.find( {
			_id: {
				$in: user.groups
			}
		} );

		if ( !groups ) {
			console.log( 'groups', groups );
			responseError( res );
		} else {
			res.send( groups );
		}
	} );
	// app.get( '/requests', async ( req, res ) => {
	// 	let user = req.user;
	// 	const requests = await RequestModel.find( {
	// 		'to.email': user.email,
	// 		status: 'pending'
	// 	} );

	// 	if ( requests.length > 0 ) {
	// 		requests.map( async request => {
	// 			await RequestModel.findByIdAndUpdate(
	// 				request._id,
	// 				{
	// 					$set: {
	// 						status: 'done'
	// 					}
	// 				}
	// 			);
	// 		} );

	// 		user = await UserModel.findByIdAndUpdate(
	// 			user._id,
	// 			{
	// 				$set: {
	// 					requestsReceived: [ ...user.requestsReceived, ...requests ]
	// 				}
	// 			},
	// 			{
	// 				new: true
	// 			}
	// 		);
	// 	}

	// 	res.send( user );
	// } );

	const http = require( 'http' ).Server( app );
	// const io = require( 'socket.io' )( http, {
	// 	path: '/myownpath'
	// } );
	const io = require( 'socket.io' )( http );
	// let socket;

	io.on( 'connection',  async ( socket ) => {
		console.log( 'a user connected' );
		// // console.log( 'currentSession', currentSession );

		// // Need to implement Redis session database to remove this kind of
		// // validations
		// if ( !currentSession ) {
		// 	return;
		// }

		// const user = await userLoggedIn( currentSession );

		// if ( !user ) {
		// 	console.log( 'user', user );
		// 	return;
		// }

		// // Get the only necessary data to store
		// const {
		// 	requestsSent, requestsReceived, contacts, __v, ...userData
		// } = user.toObject();

		// connectedUsers.push( {
		// 	id: socket.id,
		// 	user: userData
		// } );

		// // socket = skt;

		// // io.emit( 'chat user connected', user._id );
		// // notify users about a new user connected
		// socket.broadcast.emit( 'chat user connected', userData );
		// // return an array of connected users' ids
		// socket.emit(
		// 	'chat users connected',
		// 	connectedUsers.map( ( {user} ) => user )
		// );
		// // io.emit( 'chat message', 'hello from socket.io' );

		socket.on( 'client join', async user => {
			// TODO: implement security based on current user session
			// TODO: implement error when user is not provided
			if ( !user ) {
				console.log( 'user', user );
				return;
			}

			// Get the only necessary data to store
			const {
				requestsSent, requestsReceived, contacts, __v, ...userData
			} = user;

			connectedUsers.push( {
				id: socket.id,
				user: userData
			} );

			// socket = skt;

			// io.emit( 'chat user connected', user._id );
			// notify users about a new user connected
			socket.broadcast.emit( 'chat user connected', userData );
			// return an array of connected users' ids
			socket.emit(
				'chat users connected',
				connectedUsers.map( ( { user } ) => user )
			);
			// io.emit( 'chat message', 'hello from socket.io' );
		} );
		socket.on( 'disconnect', () => {
			console.log( 'user disconnected' );

			let user =
				connectedUsers.find( user => user.id === socket.id );

			if ( !user ) {
				console.log( 'user', user );
				return;
			}

			( { user } = user );

			// Re-setting connected users
			connectedUsers =
				connectedUsers.filter( user => user.id !== socket.id );

			// notify users about the disconnected user
			io.emit( 'chat user disconnected', user );
		} );
		socket.on( 'client message', async payload => {
			console.log( 'client sent message', payload );
			// TODO: handle error when bad payload provided
			const {
				conversationId,
				message: payloadMessage,
				conversationType
			} = payload;
			const message = new MessageModel( {
				message: payloadMessage,
				createdAt: moment().seconds(0).milliseconds(0).toISOString()
			} );
			let conversation = await ConversationModel.findById( conversationId );

			await ConversationModel.findByIdAndUpdate(
				conversationId,
				{
					$set: {
						messages: [
							...conversation.messages,
							message
						]
					}
				}
			);
			// socket.emit( 'chat message', message );
			// socket.broadcast.emit( 'chat message', message );
			// io.emit( 'chat message', message );
			// console.log( 'message', message );
			// console.log( 'custom object', { ...message.toObject(), conversationId } );
			console.log( 'data to send to client:', {
					...message.toObject(),
					conversationId,
					conversationType
				} );
			io
				.to( conversationId )
					// .emit( 'chat message', { ...message.toObject(), conversationId } );
					.emit(
						'chat message',
						{
							...message.toObject(),
							conversationId,
							conversationType
						}
					);
		} );
		socket.on( 'client join groups', async () => {
			console.log( 'trying to groups' );
			const userData =
				connectedUsers.find( user => user.id === socket.id );

			if ( !userData ) {
				console.log( 'could not join' );
				console.log( 'userData', userData );
				return callback( `could not join, "user data": ${ userData }` );
			}

			// query full user, since "connectedUsers" has just a part
			// of each user in order to save memory
			let { user } = userData;

			user = ( await UserModel.findById( user._id ) ).toObject();

			// TODO: find out how to get rid of so many validations
			if ( !user ) {
				console.log( 'could not join' );
				console.log( 'user', user );
				return callback( `could not join, "user": ${ user }` );
			}

			const groups = await GroupModel.find( {
				_id: {
					$in: user.groups
				}
			} );

			console.log( 'groups', groups );

			if ( !groups ) {
				console.log( 'groups', groups );
				return callback( 'Error fetching the groups' );
			}

			for ( let group of groups ) {
				const conversationId = group.conversationId.toString();
				console.log( 'joining to', conversationId );
				socket.join( conversationId );
			}
		})
		// TODO: separate (right away) join group conversation from normal conversation
		// socket.on( 'client join groups', async ( data, callback ) => {} );
		socket.on( 'client join conversation', async ( data, callback ) => {
			console.log( 'trying to join chat' );
			console.log( 'data', data );
			const { conversationId, conversationType } = data;
			console.log( 'conversationId', conversationId );

			const userData =
				connectedUsers.find( user => user.id === socket.id );

			if ( !userData ) {
				console.log( 'could not join' );
				console.log( 'userData', userData );
				return callback( `could not join, "user data": ${ userData }` );
			}

			// query full user, since "connectedUsers" has just a part
			// of each user in order to save memory
			let { user } = userData;

			user = ( await UserModel.findById( user._id ) ).toObject();

			// TODO: find out how to get rid of so many validations
			if ( !user ) {
				console.log( 'could not join' );
				console.log( 'user', user );
				return callback( `could not join, "user": ${ user }` );
			}

			console.log( 'conversationType', conversationType );

			// TODO: remove the concep of typeConversation
			// TODO: remove all the logic for group conversation
			switch ( conversationType ) {
				case 'group':
					// const groupConversationId =
					// 	user.groups.find(
					// 		groupConversationId => {
					// 			console.log( 'groupConversationId', groupConversationId );
					// 			return groupConversationId.toString() === conversationId;
					// 		}
					// 	);

					// if ( !groupConversationId ) {
					// 	console.log( 'groupConversationId', groupConversationId );
					// 	return callback( 'Unauthorized' );
					// }
					break;
				case 'conversation':
					const contact = user.contacts.find(
						contact => contact.conversationId.toString() === conversationId
					);

					if ( !contact ) {
						console.log( 'contact', contact );
						return callback( 'Unauthorized' );
					}
					break;
				default:
					return callback(
						`Unsupported conversation type provided: ${ conversationType}`
					);
			}

			console.log( 'joining to', conversationId );
			socket.join( conversationId );
			// socket.emit( conversationId );
			callback();
		} );
	} );
	http.listen(
		port,
		() => console.log( `******* Listening on port "${ port }"` )
	);
} );