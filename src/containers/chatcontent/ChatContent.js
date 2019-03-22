import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import StatusHeader from '../../components/status-header/StatusHeader';
import Conversation from '../conversation/Conversation';
import Modal from '../../components/modal/Modal';
import {
	joinConversation,
	asyncLoadMessages,
	newMessageRead,
	asyncRequest
} from '../../actions';

class ChatContent extends React.Component {
	constructor ( props ) {
		super( props );

		this.state = {
			showModal: false,
			conversationsJoined: []
		};
		this.handleToggleModal = this.handleToggleModal.bind( this );
		this.handleJoinChat = this.handleJoinChat.bind( this );
	}
	handleJoinChat () {
		// const conversationsJoined = this.state.conversationsJoined;
		const {
			joinConversation,
			asyncLoadMessages,
			newMessageRead,
			match: {
				params: {
					conversationId,
					conversationType
				}
			}
		} = this.props;

		if ( conversationType === 'conversation' ) {
			console.log( 'about to call joinConversation' );
			joinConversation( { conversationId } );
		}

		console.log( 'loading messages asynchronously' );
		asyncLoadMessages( conversationId );
		newMessageRead( { conversationId, conversationType } );

		// if (
		// 	!conversationsJoined.find(
		// 		conversation => conversation === conversationId )
		// ) {
		// 	console.log( 'about to join' );
			// joinConversation( conversationId );
			// console.log( 'loading messages asynchronously' );
			// asyncLoadMessages( conversationId );
		// 	this.setState( {
		// 		conversationsJoined: [ ...conversationsJoined, conversationId ]
		// 	} )
		// };
	}
	componentDidUpdate ( prevProps ) {
		console.log( 'componentDidUpdate' );
		const {
			match: {
				params: {
					conversationId: prevConversationId
				}
			}
		} = prevProps;
		const {
			newMessageRead,
			match: {
				params: {
					conversationId,
					conversationType
				}
			}
		} = this.props;

		if ( conversationId === prevConversationId ) {
			newMessageRead( { conversationId, conversationType } );
		} else {
			this.handleJoinChat();
		}
	}
	componentDidMount () {
		console.log( 'componentDidMount' );
		this.handleJoinChat();
	}
	handleToggleModal () {
		this.setState( {
			showModal: !this.state.showModal
		} );
	}
	render () {
		const {
			newRequest,
			contacts,
			requests,
			groups,
			match: {
				params: {
					conversationId,
					conversationType
				}
			},
			asyncRequest
		} = this.props;
		const handleSubmit = e => {
			asyncRequest( this.emailInput.value );
		}
		const { handleToggleModal, state } = this;
		const username = conversationType === 'conversation'
			? ( contacts.find( contact =>
				contact.conversationId === conversationId ) ).username
			: ( groups.find( group => group.conversationId === conversationId )
				.participants.map( participant => participant.username )
			).join( ', ');
			console.log( 'username', username );
		return (
			<>
				<Modal
					handleModal={ handleToggleModal }
					showModal={ state.showModal }
					title='Add User'
					submitButton='Send Invitation'
					submitHandler={ handleSubmit }
				>
					<form>
						<label>user's email to send invitation</label>
						&nbsp;
						<input
							type='email'
							required
							ref={ input => {
								this.emailInput = input;
							} }
						/>
					</form>
				</Modal>
				<StatusHeader
					newRequest={ newRequest}
					handleModal={ handleToggleModal }
					username={ username }
					requests={ requests }
				/>
				<Conversation
					conversationType={ conversationType }
					conversationId={ conversationId }
				/>
			</>
		);
	}
}

ChatContent.propTypes = {
	contacts: PropTypes.array.isRequired,
	requests: PropTypes.array.isRequired,
	groups: PropTypes.array.isRequired,
	newRequest: PropTypes.bool.isRequired,
	joinConversation: PropTypes.func.isRequired,
	asyncLoadMessages: PropTypes.func.isRequired,
	newMessageRead: PropTypes.func.isRequired,
	asyncRequest: PropTypes.func.isRequired
};

const mapStateToProps = state => ( {
	contacts: state.user.contacts,
	groups: state.user.groups,
	requests: state.user.requestsReceived,
	newRequest: state.newRequest,
} );

export default connect(
	mapStateToProps,
	{
		joinConversation,
		asyncLoadMessages,
		newMessageRead,
		asyncRequest
	}
)( ChatContent );