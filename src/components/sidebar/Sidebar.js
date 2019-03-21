import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
// import { withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { nullOrObject } from '../../utils';
// import { newMessageRead } from '../../actions';
// import { connect } from 'react-redux';
import './Sidebar.css';

const Sidebar = props => {
	const {
		username, contacts,
		// newMessage,
		match
	} = props;
	console.log( 'props', props );
	// console.log( 'match', match );
	// console.log( 'newMessage', newMessage );
	const conversationId = match ? match.params.id : null;
	// const conversationId =
	// 	( match === null && newMessage ) ||
	// 	( match && newMessage && match.params.id !== newMessage.conversationId )
	// 	? newMessage.conversationId
	// 	: null;
	// if ( conversationId ) {
	// 	props.newMessageRead( conversationId );
	// }
	return (
	<nav
		// className='col-md-2 d-done d-md-block bg-primary sidebar'
		// className='col-ms-2 bg-primary sidebar'
		className='col-sm-3 d-done d-sm-block bg-primary order-sm-first sidebar'
	>
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
						{ (
							conversationId === null ||
							conversationId !== contact.conversationId
						) && contact.newMessage
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
					className='btn btn-primary'
					// the "to" property here is doing nothing, it just 
					// href='#'
				>
					<FontAwesomeIcon color='green' icon='plus' />
				</button>
			</h4>
			<ul className='group-list'></ul>
		</div>
	</nav>
) };

Sidebar.propTypes = {
	contacts: PropTypes.array.isRequired
	// newMessageRead: PropTypes.array.isRequired
	// newMessage: nullOrObject
};

// export default withRouter( Sidebar );
export default Sidebar;
// export default connect(
// 	null,
// 	{
// 		newMessageRead
// 	}
// )( Sidebar );