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
import { asyncAuthorize, asyncRegister } from '../../actions';

class App extends Component {
	render() {
		const {
			isAuthorized, asyncAuthorize, asyncRegister
		} = this.props;
		return (
			<Router>
				<Switch>
					<Route
						path='/authenticate'
						render={ props => {
							if ( isAuthorized ) {
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
						exact
						path='/'
						render={ props => {
							if ( isAuthorized ) {
								return (
									<div className='container-fluid'>
										<div className='row'>
											<Sidebar />
											<Chat />
										</div>
									</div>
								);
							} else {
								return <Redirect to='/authenticate' />;
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
	asyncRegister: PropTypes.func.isRequired
};

const mapStateToProps = state => ( {
	isAuthorized: state.isAuthorized
} );
export default connect(
	mapStateToProps,
	{
		asyncAuthorize,
		asyncRegister
	}
)( App );