import React from 'react'
import HistoryList from '../../components/HistoryList'

class ActiveHistory extends React.Component {
	render() {
		return (
			<HistoryList isActive={true} navigation = {this.props.props.navigation}/>
		)
	}
}
export default ActiveHistory
