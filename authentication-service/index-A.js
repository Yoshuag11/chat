const express = require( 'express' );
const cookieParser = require( 'cookie-parser' );
const session = require( 'express-session' );
const port = 3002;
const app = express();
const SECRET = 'JWT_SECRET';

app.use( express.json() );
app.use( express.urlencoded( { extended: true } ) );
app.use( cookieParser( SECRET ) );
app.use( session( {
	name: 'COOKIE_NAME',
	secret: SECRET,
	saveUninitialized: false,
	resave: false,
	cookie: {
		maxAge: 2 * 60 * 60 * 1000
	}
} ) );
// routes
app.get( '/', ( req, res ) => {
	console.log( 'req.session', req.session );
	console.log( 'res.session', res.session );
	console.log( 'req.cookies', req.cookies );
	res.cookie( 'dan cookie', 'hello world', { maxAge: 1000 * 60 * 60 * 2 } );
	// res.cookie( 'other cookie', 'other hello world', { maxAge: 1000 * 60 * 60 * 2 } );
	req.session.authorized = true;
	res.clearCookie();
	res.send( 'Hello world!' );
})
app.post( '/authenticate', ( req, res ) => {
} );
// TODO register new user service
app.post( '/register', () => {} );
app.listen(
	port, () => console.log( `Listening on port "${ port }"` ) );