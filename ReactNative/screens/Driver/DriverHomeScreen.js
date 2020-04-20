import React, { Component } from "react";
import { View, Text, StyleSheet } from "react-native";

class DriverHomeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <View style={styles.container}>
        <Text> DriverHomeScreen </Text>
      </View>
    );
  }
}

export default DriverHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
