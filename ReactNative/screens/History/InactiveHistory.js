import React from 'react'
import HistoryList from '../../components/HistoryList'

class InactiveHistory extends React.Component {
	render() {
		return (
			<HistoryList isActive={false}/>
		)
	}
}
export default InactiveHistory
