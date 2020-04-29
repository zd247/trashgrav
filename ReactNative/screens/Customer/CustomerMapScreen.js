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
  FlatList,
} from "react-native";

import * as Location from "expo-location";
import MapView from "react-native-maps";

import CustomActionButton from "../../components/CustomTempButton";

import apiKey from "../../helpers/googleAPIkey";

import colors from "../../assets/colors";
import ItemList from "../../components/ItemList";
import { Ionicons } from "@expo/vector-icons";
import { connect } from "react-redux";
import _ from "lodash";

class CustomerMapScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      location: null,
      errorMessage: null,
      latitude: 0,
      longitude: 0,
      locationPredictions: [],
    };
    this.onChangeDestinationDebounced = _.debounce(
      this.onChangeDestination,
      1000
    );
  }

  componentDidMount() {
    //Get current location and set initial region to this
    //this.findCurrentLocationAsync();
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => console.error(error),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 }
    );
  }

  findCurrentLocationAsync = async () => {
    let { status } = await Location.requestPermissionsAsync();

    if (status !== "granted") {
      this.setState({
        errorMessage: "Permission to access location was denied",
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    this.setState({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
    console.log(JSON.stringify(location));
  };

  async onChangeDestination(destination) {
    this.setState({ destination });
    const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${apiKey}&input={${destination}}&location=${this.state.latitude},${this.state.longitude}&radius=2000`;
    const result = await fetch(apiUrl);
    const jsonResult = await result.json();
    this.setState({
      locationPredictions: jsonResult.predictions,
    });
    console.log(jsonResult);
  }

  pressedPrediction(prediction) {
    console.log(prediction);
    Keyboard.dismiss();
    this.setState({
      locationPredictions: [],
      destination: prediction.description,
    });
    Keyboard;
  }

  render() {
    const locationPredictions = this.state.locationPredictions.map(
      (prediction) => (
        <TouchableHighlight
          key={prediction.id}
          onPress={() => this.pressedPrediction(prediction)}
        >
          <Text style={styles.locationSuggestion}>
            {prediction.description}
          </Text>
        </TouchableHighlight>
      )
    );
    return (
      <View style={styles.container}>
        <SafeAreaView />

        <MapView
          style={styles.map}
          provider="google"
          region={{
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}
          showsUserLocation={true}
        />
        <View style={{ flex: 1, position: "absolute" }}>
          <TextInput
            placeholder="Enter location.."
            style={styles.destinationInput}
            onChangeText={(destination) => {
              this.setState({ destination });
              this.onChangeDestinationDebounced(destination);
            }}
            value={this.state.destination}
          />
          {locationPredictions}
        </View>

        <SafeAreaView />
      </View>
    );
  }
}

export default CustomerMapScreen;

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
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  destinationInput: {
    borderWidth: 0.5,
    borderColor: "grey",
    height: 40,
    marginTop: 20,
    marginLeft: 5,
    marginRight: 5,
    padding: 5,
    backgroundColor: "white",
    width: Dimensions.get("window").width,
  },
  locationSuggestion: {
    backgroundColor: "white",
    padding: 10,
    fontSize: 18,
    borderWidth: 0.5,
  },
});
