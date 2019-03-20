import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Sidebar.css';

const Sidebar = ( { username, contacts } ) => (
	<nav
		className='col-sm-3 d-done d-sm-block bg-primary order-sm-first sidebar'>
		{/* className='col-md-2 d-done d-md-block bg-primary sidebar'> */}
		{/* className='col-ms-2 bg-primary sidebar'> */}
		<div id='sidebar' className='sidebar-sticky'>
			<h1>{ username }</h1>
			<h4>Contact List</h4>
			<ul className='contact-list'>
				{ contacts.map( ( contact, index ) => (
					<li key={ index }>
						<Link
							to={ `/conversation/${ contact.conversationId }` }
						>
							{ contact.username }&nbsp;
							<span
								className={ contact.status === 'connected'
								? 'text-success'
								: 'text-danger' }
							>
								<FontAwesomeIcon icon='circle' />
							</span>
						</Link>
					</li>
				) ) }
			</ul>
		</div>
	</nav>
);

Sidebar.propTypes = {
	contacts: PropTypes.array.isRequired
};

export default Sidebar;