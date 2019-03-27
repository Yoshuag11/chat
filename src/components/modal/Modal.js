import React from 'react';
import { Modal, Button } from 'react-bootstrap';
// import { withRouter } from 'react-router-dom';
// import { connect } from 'react-redux';
// import PropTypes from 'prop-types';
// import { asyncRequest } from '../../actions';

class MyModal extends React.Component {
	// constructor ( props, context ) {
	// 	super( props, context );

	// 	// this.handleSubmit = this.handleSubmit.bind( this );
	// 	// this.handleClose = this.handleClose.bind( this );
	// }
	// handleClose () {
	// 	this.props.history.push( '/' );
	// }
	// handleSubmit ( e ) {
	// 	this.props.asyncRequest( this.emailInput.value );
	// }
	render () {
		const {
			handleModal,
			showModal,
			children,
			title = 'title',
			submitButton = 'OK',
			cancelButton = 'Cancel',
			submitHandler = () => {}
		} = this.props;
		return (
			<Modal show={ showModal } onHide={ handleModal }>
				<Modal.Header closeButton>
					<Modal.Title>{ title }</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{ children }
				</Modal.Body>
				<Modal.Footer>
					<Button
						variant='secondary'
						onClick={ handleModal }
					>
						{ cancelButton }
					</Button>
					<Button
						// onClick={ this.handleSubmit }
						onClick={ submitHandler }
						variant='primary'>{ submitButton }</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}

// MyModal.propTypes = {
// 	asyncRequest: PropTypes.func.isRequired
// };

// export default connect(
// 	null,
// 	{
// 		asyncRequest
// 	}	
// )( MyModal );
export default MyModal;
// export default withRouter(
// 	connect(
// 	null,
// 	{
// 		asyncRequest
// 	}	
// 	)( MyModal )
// );