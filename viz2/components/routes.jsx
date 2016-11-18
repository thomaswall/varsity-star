import React, { Component } from 'react';
//import 'babel-polyfill';
import ReactDOM from 'react-dom';
import { Router, Route, Redirect, browserHistory } from 'react-router';

ReactDOM.render((
	<Router history={browserHistory}>
		<Route component={Root}>
			<Route path='/' component={Test} />
		</Route>
	</Router>
), document.getElementById('root'));
