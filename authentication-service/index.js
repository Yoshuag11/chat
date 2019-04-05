const express = require( 'express' );
const mongoose = require( 'mongoose' );
const bcrypt = require( 'bcrypt' );
const saltRounds = 10;
const port = 3002;
const dbPort = 27017;
// const dbHost = 'mongo';
// const dbHost = 'danchat_mongo';
// const dbHost = '192.168.1.73';
const dbHost = 'localhost';

const dbConnect = async () => {
	const retries = 5;
	const connect = async retries => {
		try {
			return await mongoose.connect(
				`mongodb://admin:admin@${ dbHost }:${ dbPort }/AuthService?authSource=admin`,
				// 'mongodb://hector:hector@localhost/AuthService?authSource=admin',
				{ useNewUrlParser: true }
			);
		} catch ( error ) {
			console.log( '********* retrie *********', retries );
			console.log( '********* error *********', error.message );

			if ( retries === 0 ) {
				throw new Error( 'Max number of retries reached' );
			}
			return await new Promise( ( resolve, reject ) => {
				setTimeout(
					async () => {
						try {
							resolve( await connect( --retries ) );
						} catch ( error ) {
							reject( error );
						}
					},
					2000
				);
			} );
		}
	}

	try {
		return await connect( retries );
	} catch ( error ) {
		throw error;
	}
};

dbConnect()
	.then( dbresult => {
		const db = dbresult.connection;
		const errorResponse = ( res, message = 'Unauthorized', code = 401 ) => {
			res
				.status( code )
				.send( { message } );
		};
		const successResponse = ( usr, res ) => {
			res.send( {
				userId: usr._id
			} );
		};

		console.log( 'Successfully connected to the database' );

		const userSchema = new mongoose.Schema( {
			email: String,
			pwd: String
		} );
		const UserModel = mongoose.model( 'User', userSchema );
		const app = express();

		app.use( express.json() );
		app.use( express.urlencoded( { extended: true } ) );
		// routes
		app.post( '/authenticate', async ( req, res ) => {
			res.setHeader( 'Content-type', 'application/json' );
	
			const { email, password } = req.body;
	
			if ( email === undefined || password === undefined ) {
				return errorResponse( res );
			}
	
			const user = await UserModel.findOne( { email } );
	
			if ( !user ) {
				return errorResponse( res );
			}
	
			const match = await bcrypt.compare( password, user.pwd );
	
			if ( !match ) {
				return errorResponse( res );
			}
	
			successResponse( user, res ); // TODO return user ID
	
			// UserModel.findOne(
			// 	{
			// 		email,
			// 		pwd
			// 	},
			// 	( err, usr ) => {
			// 		if ( err || usr === null ) {
			// 			errorResponse( res );
			// 		} else {
			// 			successResponse( usr, res ); // TODO return user ID
			// 		}
			// 	}
			// );
		} );
		app.post( '/register', async ( req, res ) => {
			console.log( '********* POST /register *********' );
			const { email, password } = req.body;

			if ( email === undefined || password === undefined ) {
				return errorResponse( res );
			}

			const pwd = await bcrypt.hash( password, saltRounds );
			const user = new UserModel( { email, pwd } );

			user.save( ( err, usr ) => {
				if ( err ) {
					console.log( 'err', err );
					let message;
					let code;

					if ( err.code && err.code === 11000 ) {
						code = 409;
						message = 'Email already registered';
					}

					errorResponse( res, message, code );
				} else {
					successResponse( usr, res );
				}
			} );
		} );
		app.listen(
			port, () => console.log( `Listening on port "${ port }"` ) );
	} )
	.catch( reason => { 
		console.log( reason );
	} );