import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { asyncAuthorize } from '../../actions';

let userInput;
let passwordInput;
class Authenticate extends React.Component {
	componentDidMount () {
		// TODO verify whether user is connected or not by looking at cookies rather
		// than making an extra http request
		this.props.asyncAuthorize();
	}
	render () {
		const { asyncAuthorize, isAuthorized } = this.props;

		if ( isAuthorized ) {
			return <Redirect to='/' />;
		}
		return (
			<div className='container-fluid'>
				<div className='row'>
					<div className='col-md-4'>
						<form>
							<div className='form-group'>
								<label htmlFor='user'>User</label>
								<input
									className='form-control'
									ref={ input => userInput = input }
									type='text'
									id='user' />
							</div>
							<div className='form-group'>
								<label htmlFor='password'>Password</label>
								<input
									className='form-control'
									type='password'
									ref={ input => passwordInput = input }
									id='password' />
							</div>
							<button
								type='button'
								className='btn btn-primary'
								onClick={ e => {
									const payload = {
										user: userInput.value,
										password: passwordInput.value
									};

									asyncAuthorize( payload );
								} }
							>
								Authorize
							</button>
						</form>
					</div>
				</div>
			</div>
		);
	}
}

Authenticate.propTypes = {
	isAuthorized: PropTypes.bool.isRequired,
	asyncAuthorize: PropTypes.func.isRequired
};

const mapStateToProps = ( { isAuthorized } ) => ( { isAuthorized } );

export default connect(
	mapStateToProps,
	{
		asyncAuthorize
	}
)( Authenticate );