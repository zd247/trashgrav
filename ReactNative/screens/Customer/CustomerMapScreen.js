import React, { Component } from "react";
import { View, Text, StyleSheet } from "react-native";

import colors from "../../assets/colors";

class CustomerMapScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <View style={styles.container}>
        <Text> CustomerMapScreen </Text>
      </View>
    );
  }
}

export default CustomerMapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgMain,
  },
  changeMode: {
    width: 200,
    backgroundColor: "transparent",
    borderWidth: 0.5,
    borderColor: colors.bgError,
    marginBottom: 20,
  },
});
