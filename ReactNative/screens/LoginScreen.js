import React, { Component } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import colors from "../assets/colors";
import CustomActionButton from "../components/CustomTempButton";
import ErrorBoundary from '../components/ErrorBoundary'

import { connect } from "react-redux";

import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";

class LoginScreen extends Component {
  constructor() {
    super();
    this.state = {
      email: "",
      password: "",
      isLoading: false,
    };
  }

  onSignIn = async () => {
    if (this.state.email && this.state.password) {
      this.setState({ isLoading: true });
      try {
        const response = await firebase
          .auth()
          .signInWithEmailAndPassword(this.state.email, this.state.password);
        if (response) {
          this.setState({ isLoading: false });
          this.props.signIn(response.user);
          //this.props.navigation.navigate("HomeScreen");
        }
      } catch (error) {
        this.setState({ isLoading: false });
        switch (error.code) {
          case "auth/user-not-found":
            alert("A user with that email does not exist. Try signing Up");
            break;
          case "auth/invalid-email":
            alert("Please enter an email address");
        }
      }
    }
  };

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: "white" }}>
        {this.state.isLoading ? (
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                elevation: 1000,
              },
            ]}
          >
            <ActivityIndicator size="large" color={colors.logoColor} />
          </View>
        ) : null}
        <View
          style={{
            flex: 1,
            borderColor: "white",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="ios-nuclear" size={150} color={colors.logoColor} />
          <Text style={{ fontSize: 50, fontWeight: "100", color: "green" }}>
            Trash Grav
          </Text>
        </View>
        <TextInput
          style={styles.textInput}
          placeholder={"abc@example.com"}
          placeholderTextColor={colors.bgTextInputDark}
          keyboardType="email-address"
          onChangeText={(email) => this.setState({ email })}
        />
        <TextInput
          style={styles.textInput}
          placeholder="enter password"
          placeholderTextColor={colors.bgTextInputDark}
          secureTextEntry
          onChangeText={(password) => this.setState({ password })}
        />
        <View style={{ flex: 1, alignItems: "center", marginTop: 30 }}>
          <CustomActionButton
            style={[styles.loginButtons, { borderColor: colors.bgPrimary }]}
            title="Login in"
            onPress={this.onSignIn}
          >
            <Text style={{ fontWeight: "100", color: "green" }}>Login</Text>
          </CustomActionButton>

          <CustomActionButton
            style={[styles.loginButtons, { borderColor: colors.bgPrimary }]}
            title="Sign Up"
            onPress={() => this.props.navigation.navigate("SignUpScreen")}
          >
            <Text style={{ fontWeight: "100", color: "green" }}>Sign Up</Text>
          </CustomActionButton>
        </View>
      </View>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    signIn: (user) => dispatch({ type: "SIGN_IN", payload: user }),
    signOut: () => dispatch({ type: "SIGN_OUT" }),
  };
};

export default connect(null, mapDispatchToProps)(LoginScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgMain,
  },
  textInput: {
    height: 50,
    borderWidth: 0.5,
    borderColor: colors.borderColor,
    marginHorizontal: 40,
    marginBottom: 10,
    color: "black",
    paddingHorizontal: 10,
  },
  loginButtons: {
    borderWidth: 0.5,
    backgroundColor: "transparent",
    marginBottom: 10,
    width: 200,
  },
});