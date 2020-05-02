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
  ActivityIndicator,
} from "react-native";

import * as Location from "expo-location";
import MapView, { Polyline, Marker } from "react-native-maps";

import CustomActionButton from "../../components/CustomTempButton";

import apiKey from "../../helpers/googleAPIkey";

import colors from "../../assets/colors";
import ItemList from "../../components/ItemList";
import { Ionicons } from "@expo/vector-icons";
import { connect } from "react-redux";
import * as firebase from "firebase/app";
import _ from "lodash";

class CustomerMapScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      location: null,
      errorMessage: null,
      latitude: 0,
      longitude: 0,
      destination: "",
      predictions: [],
      pointCoords: [],
      routeResponse: {},
      lookingForDriver: false,
      place_ID: "",
      id: "",
    };
    this.onChangeDestinationDebounced = _.debounce(
      this.onChangeDestination,
      1000
    );
  }

  componentDidMount() {
    //Get current location and set initial region to this
    //this.findCurrentLocationAsync();
    this.props.toggleIsLoadingItems(true);
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
    this.props.toggleIsLoadingItems(false);
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

  async getRouteDirections(destinationPlaceId, destinationName) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${
        this.state.latitude
        },${
        this.state.longitude
        }&destination=place_id:${destinationPlaceId}&key=${apiKey}`
      );
      const json = await response.json();
      //console.log(json);
      const points = PolyLine.decode(json.routes[0].overview_polyline.points);
      const pointCoords = points.map(point => {
        return { latitude: point[0], longitude: point[1] };
      });
      this.setState({
        pointCoords,
        predictions: [],
        destination: destinationName,
        routeResponse: json
      });
      Keyboard.dismiss();
      this.map.fitToCoordinates(pointCoords, {
        edgePadding: { top: 20, bottom: 20, left: 20, right: 20 }
      });
    } catch (error) {
      console.error(error);
    }
  }

  async onChangeDestination(destination) {
    const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${apiKey}
    &input=${destination}&location=${this.state.latitude},${
      this.state.longitude
      }&radius=2000`;
    //console.log(apiUrl);
    try {
      const result = await fetch(apiUrl);
      const json = await result.json();
      this.setState({
        predictions: json.predictions
      });
      //console.log(json);
    } catch (err) {
      console.error(err);
    }
  }

  pressedPrediction(prediction) {
    console.log(prediction);
    Keyboard.dismiss();
    this.setState({
      predictions: [],
      destination: prediction.description,
      place_ID: prediction["place_id"],
      id: prediction.id
    });
    Keyboard;

  }

  submit = async () => {


    try {
      this.props.toggleIsLoadingItems(true);
      await firebase
        .database()
        .ref("Requests")
        .set({
          user: this.props.recycleItemList.user,
          item: this.props.recycleItemList.recycleCart,
          totalPrice: this.props.recycleItemList.totalPrice,
          totalWeight: this.props.recycleItemList.totalWeight,
          destination: this.state.destination,
          place_id: this.state.place_ID,
          location_id: this.state.id,

          status: "searching"
        });

      console.log("item submit")
      this.props.toggleIsLoadingItems(false);
    } catch (error) {
      console.log(error);
      this.props.toggleIsLoadingItems(false);
    }

  }

  render() {
    const predictions = this.state.predictions.map(
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
        {this.props.recycleItemList.isLoading && (
          <View
            style={{
              ...StyleSheet.absoluteFill,
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              elevation: 1000,
            }}
          >
            <ActivityIndicator size="large" color={colors.logoColor} />
          </View>
        )}

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
            placeholder="Enter your current location.."
            style={styles.destinationInput}
            onChangeText={(destination) => {
              this.setState({ destination });
              this.onChangeDestinationDebounced(destination);
            }}
            value={this.state.destination}
          />
          {predictions}

        </View>
        <View style={{
          flex: 1, bottom: 20, position: "absolute", alignSelf: "center"
        }}>
          <CustomActionButton
            style={styles.changeMode}
            title="Book A Driver Now!!"
            onPress={() => this.submit()}
          >
            <Text style={{ fontWeight: "100", color: "black" }}>
              Requesting Driver!!
            </Text>
          </CustomActionButton>
        </View>
        <SafeAreaView />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    recycleItemList: state.recycleItemList,
    currentUser: state.auth.currentUser,
    //temp: state.recycleCart,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    toggleIsLoadingItems: (bool) =>
      dispatch({ type: "TOGGLE_IS_LOADING_ITEMS", payload: bool }),
    updateOrder: () => dispatch({ type: 'UPDATE_ORDER' }),
    updateOrderWeight: (item) =>
      dispatch({ type: "UPDATE_ORDER_TOTAL_WEIGHT", payload: item }),
    updateOrderLocation: (location) =>
      dispatch({ type: "UPDATE_ORDER_LOCATION", payload: location }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CustomerMapScreen);

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
    flex: 1,
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
  changeMode: {
    width: 200,
    height: 50,
    backgroundColor: colors.logoColor,
    borderWidth: 0.5,
    borderColor: colors.bgError,
    marginBottom: 5,
    marginTop: "auto",
    alignSelf: "center"
  },
});
