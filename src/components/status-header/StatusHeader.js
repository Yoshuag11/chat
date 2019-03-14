import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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
	</header>
);

StatusHeader.propTypes = {
	username: PropTypes.string.isRequired
}

export default StatusHeader;