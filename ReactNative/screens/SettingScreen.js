import React, { Component } from "react";
import { View, Text, StyleSheet } from "react-native";

import CustomActionButton from "../components/CustomTempButton";
import colors from "../assets/colors";
import { connect } from "react-redux";
import * as firebase from "firebase/app";
import "firebase/auth";
class SettingScreen extends Component {
  signOut = async () => {
    try {
      await firebase.auth().signOut();
      this.props.onsignOut();
      //this.props.navigation.navigate("LoginScreen");
    } catch (error) {
      alert("Unable to sign out right now");
    }
  };

  render() {
    return (
      <View style={styles.container}>
        {!this.props.auth.isDriver ? (
          <CustomActionButton
            style={styles.changeMode}
            title="Change To Driver Mode"
            onPress={this.props.changeDriverMode}
          >
            <Text style={{ fontWeight: "100", color: "white" }}>
              Change To Driver Mode
            </Text>
          </CustomActionButton>
        ) : (
          <CustomActionButton
            style={styles.changeMode}
            title="Change To Customer Mode"
            onPress={this.props.changeCustomerMode}
          >
            <Text style={{ fontWeight: "100", color: "white" }}>
              Change To Customer Mode
            </Text>
          </CustomActionButton>
        )}
        <CustomActionButton
          style={styles.changeMode}
          title="Sign Up"
          onPress={this.signOut}
        >
          <Text style={{ fontWeight: "100", color: "white" }}>Logout</Text>
        </CustomActionButton>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    auth: state.auth,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    signIn: (user) => dispatch({ type: "SIGN_IN", payload: user }),
    onsignOut: () => dispatch({ type: "SIGN_OUT" }),
    changeDriverMode: () => dispatch({ type: "CHANGE_TO_DRIVER_MODE" }),
    changeCustomerMode: () => dispatch({ type: "CHANGE_TO_CUSTOMER_MODE" }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingScreen);

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
