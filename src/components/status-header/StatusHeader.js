import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Badge } from 'react-bootstrap';

const StatusHeader = props => (
	<header id='status-header'>
		<h3>{ props.username }</h3>
		<Link
			className='btn btn-primary'
			to='/add_contact'
		>
			Add user
			<FontAwesomeIcon
				className='fa-pull-right'
				size='lg'
				// icon={ [ 'fab', 'react' ] }
				icon='user-plus'
			/>
		</Link>
		<Badge pill
			variant={
				props.newRequest
				? 'danger'
				:	props.requests.length > 0
					? 'light'
					: 'secondary'
			}
		>
			{ props.requests.length }
		</Badge>
		{/* <Button variant='primary'> */}
			{/* TODO: set badge variant and it text to values from whatever is in the server */}
			{/* <Badge pill variant='light'>0</Badge>
			<span className='sr-only'>unread messages</span>
		</Button> */}
	</header>
);

StatusHeader.propTypes = {
	username: PropTypes.string.isRequired,
	requests: PropTypes.array.isRequired,
	newRequest: PropTypes.bool.isRequired
};

export default StatusHeader;