import React, { Component } from "react";
import { View, Text, StyleSheet } from "react-native";

class AdminHomeScreeen extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <View style={styles.container}>
        <Text> Admin Home Screen Wooohooo !!!! </Text>
      </View>
    );
  }
}

export default AdminHomeScreeen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
