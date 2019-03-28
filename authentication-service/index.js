const express = require( 'express' );
const mongoose = require( 'mongoose' );
const port = 3002;
// const dbHost = '192.168.1.67';
const dbHost = 'localhost';

mongoose.connect(
	`mongodb://hector:hector@${ dbHost }/AuthService?authSource=admin`,
	// 'mongodb://hector:hector@localhost/AuthService?authSource=admin',
	{ useNewUrlParser: true }
);

const db = mongoose.connection;
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

db.once( 'open', function () {
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
	app.post( '/authenticate', ( req, res ) => {
		res.setHeader( 'Content-type', 'application/json' );

		const { email, password: pwd } = req.body;

		if ( email === undefined || pwd === undefined ) {
			return errorResponse( res );
		}

		UserModel.findOne(
			{
				email,
				pwd
			},
			( err, usr ) => {
				if ( err || usr === null ) {
					errorResponse( res );
				} else {
					successResponse( usr, res ); // TODO return user ID
				}
			}
		);
	} );
	app.post( '/register', ( req, res ) => {
		const { email, password: pwd } = req.body;

		if ( email === undefined || pwd === undefined ) {
			return errorResponse( res );
		}

		const user = new UserModel( { email, pwd } );

		user.save( ( err, usr ) => {
			if ( err ) {
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
} );