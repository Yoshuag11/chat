import React from 'react';
import PropTypes from 'prop-types';
import {
	createMessage
	// joinConversation
} from '../../actions';
import { connect } from 'react-redux';
import MessageComposer from '../../components/message-composer/MessageComposer';

class Conversation extends React.Component {
	// componentDidMount () {
	// 	const {
	// 		joinConversation,
	// 		match: { params: { id: conversationId } }
	// 	} = this.props;
	// 	joinConversation( conversationId );
	// 	console.log( 'conversationId', conversationId );
	// }
	render () {
		const {
			createMessage,
			// match: { params: { id: conversationId } },
			conversationId,
			conversationType,
			messages,
		} = this.props;
		console.log( 'this.props', this.props );
		return (
			<>
				<ul className='messages-container'>
					{ messages.map( ( message, index ) => {
						const { conversationId: messageConversationId } = message;
						if (
							!messageConversationId ||
							messageConversationId === conversationId
						) {
							return <li key={ index }>{ message.message }</li>;
						} else {
							// this happens when you receive a new message that does
							// not belong to current conversation: whenever a new message
							// is received, it is added to current list of messages,
							// it is not big deal since when user changes from chat,
							// the whole conversation is loaded, which will contain the
							// the whole conversation up-to-date
							console.log( 'requirements not fulfilled' );
							console.log( 'message', message );
							console.log( 'messageConversationId', messageConversationId );
							console.log( 'conversationId', conversationId );
							return '';
						}
					 } ) }
				</ul>
				<MessageComposer
					conversationType={ conversationType }
					createMessage={ createMessage }
					conversationId={ conversationId }
				/>
			</>
		);
	}
}

const mapStateToProps = state => ( {
	messages: state.messages
} );

Conversation.propTypes = {
	createMessage: PropTypes.func.isRequired,
	messages: PropTypes.array.isRequired,
	conversationId: PropTypes.string.isRequired,
	conversationType: PropTypes.string.isRequired
	// joinConversation: PropTypes.func.isRequired
}

export default connect(
	mapStateToProps,
	{
		createMessage
		// joinConversation
	}
)( Conversation );