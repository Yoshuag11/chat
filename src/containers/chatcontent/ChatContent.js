import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import StatusHeader from '../../components/status-header/StatusHeader';
import Conversation from '../conversation/Conversation';
import Modal from '../../components/modal/Modal';
import {
	joinConversation,
	asyncLoadMessages,
	newMessageRead
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
			match: { params: { id: conversationId } }
		} = this.props;

		joinConversation( conversationId );
		console.log( 'loading messages asynchronously' );
		asyncLoadMessages( conversationId );
		newMessageRead( conversationId );

		// if (
		// 	!conversationsJoined.find(
		// 		conversation => conversation === conversationId )
		// ) {
		// 	console.log( 'about to join' );
			joinConversation( conversationId );
			// console.log( 'loading messages asynchronously' );
			// asyncLoadMessages( conversationId );
		// 	this.setState( {
		// 		conversationsJoined: [ ...conversationsJoined, conversationId ]
		// 	} )
		// };
	}
	componentDidUpdate () {
		this.handleJoinChat();
	}
	componentDidMount () {
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
			match: { params: { id: conversationId } }
		} = this.props;
		const { handleToggleModal, state } = this;
		return (
			<>
				<Modal
					handleModal={ handleToggleModal }
					showModal={ state.showModal }
				/>
				<StatusHeader
					newRequest={ newRequest}
					handleModal={ handleToggleModal }
					username={
						( contacts.find( contact =>
								contact.conversationId === conversationId ) ).username
					}
					requests={ requests }
				/>
				<Conversation conversationId={ conversationId } />
			</>
		);
	}
}

ChatContent.propTypes = {
	contacts: PropTypes.array.isRequired,
	requests: PropTypes.array.isRequired,
	newRequest: PropTypes.bool.isRequired,
	joinConversation: PropTypes.func.isRequired,
	asyncLoadMessages: PropTypes.func.isRequired,
	newMessageRead: PropTypes.func.isRequired
};

const mapStateToProps = state => ( {
	contacts: state.user.contacts,
	requests: state.user.requestsReceived,
	newRequest: state.newRequest,
} );

export default connect(
	mapStateToProps,
	{
		joinConversation,
		asyncLoadMessages,
		newMessageRead
	}
)( ChatContent );