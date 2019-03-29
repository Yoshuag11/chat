import React from 'react';
import PropTypes from 'prop-types';
import {
	Link
	// Redirect
} from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import {
	logOut
	// stopChannel
} from '../../actions';
// import { Badge } from 'react-bootstrap';
import './StatusHeader.css';

const StatusHeader = ( {
		children,
		logOut,
		tooltipText
		// stopChannel
		// handleModal,
		// newRequest,
		// requests
		// conversationType
	} ) => (
		<header className='status-header' id='status-header'>
			<br />
				<Link
					to='/authenticate'
					onClick={ logOut }
					// onClick={ stopChannel }
				>
				<OverlayTrigger
					placement='left'
					overlay={
						<Tooltip id='statusHeaderToolTip'>{ tooltipText }</Tooltip>
					}
					container={ this }
				>
					<FontAwesomeIcon
						className='fa-pull-right'
						size='lg'
						// icon={ [ 'fab', 'react' ] }
						icon='sign-out-alt'
					/>
					</OverlayTrigger>
				</Link>
			{/* <h3>{ username }</h3> */}
			{ children }
			<hr />
			{/* { conversationType === 'group'
			? (
				<button
					className='btn btn-primary'
					to='/add_contact'
					onClick={ handleModal }
				>
					Add participant
					<FontAwesomeIcon
						className='fa-pull-right'
						size='lg'
						// icon={ [ 'fab', 'react' ] }
						icon='user-plus'
					/>
				</button>
			)
			: '' } */}
			{/* <Link
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
			</Link> */}
			{/* <div className='dropdown-menu'>
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
		</header>
	);

StatusHeader.propTypes = {
	logOut: PropTypes.func.isRequired
	// stopChannel: PropTypes.func.isRequired
// 	// conversationType: PropTypes.string.isRequired,
// 	// requests: PropTypes.array.isRequired,
// 	// newRequest: PropTypes.bool.isRequired
// 	// handleModal: PropTypes.func.isRequired
};

export default connect(
	null,
	{
		logOut
		// stopChannel
	}
)( StatusHeader );