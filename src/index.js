import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { Provider } from 'react-redux';
import rootReducer from './reducers';
// import 'jquery';
// import App from './components/app/App';
import App from './components/app/App.js';
import * as serviceWorker from './serviceWorker';
import 'bootstrap';
// import 'bootstrap/dist/css/bootstrap.css';
import './index.scss';
import rootSaga from './sagas';

const sagaMiddleware = createSagaMiddleware();
const store = createStore(
	rootReducer,
	applyMiddleware( sagaMiddleware )
);

sagaMiddleware.run( rootSaga );

ReactDOM.render(
	<Provider store={ store }>
		<App />
	</Provider>,
	document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
// beMo0tAPJc