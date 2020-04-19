import React, { Component } from "react";
import { View, Text, StyleSheet } from "react-native";

import LottieView from "lottie-react-native";

class LoadingScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <View style={styles.container}>
        <LottieView
          style={{ height: 300, width: 300 }}
          source={require("../assets/splash.json")}
          autoPlay
          loop
        />
      </View>
    );
  }
}

export default LoadingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
