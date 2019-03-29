import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';
import { connect } from 'react-redux';
import Sidebar from '../sidebar/Sidebar';
import Chat from '../../containers/chat/Chat';
import Loading from '../loading/Loading';
import ChatContent from '../../containers/chatcontent/ChatContent';
import StatusHeader from '../status-header/StatusHeader';
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
	startChannel,
	asyncLoadDictionary,
	initializeSagas
} from '../../actions';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
	faUserPlus,
	faCircle,
	faPlus,
	faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { nullOrObject } from '../../utils';
// import Modal from '../modal/Modal';
// import Modal from '../../components/modal/Modal';
// import Conversation from '../../containers/conversation/Conversation';

library.add( faUserPlus, fab, faCircle, faPlus, faSignOutAlt );

class App extends Component {
	constructor ( props ) {
		super( props );

		const {
			asyncLoadDictionary,
			isAuthorized,
			asyncFetchUser,
			initializeSagas
		} = this.props;

		initializeSagas();
		asyncLoadDictionary();

		if ( isAuthorized ) {
			asyncFetchUser();
		}
	}
	componentDidMount() {
	}
	componentDidUpdate() {
		// this.props.asyncLoadDictionary();
	}
	// constructor ( props ) {
	// 	super( props );

	// 	this.state = {
	// 		showModal: false
	// 	};
	// 	this.handleToggleModal = this.handleToggleModal.bind( this );
	// }
	// handleToggleModal () {
	// 	this.setState( {
	// 		showModal: !this.state.showModal
	// 	} );
	// }
	render() {
		const {
			user,
			// groups,
			asyncAuthorize,
			asyncRegister,
			isAuthorized,
			dictionary,
			asyncLoadDictionary
			// newRequest,
			// requests
			// newMessage
			// startChannel,
			// socket
		} = this.props;
		const {
			chatContent: {
				statusHeader: {
					tooltipLogoutButton
				}
			} = { statusHeader: { tooltipLogoutButton: '' } }
		} = dictionary;
		// console.log('********* App -> render *********');
		// console.log( 'user is null', user === null );
		// console.log( 'is authorized', isAuthorized );
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
									dictionary={ dictionary.authenticate }
									asyncRegister={ asyncRegister }
									asyncAuthorize={ asyncAuthorize } />
							);
						} }
					/>
					<Route
						path='/'
						render={ () => {
							if ( !isAuthorized ) {
								return <Redirect to='/authenticate' />;
							} else if ( user/* && socket */ ) {
								return (
									<div className='container-fluid'>
										<div className='row'>
											<Chat
												asyncLoadDictionary={ asyncLoadDictionary }>
												<Route
													path='/:conversationType/:conversationId'
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
														<StatusHeader
															tooltipText={ tooltipLogoutButton }
														>
															<h1>
																{ dictionary.landingMessage }
															</h1>
														</StatusHeader>
														// <h1>{ dictionary.landingMessage }</h1>
														// <section
														// 	// className='col-sm-9 ml-sm-auto px-4'
														// 	// className='col-sm-9 px-4'
														// 	className='col-sm-7 col-md-9 px-4'
														// >
														// 	<h1>{ dictionary.landingMessage }</h1>
														// 	{/* <h1>Welcome</h1> */}
														// </section>
													) }
												/>
											</Chat>
											<Route
												path='/:conversationType/:conversationId'
												children={ props => (
													<Sidebar
														{ ...props }
														// handleModal={ this.handleToggleModal }
														// showModal={ this.state.showModal }
														// newRequest={ newRequest }
														// newMessage={ newMessage }
														// username={ user.username }
														// contacts={ user.contacts }
														dictionary={ dictionary.sidebar }
														// groups={ groups }
														// requests={ requests }
														user={ user }
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
	user: nullOrObject,
	asyncLoadDictionary: PropTypes.func.isRequired
	// groups: PropTypes.array.isRequired,
	// requests: PropTypes.array.isRequired
	// newMessage: nullOrObject
};

const mapStateToProps = state => ( {
	isAuthorized: state.isAuthorized,
	user: state.user,
	// groups: state.groups,
	dictionary: state.dictionary,
	// newRequest: state.newRequest,
	// requests: state.user.requestsReceived
	// newMessage: state.newMessage
	// socket: state.socket
} );
export default connect(
	mapStateToProps,
	{
		asyncAuthorize,
		asyncRegister,
		asyncFetchUser,
		startChannel,
		asyncLoadDictionary,
		initializeSagas
	}
)( App );