import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import StatusHeader from '../../components/status-header/StatusHeader';
import { Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Conversation from '../conversation/Conversation';
import Modal from '../../components/modal/Modal';
import {
	joinConversation,
	asyncLoadMessages,
	newMessageRead,
	asyncRequest,
	addParticipants
} from '../../actions';

class ChatContent extends React.Component {
	constructor ( props ) {
		super( props );

		this.state = {
			showModal: false,
			conversationsJoined: [],
			participants: []
		};
		this.handleToggleModal = this.handleToggleModal.bind( this );
		this.handleJoinChat = this.handleJoinChat.bind( this );
		this.handleSubmit = this.handleSubmit.bind( this );
		this.handleChange = this.handleChange.bind( this );
		this.handleGetConversationData = this.handleGetConversationData.bind( this );
	}
	handleGetConversationData () {
		const {
			match: {
				params: {
					conversationId,
					conversationType
				}
			}
		} = this.props;
		return { conversationId, conversationType };
	}
	handleChange ( event ) {
		const participants = [];
			const { selectedOptions } = event.target;
	
			for ( let option of selectedOptions ) {
				participants.push( option.value );
			}

			this.setState( { participants } );
	}
	// handleSubmit ( event ) {
	// 	this.asyncRequest( this.emailInput.value );
	// }
	handleSubmit ( event ) {
		const { conversationId } = this.handleGetConversationData();
		const group = this.props.groups.find(
				group => group.conversationId === conversationId
			);

		const payload = {
			groupId: group._id,
			participants: this.state.participants
		};

		console.log( 'payload', payload );
		this.props.addParticipants( payload );
	}
	handleJoinChat () {
		// const conversationsJoined = this.state.conversationsJoined;
		const {
			joinConversation,
			asyncLoadMessages,
			newMessageRead
		} = this.props;
		const {
			conversationId, conversationType
		} = this.handleGetConversationData();

		if ( conversationType === 'conversation' ) {
			console.log( 'about to call joinConversation' );
			joinConversation( { conversationId, conversationType: 'conversation' } );
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
			newMessageRead
		} = this.props;
		const {
			conversationId, conversationType
		} = this.handleGetConversationData();

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
			// newRequest,
			contacts,
			// requests,
			groups,
			dictionary
		} = this.props;
		const {
			modal,
			statusHeader
		} = dictionary;
		const {
			conversationId, conversationType
		} = this.handleGetConversationData();
		const {
			handleToggleModal,
			state,
			handleSubmit
		} = this;
		const group = conversationType === 'conversation'
			? null
			: groups.find( group => group.conversationId === conversationId );
		const title = ( group && group.name ) ||
			( contacts.find(
				contact => contact.conversationId === conversationId
			) ).username;
		// const title = conversationType === 'conversation'
		// 	? ( contacts.find( contact =>
		// 		contact.conversationId === conversationId ) ).username
		// 	: groups.find(
		// 		group => group.conversationId === conversationId
		// 	).name;
		let availableContactsToAdd = [ ...contacts ];
		const participants = group
			? ( group.participants.map(
					participant => {
						const { username } = participant;

						availableContactsToAdd =
							availableContactsToAdd.filter(
								contact => contact.username !== username
							);
						return username;
					} )
				).join( ', ')
			: null;
		// const participants = conversationType === 'conversation'
		// 	? null
		// 	: ( groups.find(
		// 			group => group.conversationId === conversationId
		// 		).participants.map( participant => participant.username )
		// 	).join( ', ');
		// console.log( 'title', title );
		// console.log( 'participants', participants );
		return (
			<>
				<Modal
					handleModal={ handleToggleModal }
					showModal={ state.showModal }
					title={ modal.title }
					// title='Add participants'
					submitButton={ modal.submitButton }
					// submitButton='Add'
					cancelButton={ modal.cancelButton }
					// submitButton='Send Invitation'
					submitHandler={ handleSubmit }
				>
					<Form>
						<Form.Group controlId='sidebarModalUserSelector'>
							<Form.Label>{ modal.participantsLabel }</Form.Label>
							{/* <Form.Label>Select participants</Form.Label> */}
							<Form.Control
								value={ this.state.users }
								as='select'
								multiple
								onChange={ this.handleChange }
							>
								{ availableContactsToAdd.map( ( contact, index ) => (
									<option
										key={ index }
										value={ contact.userId }
									>
										{ contact.username }
									</option>
								) ) }
							</Form.Control>
						</Form.Group>
					</Form>
					{/* <form>
						<label>user's email to send invitation</label>
						&nbsp;
						<input
							type='email'
							required
							ref={ input => {
								this.emailInput = input;
							} }
						/>
					</form> */}
				</Modal>
				<StatusHeader
					// newRequest={ newRequest}
					// handleModal={ handleToggleModal }
					// username={ username }
					// requests={ requests }
					// conversationType={ conversationType }
					tooltipText={ statusHeader.tooltipLogoutButton }
				>
					<h1>
						{ title }
						&nbsp;
						{ conversationType === 'group'
							? (
								<button
									className='btn btn-primary'
									to='/add_contact'
									onClick={ handleToggleModal }
								>
									{ statusHeader.addParticipantsButton }
									{/* Add participants */}
									<FontAwesomeIcon
										className='fa-pull-right'
										size='lg'
										// icon={ [ 'fab', 'react' ] }
										icon='user-plus'
									/>
								</button>
							)
							: '' }
					</h1>
					{ participants
						? (
							<h3>{ statusHeader.participantsTag }: { participants }</h3>
							// <h3>Participants: { participants }</h3>
						)
						: '' }
				</StatusHeader>
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
	// requests: PropTypes.array.isRequired,
	groups: PropTypes.array.isRequired,
	// newRequest: PropTypes.bool.isRequired,
	joinConversation: PropTypes.func.isRequired,
	asyncLoadMessages: PropTypes.func.isRequired,
	newMessageRead: PropTypes.func.isRequired,
	asyncRequest: PropTypes.func.isRequired,
	addParticipants: PropTypes.func.isRequired,
	dictionary: PropTypes.object.isRequired
};

const mapStateToProps = state => ( {
	contacts: state.user.contacts,
	groups: state.groups,
	dictionary: state.dictionary.chatContent
	// requests: state.user.requestsReceived
	// newRequest: state.newRequest,
} );

export default connect(
	mapStateToProps,
	{
		joinConversation,
		asyncLoadMessages,
		newMessageRead,
		asyncRequest,
		addParticipants
	}
)( ChatContent );