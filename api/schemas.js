const mongoose = require( 'mongoose' );
const ObjectId = mongoose.Schema.Types.ObjectId	;
const requestSchema = new mongoose.Schema( {
	from: {
		email: String,
		username: String,
		userId: ObjectId,
	},
	status: String,
	to: {
		email: String,
		userId: ObjectId,
		username: String
	}
} );
const contactSchema = new mongoose.Schema(
	{
		username: String,
		userId: ObjectId,
		conversationId: ObjectId
	},
	{
		_id: false
	}
);
const groupParticipantSchema = new mongoose.Schema(
	{
		username: String,
		userId: ObjectId,
		joinedAt: Date
	},
	{
		_id: false
	}
);
const groupSchema = new mongoose.Schema( {
	name: String,
	conversationId: ObjectId,
	participants: [ groupParticipantSchema ]
} );
// const groupSchema = new mongoose.Schema(
// 	{
// 		name: String,
// 		conversationId: ObjectId,
// 		participants: [ groupParticipantSchema ]
// 	},
// 	{
// 		_id: false
// 	}
// );
const userRequestSchema = new mongoose.Schema(
	{
		userId: ObjectId,
		requestId: ObjectId,
		email: String,
		username: String
	},
	{
		_id: false
	}
);
const messageScheme = new mongoose.Schema( {
	message: String,
	createdAt: Date
} );
const userSchema = new mongoose.Schema( {
	email: String,
	username: String,
	// status: String,
	requestsSent: [ userRequestSchema ],
	requestsReceived: [ userRequestSchema ],
	contacts: [ contactSchema ],
	groups: [ ObjectId ]
} );
const conversationSchema = new mongoose.Schema( {
	type: {
		type: String,
		default: 'conversations',
		enum: [ 'conversation', 'group' ]
	},
	messages: [ messageScheme ]
} );

module.exports = {
	userSchema,
	contactSchema,
	requestSchema,
	conversationSchema,
	messageScheme,
	groupSchema,
	groupParticipantSchema
}