import React from 'react';
// import StatusHeader from '../../components/status-header/StatusHeader';
// import MessageComposer from '../../components/message-composer/MessageComposer';
import {
	// createMessage,
	// joinConversation,
	// asyncLoadMessages,
	startChannel
	// asyncFetchRequests
} from '../../actions';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { Route } from 'react-router-dom';
// import Modal from '../../components/modal/Modal';
// import Conversation from '../conversation/Conversation';
import Loading from '../../components/loading/Loading';
import './Chat.css';

class Chat extends React.Component {
	constructor ( props ) {
		super( props );

		// Initialize the socket channel
		console.log( 'about to initialize channel' );
		this.props.startChannel();

		// this.state = {
		// 	showModal: false,
		// 	conversationsJoined: []
		// };

		// this.handleToggleModal = this.handleToggleModal.bind( this );
	}
	// handleToggleModal () {
	// 	this.setState( {
	// 		showModal: !this.state.showModal
	// 	} );
	// }
	// componentDidUpdate () {
	// 	console.log( 'componentDidUpdate' );
	// 	// const { match: { params: { id: prevConversationId } } } = prevProps;
	// 	const {
	// 		joinConversation,
	// 		asyncLoadMessages,
	// 		match: { params: { id: conversationId } }
	// 	} = this.props;
	// 	const conversationsJoined = this.state.conversationsJoined;

	// 	if (
	// 		!conversationsJoined.find(
	// 			conversation => conversation === conversationId )
	// 	) {
	// 		console.log( 'about to join' );
	// 		joinConversation( conversationId );
	// 		console.log( 'loading messages asynchronously' );
	// 		asyncLoadMessages( conversationId );
	// 		this.setState( {
	// 			conversationsJoined: [ ...conversationsJoined, conversationId ]
	// 		} );
	// 	}
	// }
	componentDidMount () {
		console.log( 'componentDidMount' );
		// this.props.startChannel();
		// this.props.asyncFetchRequests();

		// const {
		// 	joinConversation,
		// 	asyncLoadMessages,
		// 	socket,
		// 	match: { params: { id: conversationId } }
		// } = this.props;

		// if ( socket ) {
		// 	console.log( 'conversationId', conversationId );
		// 	console.log( 'about to join' );
		// 	joinConversation( conversationId );
		// 	console.log( 'loading messages asynchronously' );
		// 	asyncLoadMessages( conversationId );
		// }
	}
	render () {
		const {
			// createMessage,
			// match: { params: { id: conversationId } },
			// messages,
			// username,
			// contacts,
			children,
			socket
			// requests,
			// newRequest
		} = this.props;
		console.log( '********* Chat render *********' );
		console.log( 'socket', socket );
		// const { handleToggleModal } = this;
		if ( !socket ) {
			return <Loading />;
		}
		return (
			<section
				// className='col-md-9 ml-sm-auto col-lg-10 px-4'
				id='chat'
				// className='col-sm-10 ml-sm-auto px-4'
				// className='col-sm-8 ml-sm-auto px-4'
				className='col-sm-8 px-4'
			>
				{/* <Modal
					handleModal={ handleToggleModal }
					showModal={ this.state.showModal }
				/> */}
				{/* <StatusHeader
					newRequest={ newRequest}
					// username={ username }
					handleModal={ handleToggleModal }
					username={
						( contacts.find( contact =>
								contact.conversationId === conversationId ) ).username
					}
					requests={ requests }
				/>
				<Conversation conversationId={ conversationId } /> */}
				{ children }
			</section>
		);
	}
}

Chat.propTypes = {
	// messages: PropTypes.array.isRequired,
	// createMessage: PropTypes.func.isRequired,
	startChannel: PropTypes.func.isRequired,
	// username: PropTypes.string.isRequired,
	// contacts: PropTypes.array.isRequired,
	// asyncFetchRequests: PropTypes.func.isRequired,
	// requests: PropTypes.array.isRequired,
	// newRequest: PropTypes.bool.isRequired,
	// joinConversation: PropTypes.func.isRequired,
	// asyncLoadMessages: PropTypes.func.isRequired,
	socket: PropTypes.bool.isRequired
};

const mapStateToProps = state => ( {
	// messages: state.messages,
	// username: state.user.username,
	// contacts: state.user.contacts,
	// requests: state.user.requestsReceived,
	// newRequest: state.newRequest,
	socket: state.socket
} );

export default connect(
	mapStateToProps,
	{
		// createMessage,
		// joinConversation,
		// asyncLoadMessages,
		startChannel
		// asyncFetchRequests
	}
)( Chat );