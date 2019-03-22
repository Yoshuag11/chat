import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Modal from '../modal/Modal';
// import { withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Form } from 'react-bootstrap';
// import { nullOrObject } from '../../utils';
import {
	// newMessageRead
	createGroupConversation
} from '../../actions';
import { connect } from 'react-redux';
import './Sidebar.css';

class Sidebar extends React.Component {
	constructor ( props ) {
		super( props );

		this.state = {
			users: [],
			name: ''
		};
		this.handleChange = this.handleChange.bind( this );
		this.handleSubmit = this.handleSubmit.bind( this );
	}
	handleChange ( event ) {
		const target = event.target;

		if ( target.type === 'text' ) {
			this.setState( { name: target.value } );
		} else {
			const users = [];
			const { selectedOptions } = target;
	
			for ( let option of selectedOptions ) {
				users.push( option.value );
			}
	
			this.setState( { users } );
		}
	}
	handleSubmit ( e ) {
		console.log( 'create group conversation' );
		this.props.createGroupConversation( this.state );
		// Close the modal
		this.props.handleModal();
	}
	render () {
		const {
			username,
			contacts,
			groups,
			// newMessage,
			handleModal,
			showModal,
			match
		} = this.props;
		const {
			conversationId = null
		} = match ? match.params : {};
		console.log( 'match', match );
		console.log( 'conversationId', conversationId );
		return (
			<nav
				className='col-sm-3 d-done d-sm-block bg-primary order-sm-first sidebar'
			>
				<Modal
					handleModal={ handleModal }
					showModal={ showModal }
					title='New Group Conversation'
					submitButton='Create'
					submitHandler={ this.handleSubmit }
				>
					<Form>
						<Form.Group controlId='sidebarModalGroupNameInput'>
							<Form.Label>Group name</Form.Label>
							<Form.Control
								value={ this.state.name }
								onChange={ this.handleChange }
								type='text'
							/>
						</Form.Group>
						<Form.Group controlId='sidebarModalUserSelector'>
							<Form.Label>Select users</Form.Label>
							<Form.Control
								value={ this.state.users }
								as='select'
								multiple
								onChange={ this.handleChange }
							>
								{ contacts.map( ( contact, index ) => (
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
				</Modal>
				<div id='sidebar' className='sidebar-sticky'>
					<h1>{ username }</h1>
					<h4>Contact List</h4>
					<ul className='contact-list'>
						{ contacts.map( ( contact, index ) => (
							<li key={ index }>
								<span
									className={ contact.status === 'connected'
									? 'text-success'
									: 'text-danger' }
								>
									<FontAwesomeIcon icon='circle' />
								</span>
								&nbsp;
								<Link
									// className='bg-success'
									to={ `/conversation/${ contact.conversationId }` }
								>
									{ contact.username }
								</Link>
								{ contact.newMessage &&
								(
									conversationId === null ||
									conversationId !== contact.conversationId
								)
									// conversationId && conversationId === contact.conversationId
									? <h3 className='d-inline-block'>
									<span className='badge text-warning'>*</span>
								</h3> : <></>
								}
							</li>
						) ) }
					</ul>
					<h4>
						Group Conversations
						&nbsp;
						<button
							onClick={ handleModal }
							className='btn btn-primary'
						>
							<FontAwesomeIcon color='green' icon='plus' />
						</button>
					</h4>
					<ul className='contact-list'>
						{ groups.map( ( group, index ) => (
							<li key={ index }>
								<Link
									to={ `/group/${ group.conversationId }` }
								>
									{ group.name }
								</Link>
								{ group.newMessage &&
								(
									conversationId === null ||
									conversationId !== group.conversationId
								) 
									? (
										<h3 className='d-inline-block'>
											<span className='badge text-warning'>*</span>
										</h3>
									)
									: <></>
								}
							</li>
						) ) }
					</ul>
					<ul className='group-list'></ul>
				</div>
			</nav>
		);
	}
}

// const Sidebar = props => {
// 	const {
// 		username, contacts,
// 		// newMessage,
// 		handleModal,
// 		showModal,
// 		match
// 	} = props;
// 	const conversationId = match ? match.params.id : null;
// 	// const conversationId =
// 	// 	( match === null && newMessage ) ||
// 	// 	( match && newMessage && match.params.id !== newMessage.conversationId )
// 	// 	? newMessage.conversationId
// 	// 	: null;
// 	// if ( conversationId ) {
// 	// 	props.newMessageRead( conversationId );
// 	// }
// 	const handleSubmit = e => { console.log( 'test' ) }; 
// 	return (
// 	<nav
// 		// className='col-md-2 d-done d-md-block bg-primary sidebar'
// 		// className='col-ms-2 bg-primary sidebar'
// 		className='col-sm-3 d-done d-sm-block bg-primary order-sm-first sidebar'
// 	>
// 		<Modal
// 			handleModal={ handleModal }
// 			showModal={ showModal }
// 			title='New Group Conversation'
// 			submitButton='Create'
// 			submitHandler={ handleSubmit }
// 		>
// 			<Form>
// 				<Form.Group controlId='sidebarModalUserSelector'>
// 					<Form.Label>Select users</Form.Label>
// 					<Form.Control as='select' multiple>
// 						{ contacts.map( ( contact, index ) => (
// 						<option
// 							key={ index }
// 							value={ contact.userId }
// 						>
// 							{ contact.username }
// 						</option>
// 						) ) }
// 					</Form.Control>
// 				</Form.Group>
// 			</Form>
// 			{/* <form>
// 				<label
// 					htmlFor='sidebarModalUserSelector'
// 				>
// 					Select User
// 				</label>
// 				<select
// 					id='sidebarModalUserSelector'
// 					multiple
// 				>
// 					{ contacts.map( ( contact, index ) => (
// 					<option
// 						key={ index }
// 						value={ contact.userId }
// 					>
// 						{ contact.username }
// 					</option>
// 					) ) }
// 				</select>
// 			</form> */}
// 		</Modal>
// 		<div id='sidebar' className='sidebar-sticky'>
// 			<h1>{ username }</h1>
// 			<h4>Contact List</h4>
// 			<ul className='contact-list'>
// 				{ contacts.map( ( contact, index ) => (
// 					<li key={ index }>
// 						<span
// 							className={ contact.status === 'connected'
// 							? 'text-success'
// 							: 'text-danger' }
// 						>
// 							<FontAwesomeIcon icon='circle' />
// 						</span>
// 						&nbsp;
// 						<Link
// 							// className='bg-success'
// 							to={ `/conversation/${ contact.conversationId }` }
// 						>
// 							{ contact.username }
// 						</Link>
// 						{ (
// 							conversationId === null ||
// 							conversationId !== contact.conversationId
// 						) && contact.newMessage
// 							// conversationId && conversationId === contact.conversationId
// 							? <h3 className='d-inline-block'>
// 							<span className='badge text-warning'>*</span>
// 						</h3> : <></>
// 						}
// 					</li>
// 				) ) }
// 			</ul>
// 			<h4>
// 				Group Conversations
// 				&nbsp;
// 				<button
// 					onClick={ handleModal }
// 					className='btn btn-primary'
// 					// the "to" property here is doing nothing, it just 
// 					// href='#'
// 				>
// 					<FontAwesomeIcon color='green' icon='plus' />
// 				</button>
// 			</h4>
// 			<ul className='group-list'></ul>
// 		</div>
// 	</nav>
// ) };

Sidebar.propTypes = {
	contacts: PropTypes.array.isRequired,
	groups: PropTypes.array.isRequired,
	handleModal: PropTypes.func.isRequired,
	showModal: PropTypes.bool.isRequired,
	createGroupConversation: PropTypes.func.isRequired
	// newMessageRead: PropTypes.array.isRequired
	// newMessage: nullOrObject
};

// export default withRouter( Sidebar );
// export default Sidebar;
export default connect(
	null,
	{
		createGroupConversation
		// newMessageRead
	}
)( Sidebar );