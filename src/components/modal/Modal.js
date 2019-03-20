import React from 'react';
import { Modal, Button } from 'react-bootstrap';
// import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { asyncRequest } from '../../actions';

class MyModal extends React.Component {
	constructor ( props, context ) {
		super( props, context );

		this.handleSendRequest = this.handleSendRequest.bind( this );
		// this.handleClose = this.handleClose.bind( this );
	}
	// handleClose () {
	// 	this.props.history.push( '/' );
	// }
	handleSendRequest ( e ) {
		this.props.asyncRequest( this.emailInput.value );
	}
	render () {
		const {
			handleModal,
			showModal
		} = this.props;
		return (
			<Modal show={ showModal } onHide={ handleModal }>
				<Modal.Header closeButton>
					<Modal.Title>Add User</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<form>
						<label>user's email to send invitation</label>
						&nbsp;
						<input
							type='email'
							required
							ref={ input => {
								this.emailInput = input;
							} }
						/>
					</form>
				</Modal.Body>
				<Modal.Footer>
					<Button
						variant='secondary'
						onClick={ handleModal }
					>
						Cancel
					</Button>
					<Button
						onClick={ this.handleSendRequest }
						variant='primary'>Send Invitation</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}

MyModal.propTypes = {
	asyncRequest: PropTypes.func.isRequired
};

export default connect(
	null,
	{
		asyncRequest
	}	
)( MyModal );
// export default withRouter(
// 	connect(
// 	null,
// 	{
// 		asyncRequest
// 	}	
// 	)( MyModal )
// );