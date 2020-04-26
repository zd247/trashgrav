import React from "react";
import { View, StyleSheet, StatusBar, Image, Text } from "react-native";
import * as Animatable from "react-native-animatable";

import ErrorBoundary from "../components/ErrorBoundary";
import CustomActionButton from "../components/CustomTempButton";

import colors from "../assets/colors";

const imageSize = 150;

export default class StartScreen extends React.Component {
  render() {
    return (
      <ErrorBoundary>
        <View style={styles.container}>
          <StatusBar barStyle="light-content" />
          <Animatable.View style={styles.header} animation="fadeInDown">
            <Image
              style={{
                width: imageSize,
                height: imageSize,
                borderRadius: imageSize / 2,
              }}
              source={require("../assets/logo.png")}
            />
          </Animatable.View>
          {/* -------footer------- */}
          <Animatable.View animation="fadeInUp" style={styles.footer}>
            <Text style={styles.textFooter}>
              Let's make our environment clean!{" "}
            </Text>
            <Text
              style={{
                marginTop: 10,
                color: "grey",
                padding: 5,
                marginBottom: 15,
              }}
            >
              Shall we continue as an ...
            </Text>
            <View
              style={{
                flex: 1,
                marginTop: 30,
                flexDirection: "row",
                justifyContent: "space-evenly",
              }}
            >
              <CustomActionButton
                style={[
                  styles.button,
                  { backgroundColor: colors.bgAdminLogin },
                ]}
                title="Admin"
                onPress={() => this.props.navigation.navigate("LoginScreen")}
              >
                >
                <Text style={{ fontWeight: "bold", color: "white" }}>
                  ADMIN
                </Text>
              </CustomActionButton>
              <CustomActionButton
                style={[styles.button, { backgroundColor: colors.bgUserLogin }]}
                title="User"
                onPress={() => this.props.navigation.navigate("LoginScreen")}
              >
                <Text style={{ fontWeight: "bold", color: "white" }}>USER</Text>
              </CustomActionButton>
            </View>
          </Animatable.View>
        </View>
      </ErrorBoundary>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#05375a",
  },
  header: {
    flex: 1,
    justifyContent: "center",
    alignSelf: "center",
    paddingVertical: 140,
  },
  footer: {
    flex: 3,
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 30,
    paddingVertical: 30,
  },
  textFooter: {
    color: "#05375a",
    fontSize: 30,
    fontWeight: "bold",
  },
  button: {
    borderColor: colors.bgPrimary,
    borderWidth: 0.5,
    borderRadius: 20,
    marginBottom: 10,
    alignSelf: "center",
    width: 140,
  },
});
