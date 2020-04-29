import React, { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'

const Items = (props) => {
   return (
      <View style = {styles.container}>
         <Text>Items tab</Text>
      </View>
   )
}

export default Items

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
   },
})
