import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import 'moment/locale/es';
import {
	createMessage
	// joinConversation
} from '../../actions';
import { connect } from 'react-redux';
import MessageComposer from '../../components/message-composer/MessageComposer';


console.log( 'moment.locale()', moment.locale() );

moment.locale( 'es' );
console.log( 'moment.locale()', moment.locale() );

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
			dictionary
		} = this.props;
		// console.log( 'this.props', this.props );
		return (
			<>
				<ul className='messages-container'>
					{ messages.map( ( message, index ) => {
						const { conversationId: messageConversationId } = message;
						if (
							!messageConversationId ||
							messageConversationId === conversationId
						) {
							return (
								<li key={ index } className='clearfix'>
									<p className='float-left'>
										{ message.message }
									</p>
									{ message.createdAt
										? (
											<p
												className='float-right text-muted'>
												{/* { moment.utc( message.createdAt ).locale().format() } */}
												{ moment( message.createdAt ).fromNow() }
											</p>
										)
										: '' }
								</li>
							);
						} else {
							// this happens when you receive a new message that does
							// not belong to current conversation: whenever a new message
							// is received, it is added to current list of messages,
							// it is not big deal since when user changes from chat,
							// the whole conversation is loaded, which will contain the
							// the whole conversation up-to-date
							// console.log( 'requirements not fulfilled' );
							// console.log( 'message', message );
							// console.log( 'messageConversationId', messageConversationId );
							// console.log( 'conversationId', conversationId );
							return '';
						}
					 } ) }
				</ul>
				<MessageComposer
					dictionary={ dictionary }
					conversationType={ conversationType }
					createMessage={ createMessage }
					conversationId={ conversationId }
				/>
			</>
		);
	}
}

const mapStateToProps = state => ( {
	messages: state.messages,
	dictionary: state.dictionary.messageComposer
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