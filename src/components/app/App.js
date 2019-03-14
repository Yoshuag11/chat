import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';
import { connect } from 'react-redux';
import Sidebar from '../sidebar/Sidebar';
import Chat from '../../containers/chat/Chat';
import {
	BrowserRouter as Router, Route, Switch, Redirect
} from 'react-router-dom';
import Authenticate from '../../containers/authenticate/Authenticate';
import PropTypes from 'prop-types';
import { asyncAuthorize, asyncRegister, asyncFetchUser } from '../../actions';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import Modal from '../modal/Modal';

library.add( faUserPlus, fab );

class App extends Component {
	render() {
		const {
			user, asyncAuthorize, asyncRegister, isAuthorized
		} = this.props;
		return (
			<Router>
				<Switch>
					<Route
						path='/authenticate'
						render={ props => {
							if ( user ) {
								return <Redirect to='/' />;
							}
							return (
								<Authenticate
									asyncRegister={ asyncRegister }
									asyncAuthorize={ asyncAuthorize } />
							);
						} }
					/>
					<Route
						path='/'
						render={ props => {
							if ( !isAuthorized ) {
								return <Redirect to='/authenticate' />;
							} else if ( user ) {
								return (
									<div className='container-fluid'>
										<div className='row'>
											<Chat>
												<Route path='/add_contact' component={ Modal } />
											</Chat>
											<Sidebar />
										</div>
									</div>
								);
							} else {
								return (
									<div className='text-center'>
										<div
											className='spinner-border text-primary'
											style={ {
												width: '10rem',
												height: '10rem'
											} }
											role='status'
										>
											<span className='sr-only'>Loading...</span>
										</div>
									</div>
								);
							}
						} }
					/>
				</Switch>
			</Router>
		);
		// return (
		// 	<div className="App">
		// 		<header className="App-header">
		// 			<img src={logo} className="App-logo" alt="logo" />
		// 			<p>
		// 				Edit <code>src/App.js</code> and save to reload.
		// 			</p>
		// 			<a
		// 				className="App-link"
		// 				href="https://reactjs.org"
		// 				target="_blank"
		// 				rel="noopener noreferrer"
		// 			>
		// 				Learn React
		// 			</a>
		// 		</header>
		// 	</div>
		// );
	}
}

App.propTypes = {
	isAuthorized: PropTypes.bool.isRequired,
	asyncAuthorize: PropTypes.func.isRequired,
	asyncRegister: PropTypes.func.isRequired,
	asyncFetchUser: PropTypes.func.isRequired,
	user: ( props, propName, componentName ) => {
		 const data = props[ propName ];

		if ( data === undefined ) {
			return new Error( `Undefined ${ propName } is not allowed` );
		}
		if ( data === null ) {
			return;
		}
		if ( data.toString() !== '[object Object]'  ) {
			return new Error( `${ propName } must be an object` );
		}
	}
};

const mapStateToProps = state => ( {
	isAuthorized: state.isAuthorized,
	user: state.user
} );
export default connect(
	mapStateToProps,
	{
		asyncAuthorize,
		asyncRegister,
		asyncFetchUser
	}
)( App );