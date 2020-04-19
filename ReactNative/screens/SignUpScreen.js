import React, { Component } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import colors from "../assets/colors";
import CustomActionButton from "../components/CustomTempButton";

import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";

class SignUpScreen extends Component {
  constructor() {
    super();
    this.state = {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      isLoading: false,
    };
  }

  onSignUp = async () => {
    if (
      this.state.email &&
      this.state.password &&
      this.state.firstName &&
      this.state.lastName
    ) {
      this.setState({ isLoading: true });
      try {
        const response = await firebase
          .auth()
          .createUserWithEmailAndPassword(
            this.state.email,
            this.state.password
          );

        if (response) {
          this.setState({ isLoading: false });
          const user = await firebase
            .database()
            .ref("Users")
            .child(response.user.uid)
            .set({
              email: response.user.email,
              first_name: this.state.firstName,
              last_name: this.state.lastName,
              uid: response.user.uid,
            });

          this.props.navigation.navigate("SecurityCheck");
          //automatically signs in the user
        }
      } catch (error) {
        this.setState({ isLoading: false });
        if (error.code == "auth/email-already-in-use") {
          alert("User already exists.Try loggin in");
        }
        console.log(error);
      }
    } else {
      alert("All fields are required to sign up");
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

        <View
          style={{
            flex: 1,
            justifyContent: "center",
            marginTop: 30,
          }}
        >
          <TextInput
            style={styles.textInput}
            placeholder={"First Name"}
            placeholderTextColor={colors.bgTextInputDark}
            keyboardType="default"
            onChangeText={(firstName) => this.setState({ firstName })}
          />
          <TextInput
            style={styles.textInput}
            placeholder={"Last Name"}
            placeholderTextColor={colors.bgTextInputDark}
            keyboardType="default"
            onChangeText={(lastName) => this.setState({ lastName })}
          />
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
          <View style={{ alignItems: "center" }}>
            <CustomActionButton
              style={[styles.loginButtons, { borderColor: colors.bgPrimary }]}
              title="Sign Up"
              onPress={this.onSignUp}
            >
              <Text style={{ fontWeight: "100", color: "green" }}>
                Sign Up Now!!
              </Text>
            </CustomActionButton>
          </View>
        </View>
      </View>
    );
  }
}

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgMain,
    paddingTop: Platform.OS == "android" ? 50 : 0,
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
