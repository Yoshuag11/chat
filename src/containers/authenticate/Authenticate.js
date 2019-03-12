import React from 'react';

let userEmail;
let passwordInput;
let registerUsername;
let registerPassword;
let registerEmail;

class Authenticate extends React.Component {
	render () {
		const { asyncAuthorize, asyncRegister } = this.props;
		return (
			<div className='container'>
				<div className='row'>
					<div className='col-sm'>
						<form>
							<fieldset>
								<legend>Welcome</legend>
								<div className='form-group'>
									<label htmlFor='email'>Email</label>
									<input
										className='form-control'
										ref={ input => userEmail = input }
										type='text'
										id='email' />
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
											email: userEmail.value,
											password: passwordInput.value
										};

										asyncAuthorize( payload );
									} }
								>
									Log In
								</button>
							</fieldset>
						</form>
					</div>
					<div className='col-sm'>
						<form>
							<fieldset>
								<legend>Not an user yet? Register now!</legend>
								<div className='form-group'>
									<label htmlFor='reg_email'>Email</label>
									<input
										type='text'
										id='reg_email'
										className='form-control'
										ref={ input => {
											registerEmail = input;
										} }
									/>
								</div>
								<div className='form-group'>
									<label htmlFor='reg_user'>User Name</label>
									<input
										type='text'
										id='reg_user'
										ref={ input => {
											registerUsername = input;
										} }
										className='form-control'
									/>
								</div>
								<div className='form-group'>
									<label htmlFor='reg_password'>Password</label>
									<input
										type='password'
										id='reg_password'
										className='form-control'
										ref={ input => {
											registerPassword = input;
										} }
									/>
								</div>
								<button
									type='button'
									className='btn btn-dark'
									onClick={ e => {
										const payload = {
											username: registerUsername.value,
											password: registerPassword.value,
											email: registerEmail.value
										};

										asyncRegister( payload );
									} }
								>
									Sign In
								</button>
							</fieldset>
						</form>
					</div>
				</div>
			</div>
		);
	}
}

export default Authenticate;