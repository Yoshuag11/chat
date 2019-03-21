import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';
import { connect } from 'react-redux';
import Sidebar from '../sidebar/Sidebar';
import Chat from '../../containers/chat/Chat';
import Loading from '../loading/Loading';
import ChatContent from '../../containers/chatcontent/ChatContent';
import {
	BrowserRouter as Router,
	Route,
	Switch,
	Redirect
} from 'react-router-dom';
import Authenticate from '../../containers/authenticate/Authenticate';
import PropTypes from 'prop-types';
import {
	asyncAuthorize,
	asyncRegister,
	asyncFetchUser,
	startChannel
} from '../../actions';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
	faUserPlus,
	faCircle,
	faPlus
} from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { nullOrObject } from '../../utils';
// import Modal from '../modal/Modal';
// import Modal from '../../components/modal/Modal';
// import Conversation from '../../containers/conversation/Conversation';

library.add( faUserPlus, fab, faCircle, faPlus );

class App extends Component {
	render() {
		const {
			user,
			asyncAuthorize,
			asyncRegister,
			isAuthorized,
			// newMessage
			// startChannel,
			// socket
		} = this.props;
		return (
			<Router>
				<Switch>
					<Route
						path='/authenticate'
						render={ () => {
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
							} else if ( user/* && socket */ ) {
								return (
									<div className='container-fluid'>
										<div className='row'>
											<Chat>
												<Route
													path='/conversation/:id'
													component={ ChatContent }
													// render={ props => (
													// 	// <Chat { ...props } />
													// 	// <Chat { ...props }>
													// 	// 	<Route
													// 	// 		path='/add_contact'
													// 	// 		component={ Modal }
													// 	// 	/>
													// 	// </Chat>
													// ) }
												/>
												<Route
													exact
													path='/'
													render={ () => (
														<section
															// className='col-sm-9 ml-sm-auto px-4'
															className='col-sm-9 px-4'
														>
															<h1>Welcome</h1>
														</section>
													) }
												/>
											</Chat>
											<Route
												path='/conversation/:id'
												children={ props => (
													<Sidebar
														{ ...props }
														// newMessage={ newMessage }
														username={ user.username }
														contacts={ user.contacts }
													/>
												) }
											/>
										</div>
									</div>
								);
							} else {
								return <Loading />;
								// return (
								// 	<div className='text-center'>
								// 		<div
								// 			className='spinner-border text-primary'
								// 			style={ {
								// 				width: '10rem',
								// 				height: '10rem'
								// 			} }
								// 			role='status'
								// 		>
								// 			<span className='sr-only'>Loading...</span>
								// 		</div>
								// 	</div>
								// );
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
	// socket: PropTypes.bool.isRequired,
	startChannel: PropTypes.func.isRequired,
	user: nullOrObject
	// newMessage: nullOrObject
};

const mapStateToProps = state => ( {
	isAuthorized: state.isAuthorized,
	user: state.user
	// newMessage: state.newMessage
	// socket: state.socket
} );
export default connect(
	mapStateToProps,
	{
		asyncAuthorize,
		asyncRegister,
		asyncFetchUser,
		startChannel
	}
)( App );