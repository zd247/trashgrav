import React from 'react'
import { GiftedChat } from 'react-native-gifted-chat'

import * as firebase from 'firebase/app'

class ChatScreen extends React.Component {
	state = {
		messages: [],
		user: {},
		driver: {},
	}

	componentDidMount() {
		this.setState({
			user: this.props.route.params.request.user,
			driver: this.props.route.params.request.driver,
		})

		this.firebaseOn(message =>
			this.setState(previousState => ({
				messages: GiftedChat.append(previousState.messages, message),
			}))
		)
	}

	componentWillUnmount() {
		firebase.database().ref('Messages').off()
	}

	firebaseOn = callback => {
		firebase
			.database()
			.ref('Messages')
			.limitToLast(20)
			.on('child_added', snapshot => callback(this.firebaseParse(snapshot)))
	}

	firebaseParse = snapshot => {
		const { timestamp: numberStamp, text, user } = snapshot.val()
		const { key: _id } = snapshot
		const timestamp = new Date(numberStamp)
		const message = {
			_id,
			timestamp,
			text,
			user,
		}
		return message
	}

	get user() {
		return {
			name: this.state.user.first_name + ' ' + this.state.user.last_name,
			_id: this.state.user.uid,
		}
	}

	get timestamp() {
		return firebase.database.ServerValue.TIMESTAMP
	}

	onSend(messages = []) {
		for (let i = 0; i < messages.length; i++) {
			const { text, user } = messages[i]
			const message = {
				text,
				user,
				timestamp: this.timestamp,
			}
			firebase.database().ref('Messages').push(message)
		}
	}

	render() {
		return (
			<GiftedChat
				messages={this.state.messages}
				onSend={messages => this.onSend(messages)}
				user={this.user}
			/>
		)
	}
}
export default ChatScreen
