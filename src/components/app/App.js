import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';
import Sidebar from '../sidebar/Sidebar';
import Chat from '../../containers/chat/Chat';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Authenticate from '../../containers/authenticate/Authenticate';

class App extends Component {
	render() {
		return (
			// <div className="App">
			//   <header className="App-header">
			//     <img src={logo} className="App-logo" alt="logo" />
			//     <p>
			//       Edit <code>src/App.js</code> and save to reload.
			//     </p>
			//     <a
			//       className="App-link"
			//       href="https://reactjs.org"
			//       target="_blank"
			//       rel="noopener noreferrer"
			//     >
			//       Learn React
			//     </a>
			//   </header>
			// </div>
			<Router>
				<Switch>
					<Route
						path='/authenticate'
						render={ props => (
							<Authenticate />
						) }
					/>
					<Route
						exact
						path='/'
						render={ props => (
							<div className='container-fluid'>
								<div className='row'>
									<Sidebar />
									<Chat />
								</div>
							</div>
						) }
					/>
				</Switch>
			</Router>
		);
	}
}

export default App;