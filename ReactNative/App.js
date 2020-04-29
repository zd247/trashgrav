import React from 'react'
import { YellowBox } from 'react-native'

import _ from 'lodash'
import TrashGrav from './TrashGrav'
import { Provider } from 'react-redux'
import store from './redux/store'

import * as firebase from 'firebase/app'
import { firebaseConfig } from './config/config'
import ErrorBoundary from './components/ErrorBoundary'

class App extends React.Component {
	constructor(props) {
		super(props)
		this.initializeFirebase()

		// to ignore the linking warning message
		YellowBox.ignoreWarnings(['Linking requires that'])
		const _console = _.clone(console)
		console.warn = message => {
			if (message.indexOf('Linking requires that') <= -1) {
				_console.warn(message)
			}
		}
	}
	initializeFirebase = () => {
		if (!firebase.apps.length) {
			firebase.initializeApp(firebaseConfig)
		}
	}

	render() {
		return (
			<Provider store={store}>
				<ErrorBoundary>
					<TrashGrav />
				</ErrorBoundary>
			</Provider>
		)
	}
}

export default App
