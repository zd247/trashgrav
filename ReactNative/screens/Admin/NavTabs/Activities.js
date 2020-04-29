import React, { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'

const Activities = (props) => {
   return (
      <View style = {styles.container}>
         <Text>Activities tab</Text>
      </View>
   )
}

export default Activities

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
   },
})
