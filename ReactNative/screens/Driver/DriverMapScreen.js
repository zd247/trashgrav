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
  ActivityIndicator,
} from "react-native";

import * as Location from "expo-location";

import CustomActionButton from "../../components/CustomTempButton";
import ItemList from "../../components/ItemList";
import colors from "../../assets/colors";

import apiKey from "../../helpers/googleAPIkey";
import * as firebase from "firebase/app";
import { Ionicons } from "@expo/vector-icons";
import { connect } from "react-redux";
import MapView, { Polyline, Marker } from "react-native-maps";
import _ from "lodash";
import PolyLine from "@mapbox/polyline";

class DriverMapScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      location: null,
      errorMessage: null,
      latitude: 0,
      longitude: 0,
      locationPredictions: [],
      destination: "",
      predictions: [],
      pointCoords: [],
      order: [],
      isButtonEnabled: true,
      orderStatus: 0,
    };
    this.onChangeDestinationDebounced = _.debounce(
      this.onChangeDestination,
      1000
    );
  }

  componentDidMount() {
    //Get current location and set initial region to this
    this.findCurrentLocationAsync();

    if (this.props.recycleItemList.order) {
      this.setState({
        destination: this.props.recycleItemList.location,
        locationPredictions: this.props.recycleItemList.order.prediction,
        isButtonEnabled: false,
      });
    }
  }

  findCurrentLocationAsync = async () => {
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
    //console.log(JSON.stringify(location.coords));
  };

  async getRouteDirections(destinationPlaceId, destinationName) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${this.state.latitude},${this.state.longitude}&destination=place_id:${destinationPlaceId}&key=${apiKey}`
      );
      const json = await response.json();
      //console.log("route Direction" + JSON.stringify(json));
      const points = PolyLine.decode(json.routes[0].overview_polyline.points);
      const pointCoords = points.map((point) => {
        return { latitude: point[0], longitude: point[1] };
      });
      this.setState({
        pointCoords,
        predictions: [],
        destination: destinationName,
      });
      Keyboard.dismiss();
      //console.log(pointCoords);
      this.map.fitToCoordinates(pointCoords);
    } catch (error) {
      console.error(error);
    }
  }

  async onChangeDestination(destination) {
    const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${apiKey}
    &input=${destination}&location=${this.state.latitude},${this.state.longitude}&radius=2000`;
    //console.log(apiUrl);
    try {
      const result = await fetch(apiUrl);
      const json = await result.json();
      this.setState({
        predictions: json.predictions,
      });
      //console.log(json);
    } catch (err) {
      console.error(err);
    }
  }

  submit = async () => {
    let temp = this.state.locationPredictions;
    this.getRouteDirections(
      temp.place_id,
      temp.structured_formatting.main_text
    );
    this.setState({ isButtonEnabled: true });
    let key = this.props.recycleItemList.order.key;
    try {
      this.props.toggleIsLoadingItems(true);
      await firebase
        .database()
        .ref("Requests")
        .child(key)
        .update({ status: 1, driver: this.props.recycleItemList.user });
      this.props.toggleIsLoadingItems(false);
    } catch (error) {
      console.log(error);
      this.props.toggleIsLoadingItems(false);
    }
    this.setState({ orderStatus: 1 });
  };

  onArrival = async () => {
    let key = this.props.recycleItemList.order.key;
    try {
      this.props.toggleIsLoadingItems(true);
      await firebase
        .database()
        .ref("Requests")
        .child(key)
        .update({ status: 2 });
      this.props.toggleIsLoadingItems(false);
    } catch (error) {
      console.log(error);
      this.props.toggleIsLoadingItems(false);
    }
    console.log("Driver Has Arrived");
  };

  render() {
    let marker = null;

    if (this.state.pointCoords.length > 1) {
      marker = (
        <Marker
          coordinate={this.state.pointCoords[this.state.pointCoords.length - 1]}
        />
      );
    }

    const predictions = this.state.predictions.map((prediction) => (
      <TouchableHighlight
        onPress={() =>
          this.getRouteDirections(
            prediction.place_id,
            prediction.structured_formatting.main_text
          )
        }
        key={prediction.id}
      >
        <View>
          <Text style={styles.suggestions}>
            {prediction.structured_formatting.main_text}
          </Text>
        </View>
      </TouchableHighlight>
    ));

    let button;
    if (this.state.orderStatus == 0) {
      button = (
        <CustomActionButton
          style={styles.changeMode}
          title="Navigation to Customer now!!"
          onPress={() => this.submit()}
          disabled={this.state.isButtonEnabled}
        >
          <Text style={styles.ItemListTitle}>Navigate to Customer</Text>
        </CustomActionButton>
      );
    } else {
      button = (
        <CustomActionButton
          style={styles.onArrival}
          title="Driver Has Arrived!!"
          onPress={() => this.onArrival()}
          disabled={false}
        >
          <Text style={styles.ItemListTitle}>Driver Has Arrived</Text>
        </CustomActionButton>
      );
    }
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
          <Text style={styles.headerTitle}>Driver Screen</Text>
        </View>
        <View style={styles.body}>
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
            ref={(map) => {
              this.map = map;
            }}
            style={styles.mapStyle}
            provider="google"
            region={{
              latitude: this.state.latitude,
              longitude: this.state.longitude,
              latitudeDelta: 0.015,
              longitudeDelta: 0.0121,
            }}
            showsUserLocation={true}
          >
            <Polyline
              coordinates={this.state.pointCoords}
              strokeWidth={4}
              strokeColor="red"
            />
            {marker}
          </MapView>
          <View style={{ flex: 1, position: "absolute" }}>
            <TextInput
              placeholder="Enter destination..."
              style={styles.destinationInput}
              value={this.state.destination}
              clearButtonMode="always"
              onChangeText={(destination) => {
                this.setState({ destination });
                this.onChangeDestinationDebounced(destination);
              }}
            />
            {predictions}
          </View>
          <View
            style={{
              flex: 1,
              bottom: 20,
              position: "absolute",
              alignSelf: "center",
            }}
          >
            {button}
          </View>
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
    loadUser: (user) =>
      dispatch({
        type: "LOAD_USER_FROM_SERVER",
        payload: user,
      }),
    toggleIsLoadingItems: (bool) =>
      dispatch({ type: "TOGGLE_IS_LOADING_ITEMS", payload: bool }),
    deleteItem: (item) =>
      dispatch({ type: "REMOVE_RECYCLE_ITEMS_FROM_CART", payload: item }),
    updateOrder: (order) => dispatch({ type: "UPDATE_ORDER", payload: order }),
    updateOrderWeight: (item) =>
      dispatch({ type: "UPDATE_ORDER_TOTAL_WEIGHT", payload: item }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DriverMapScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: colors.bgMain,
  },
  changeMode: {
    width: 200,
    height: 50,
    backgroundColor: colors.logoColor,
    borderWidth: 0.5,
    borderColor: colors.bgError,
    marginBottom: 5,
    marginTop: "auto",
    alignSelf: "center",
    justifyContent: "center",
  },
  onArrival: {
    width: 200,
    height: 50,
    backgroundColor: "orange",
    borderWidth: 0.5,
    borderColor: colors.bgError,
    marginBottom: 5,
    marginTop: "auto",
    alignSelf: "center",
    justifyContent: "center",
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
  suggestions: {
    backgroundColor: "white",
    padding: 5,
    fontSize: 18,
    borderWidth: 0.5,
    marginLeft: 5,
    marginRight: 5,
  },
  ItemListTitle: {
    fontWeight: "100",
    fontSize: 22,
    color: "black",
    marginStart: 10,
  },
});
