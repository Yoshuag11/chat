import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Badge } from 'react-bootstrap';
import Modal from '../modal/Modal';
// import { withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Form } from 'react-bootstrap';
// import { nullOrObject } from '../../utils';
import {
	// newMessageRead
	createGroupConversation,
	asyncRequest,
	asyncSetDictionary
} from '../../actions';
import {
	connect
} from 'react-redux';
import './Sidebar.css';

class Sidebar extends React.Component {
	constructor ( props ) {
		super( props );

		this.state = {
			showGroupModal: false,
			showFriendModal: false,
			participants: [],
			name: '',
			value: ''
		};
		this.handleChangeGroupRequest = 
			this.handleChangeGroupRequest.bind( this );
		this.handleChangeFriendRequest =
			this.handleChangeFriendRequest.bind( this );
		this.handleSubmitGroupRequest = this.handleSubmitGroupRequest.bind( this );
		this.handleSubmitFriendRequest = this.handleSubmitFriendRequest.bind( this );
		this.handleToggleFriendModal = this.handleToggleFriendModal.bind( this );
		this.handleToggleGroupModal = this.handleToggleGroupModal.bind( this );
	}
	handleChangeLanguage ( language ) {
		this.props.asyncSetDictionary( language );
	}
	handleToggleFriendModal () {
		this.setState( {
			showFriendModal: !this.state.showFriendModal,
			value: ''
		} );
	}
	handleToggleGroupModal () {
		this.setState( {
			showGroupModal: !this.state.showGroupModal,
			name: '',
			participants: []
		} );
	}
	handleChangeGroupRequest ( event ) {
		const target = event.target;

		if ( target.type === 'text' ) {
			this.setState( { name: event.target.value } );
		} else {
			const participants = [];
			const { selectedOptions } = target;
	
			for ( let option of selectedOptions ) {
				participants.push( option.value );
			}

			this.setState( { participants } );
		}
	}
	handleChangeFriendRequest ( event ) {
		this.setState( { value: event.target.value } );
	}
	handleSubmitFriendRequest ( event ) {
		this.props.asyncRequest( this.state.value );
		// Close the modal
		this.handleToggleFriendModal();
	}
	handleSubmitGroupRequest ( event ) {
		// console.log( 'create group conversation' );
		const { participants, name } = this.state;
		this.props.createGroupConversation( { participants, name } );
		// this.props.createGroupConversation( this.state );
		// Close the modal
		this.handleToggleGroupModal();
	}
	render () {
		const {
			user: {
				username,
				contacts,
				requestsReceived: requests
			},
			groups,
			// newMessage,
			// handleModal,
			// showModal,
			match,
			dictionary,
			newRequest,
			// requests
		} = this.props;
		const {
			conversationId = null
		} = match ? match.params : {};
		const {
			groupModal,
			friendModal,
			languageDropdown
		} = dictionary;
		return (
			<div className='col-sm-5 col-md-4 col-lg-3 order-sm-first bg-primary'>
				{/* <div id='sidebar' className='sidebar-sticky'> */}
				<nav
					// className='col-sm-3 d-done d-sm-block bg-primary order-sm-first sidebar'
					className='navbar navbar-expand-lg navbar-dark'
				>
					<span className='navbar-brand mb-0 h1'>{ username }</span>
					{/* <a className="navbar-brand" href="#">Navbar</a> */}
					{/* <a className='navbar-brand' href='#'>{ username }</a> */}
					{/* <h1 className='d-inline-block'>
						{ username }
					</h1> */}
					<button
						className='navbar-toggler'
						type='button'
						data-toggle='collapse'
						data-target='#navbarNav'
						aria-controls='navbarNav'
						aria-expanded='false'
						aria-label='Toggle navigation'
					>
						<span className='navbar-toggler-icon'></span>
					</button>
					<div
						className='collapse navbar-collapse'
						id='navbarNav'
					>
						<ul className='navbar-nav'>
							<li className='nav-item dropdown'>
								{/* <Badge pill
									data-toggle='dropdown'
									aria-haspopup='true'
									aria-expanded='false'
									variant={
										newRequest
										? 'danger'
										:	requests.length > 0
											? 'light'
											: 'secondary'
									}
								>
									{ requests.length }
								</Badge>
								<div className='dropdown-menu'>
									{ requests.map( ( request, index ) => (
										<a
											key={ index }
											className='dropdown-item'
											href='/'
										>
											{ request.username }
										</a>
									) ) }
								</div> */}
								<button
									// the "to" property here is doing nothing, it just 
									// to='/requests'
									data-toggle='dropdown'
									aria-haspopup='true'
									aria-expanded='false'
									className='btn btn-primary'
									// className="float-right"
								>
									<Badge pill
										variant={
											newRequest
											? 'danger'
											:	requests.length > 0
												? 'light'
												: 'secondary'
										}
									>
										{ requests.length }
									</Badge>
								</button>
								<div className='dropdown-menu'>
									{ requests.map( ( request, index ) => (
										<a
											key={ index }
											className='dropdown-item'
											href='/'
										>
											{ request.username }
										</a>
									) ) }
								</div>
							</li>
							<li className='nav-item dropdown'>
								<button
									className='btn btn-primary dropdown-toggle'
									// className='btn btn-primary dropdown-toggle float-right'
									// href='#'
									id='navbarLanguageDropDown'
									// role="button"
									data-toggle='dropdown'
									aria-haspopup='true'
									aria-expanded='false'
								>
									{ languageDropdown.title }
								</button>
								<div
									className='dropdown-menu'
									aria-labelledby='navbarLanguageDropDown'
								>
									<button
										className='dropdown-item'
										onClick={ this.handleChangeLanguage.bind( this, 'en' ) }
									>
										{ languageDropdown.english }
									</button>
									<button
										className='dropdown-item'
										onClick={ this.handleChangeLanguage.bind( this, 'es' ) }
									>
										{ languageDropdown.spanish }
									</button>
								</div>
							</li>
						</ul>
					</div>
					{/* <button
						className='btn btn-primary dropdown-toggle'
						// className='btn btn-primary dropdown-toggle float-right'
						// href='#'
						id='navbarLanguageDropDown'
						// role="button"
						data-toggle='dropdown'
						aria-haspopup='true'
						aria-expanded='false'
					>
						{ languageDropdown.title }
					</button>
					<div
						className='dropdown-menu'
						aria-labelledby='navbarLanguageDropDown'
					>
						<button className='dropdown-item'>
							{ languageDropdown.english }
						</button>
						<button className='dropdown-item'>
							{ languageDropdown.spanish }
						</button>
					</div> */}
				</nav>
				<Modal
					handleModal={ this.handleToggleGroupModal }
					showModal={ this.state.showGroupModal }
					title={ groupModal.title }
					// title='New Group'
					submitButton={ groupModal.submitButton }
					cancelButton={ groupModal.cancelButton }
					// submitButton='Create'
					submitHandler={ this.handleSubmitGroupRequest }
				>
					<Form>
						<Form.Group controlId='sidebarModalGroupNameInput'>
							<Form.Label>{ groupModal.nameLabel }</Form.Label>
							{/* <Form.Label>Group name</Form.Label> */}
							<Form.Control
								value={ this.state.name }
								onChange={ this.handleChangeGroupRequest }
								type='text'
							/>
						</Form.Group>
						<Form.Group controlId='sidebarModalUserSelector'>
							<Form.Label>{ groupModal.participantsLabel }</Form.Label>
							{/* <Form.Label>Select participants</Form.Label> */}
							<Form.Control
								value={ this.state.users }
								as='select'
								multiple
								onChange={ this.handleChangeGroupRequest }
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
				<Modal
					handleModal={ this.handleToggleFriendModal }
					showModal={ this.state.showFriendModal }
					title={ friendModal.title }
					// title='Friend request'
					submitButton={ friendModal.submitButton }
					cancelButton={ friendModal.cancelButton }
					// submitButton='Send Invitation'
					submitHandler={ this.handleSubmitFriendRequest }
				>
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
					<Form>
						<Form.Group controlId='sidebarModalFriendRequestGroupEmailInput'>
							<Form.Label>{ friendModal.userLabel }</Form.Label>
							{/* <Form.Label>User's email</Form.Label> */}
							<Form.Control
								value={ this.state.value }
								onChange={ this.handleChangeFriendRequest }
								required
								type='email'
							/>
						</Form.Group>
					</Form>
				</Modal>
				<div id='sidebar' className='sidebar-sticky'>
					<div>
						<button
							className='btn btn-primary'
							to='/add_contact'
							onClick={ this.handleToggleFriendModal }
						>
							{ dictionary.addContact }
							{/* Add contact */}
							<FontAwesomeIcon
								className='fa-pull-right'
								size='lg'
								// icon={ [ 'fab', 'react' ] }
								icon='user-plus'
							/>
						</button>
					</div>
					<h4>{ dictionary.contactsTitle }</h4>
					{/* <h4>Contact List</h4> */}
					<ul className='contact-list'>
						{ contacts.map( ( contact, index ) => (
							<li key={ index }>
								<span
									className={
										contact.connected
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
						{ dictionary.groupsTitle }
						{/* Groups */}
						&nbsp;
						<button
							onClick={ this.handleToggleGroupModal }
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
				{/* </nav> */}
				{/* </div> */}
			</div>
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
	// contacts: PropTypes.array.isRequired,
	groups: PropTypes.array.isRequired,
	// handleModal: PropTypes.func.isRequired,
	// showModal: PropTypes.bool.isRequired,
	createGroupConversation: PropTypes.func.isRequired,
	dictionary: PropTypes.object.isRequired,
	asyncRequest: PropTypes.func.isRequired,
	newRequest: PropTypes.bool.isRequired,
	// requests: PropTypes.array.isRequired,
	user: PropTypes.object.isRequired,
	asyncSetDictionary: PropTypes.func.isRequired
};

const mapStateToProps = state => ( {
	groups: state.groups,
	newRequest: state.newRequest
} );

// export default withRouter( Sidebar );
// export default Sidebar;
export default connect(
	mapStateToProps,
	{
		createGroupConversation,
		asyncRequest,
		asyncSetDictionary
		// newMessageRead
	}
)( Sidebar );