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
			messages,
		} = this.props;
		return (
			<>
				<ul className='messages-container'>
					{ messages.map( ( message, index ) => (
						<li key={ index }>{ message.message }</li>
					) ) }
				</ul>
				<MessageComposer
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
	// joinConversation: PropTypes.func.isRequired
}

export default connect(
	mapStateToProps,
	{
		createMessage
		// joinConversation
	}
)( Conversation );