import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Badge } from 'react-bootstrap';

const StatusHeader = ( { username, handleModal, newRequest, requests } ) => (
	<header id='status-header'>
		<h3>{ username }</h3>
		<button
			className='btn btn-primary'
			to='/add_contact'
			onClick={ handleModal }
		>
			Add user
			<FontAwesomeIcon
				className='fa-pull-right'
				size='lg'
				// icon={ [ 'fab', 'react' ] }
				icon='user-plus'
			/>
		</button>
		<Link
			// the "to" property here is doing nothing, it just 
			to='/requests'
			data-toggle='dropdown'
			aria-haspopup='true'
			aria-expanded='false'
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
		</Link>
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
	</header>
);

StatusHeader.propTypes = {
	username: PropTypes.string.isRequired,
	requests: PropTypes.array.isRequired,
	newRequest: PropTypes.bool.isRequired,
	handleModal: PropTypes.func.isRequired
};

export default StatusHeader;