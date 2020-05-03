import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Keyboard,
  TextInput,
  TouchableHighlight,
} from "react-native";

import Constants from "expo-constants";
import * as Location from "expo-location";

import CustomActionButton from "../../components/CustomTempButton";
import ItemList from "../../components/ItemList";
import colors from "../../assets/colors";

import apiKey from "../../helpers/googleAPIkey";

import { Ionicons } from "@expo/vector-icons";
import { connect } from "react-redux";
import MapView from "react-native-maps";
import _ from "lodash";

class DriverHomeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      location: null,
      errorMessage: null,
      latitude: 0,
      longitude: 0,
      locationPredictions: [],
    };
  }

  render() {
    return (
      <View style={styles.container}>
        <SafeAreaView />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => this.props.navigation.openDrawer()}
            style={{ flex: 1 }}
          >
            <Ionicons
              name="ios-menu"
              size={30}
              color="white"
              style={{ marginLeft: 10 }}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Driver Home Screen !!</Text>
        </View>
        <SafeAreaView />
      </View>
    );
  }
}

export default DriverHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: colors.bgMain,
  },
  changeMode: {
    width: 200,
    backgroundColor: "transparent",
    borderWidth: 0.5,
    borderColor: colors.bgError,
    marginBottom: 20,
  },
  header: {
    height: 70,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderColor,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  headerTitle: {
    fontSize: 24,
    color: "white",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
  },
  body: {
    flex: 1,
  },
  mapStyle: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});