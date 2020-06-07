import React from 'react'
import HistoryList from '../../components/HistoryList'

class ActiveHistory extends React.Component {
	render() {
		return (
			<HistoryList isActive={true}/>
		)
	}
}
export default ActiveHistory
