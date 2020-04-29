import React, { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'

const Requests = (props) => {
   return (
      <View style = {styles.container}>
         <Text>Requests tab</Text>
      </View>
   )
}

export default Requests

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
   },
})
