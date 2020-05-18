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
  Modal,
  Alert,
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
import MapViewDirections from "react-native-maps-directions";
import _ from "lodash";
import PolyLine from "@mapbox/polyline";
import PlaidAuthenticator from "react-native-plaid-link";
const { width, height } = Dimensions.get("window");

class DriverMapScreen extends Component {
  constructor(props) {
    super(props);
    this.initialState = {
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
      isModalVisible: false,
      data: {},
      status: "LOGIN_BUTTON",
      coordinates: [],
      showComponent: false,
    };
    this.state = this.initialState;
    this.onChangeDestinationDebounced = _.debounce(
      this.onChangeDestination,
      1000
    );
    this.mapView = null;
  }

  componentDidMount() {
    //Get current location and set initial region to this
    this.findCurrentLocationAsync();

    if (this.props.recycleItemList.isOrderExist == true) {
      this.setState({
        destination: this.props.recycleItemList.location,
        locationPredictions: this.props.recycleItemList.order.prediction,
        isButtonEnabled: false,
        showComponent: true,
      });
    } else {
      Alert.alert(
        "You have not yet pick an order! Please return to the previous screen to choose one"
      );
      this.props.navigation.navigate("Pick Up Request");
    }
  }

  componentWillUnmount() {
    this.setState({
      destination: "",
      locationPredictions: [],
      isButtonEnabled: true,
      showComponent: false,
      orderStatus: 0,
      coordinates: [],
      isModalVisible: false,
    });
    console.log("DriverMapScreen is unmounted");
  }

  findCurrentLocationAsync = async () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          coordinates: [
            ...this.state.coordinates,
            {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          ],
        });
      },
      (error) => console.error(error),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 }
    );
    //console.log(JSON.stringify(location.coords));
  };

  toggleModal = () => {
    this.setState({ isModalVisible: !this.state.isModalVisible });
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
      //this.mapView.fitToCoordinates(pointCoords);
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

  pressedPrediction(prediction) {
    //console.log(prediction);
    Keyboard.dismiss();
    this.setState({
      predictions: [],
      destination: prediction.description,
      locationPredictions: prediction.description,
      isButtonEnabled: false,
      showComponent: true,
    });
    Keyboard;
  }

  submit = async () => {
    let temp = this.state.locationPredictions;
    /* this.getRouteDirections(
      temp.place_id,
      temp.structured_formatting.main_text
    ); */
    if (temp.length == 0) {
      Alert.alert(
        "You have not yet pick an order! Please return to the previous screen to choose one"
      );
      this.props.navigation.navigate("Pick Up Request");
      return;
    } else if (temp.toString() === this.state.destination) {
      this.setState({
        isButtonEnabled: true,
        coordinates: [...this.state.coordinates, temp.toString()],
      });
    } else {
      this.setState({
        isButtonEnabled: true,
        coordinates: [...this.state.coordinates, temp],
      });
    }

    let key = this.props.recycleItemList.order.key;
    try {
      //this.props.toggleIsLoadingItems(true);
      await firebase
        .database()
        .ref("Requests")
        .child(key)
        .update({
          status: 1,
          driver: this.props.recycleItemList.user,
          driverLocation: {
            latitude: this.state.latitude,
            longitude: this.state.longitude,
          },
        });
      //this.props.toggleIsLoadingItems(false);
    } catch (error) {
      console.log(error);
      this.props.toggleIsLoadingItems(false);
    }
    this.setState({ orderStatus: 1 });
  };

  onArrival = async () => {
    let key = this.props.recycleItemList.order.key;
    try {
      //this.props.toggleIsLoadingItems(true);
      await firebase
        .database()
        .ref("Requests")
        .child(key)
        .update({ status: 2 });
      //this.props.toggleIsLoadingItems(false);
    } catch (error) {
      console.log(error);
      this.props.toggleIsLoadingItems(false);
    }
    this.setState({ orderStatus: 2 });
    //console.log("Driver Has Arrived");
  };

  onPayment = async () => {
    let key = this.props.recycleItemList.order.key;
    try {
      //this.props.toggleIsLoadingItems(true);
      await firebase
        .database()
        .ref("Requests")
        .child(key)
        .update({ status: 3 });
      //this.props.toggleIsLoadingItems(false);
    } catch (error) {
      console.log(error);
      this.props.toggleIsLoadingItems(false);
    }
    this.setState({ orderStatus: 3 });
    this.toggleModal();
  };

  onComplete = async () => {
    //console.log(this.props.recycleItemList.order.user.uid);
    let uid = this.props.recycleItemList.order.user.uid;
    let order = this.props.recycleItemList.order;
    order.driver = this.props.recycleItemList.user;
    console.log(order);

    try {
      //this.props.toggleIsLoadingItems(true);
      await firebase.database().ref("History").child(uid).push(order);
      //this.props.toggleIsLoadingItems(false);
    } catch (error) {
      console.log(error);
    }

    let key = this.props.recycleItemList.order.key;
    try {
      //this.props.toggleIsLoadingItems(true);
      await firebase.database().ref("Requests").child(key).remove();
      //this.props.toggleIsLoadingItems(false);
    } catch (error) {
      console.log(error);
    }

    //this.props.deleteOrder();
    //this.props.isOrderExist(false);
    //this.setState(this.initialState);
    this.setState({
      destination: "",
      locationPredictions: [],
      isButtonEnabled: true,
      showComponent: false,
      orderStatus: 0,
      coordinates: [],
      isModalVisible: false,
    });

    //this.toggleModal();
    this.props.navigation.replace("Pick Up Request");
  };

  onLoadStart = (props) => {
    //console.log("onLoadStart", props);
    console.log("onLoadStart");
  };

  onLoad = (props) => {
    //console.log("onLoad", props);
    console.log("onLoad");
  };

  onLoadEnd = (props) => {
    //console.log("onLoadEnd", props);
    console.log("onLoadEnd");
  };

  onMessage = (data) => {
    //console.log(data)
    /*
      Response example for success
      {
        "action": "plaid_link-undefined::connected",
        "metadata": {
          "account": {
            "id": null,
            "name": null
          },
          "account_id": null,
          "public_token": "public-sandbox-e697e666-9ac2-4538-b152-7e56a4e59365",
          "institution": {
            "name": "Chase",
            "institution_id": "ins_3"
          }
        }
      }
    */

    this.setState({
      data,
      status: data.action
        .substr(data.action.lastIndexOf(":") + 1)
        .toUpperCase(),
    });
    console.log(data);
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
        key={prediction.id}
        onPress={() => this.pressedPrediction(prediction)}
      >
        <Text style={styles.locationSuggestion}>{prediction.description}</Text>
      </TouchableHighlight>
    ));

    let button;
    if (this.state.showComponent == true) {
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
      } else if (this.state.orderStatus == 1) {
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
      } else {
        button = (
          <CustomActionButton
            style={styles.onPayment}
            title="Pay Customer!!"
            onPress={() => this.onPayment()}
            disabled={false}
          >
            <Text style={styles.ItemListTitle}>Pay Your Customer</Text>
          </CustomActionButton>
        );
      }
    }

    return (
      <View style={styles.container}>
        <SafeAreaView />
        {/*
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
        */}
        <View style={styles.body}>
          <MapView
            ref={(map) => {
              this.mapView = map;
            }}
            //ref={(c) => (this.mapView = c)}
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
            {/* <Polyline
              coordinates={this.state.pointCoords}
              strokeWidth={4}
              strokeColor="red"
            />
            {marker} */}
            {this.state.coordinates.length >= 2 && (
              <MapViewDirections
                origin={this.state.coordinates[0]}
                destination={
                  this.state.coordinates[this.state.coordinates.length - 1]
                }
                apikey={apiKey}
                strokeWidth={3}
                strokeColor="hotpink"
                optimizeWaypoints={true}
                onStart={(params) => {
                  console.log(
                    `Started routing between "${params.origin}" and "${params.destination}"`
                  );
                }}
                onReady={(result) => {
                  console.log(`Distance: ${result.distance} km`);
                  console.log(`Duration: ${result.duration} min.`);

                  this.mapView.fitToCoordinates(result.coordinates, {
                    edgePadding: {
                      right: width / 20,
                      bottom: height / 20,
                      left: width / 20,
                      top: height / 20,
                    },
                  });
                }}
                onError={(errorMessage) => {
                  console.log(errorMessage);
                }}
              />
            )}
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
          <Modal visible={this.state.isModalVisible} animationType="slide">
            <SafeAreaView />
            <View style={styles.modal}>
              <View style={styles.header}>
                <TouchableOpacity
                  onPress={this.toggleModal}
                  style={{ flex: 1 }}
                >
                  <Ionicons
                    name="ios-close"
                    size={30}
                    color="white"
                    style={{ marginLeft: 10 }}
                  />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pay Customer</Text>
              </View>
              <View style={{ flex: 1 }}>
                <PlaidAuthenticator
                  onMessage={this.onMessage}
                  publicKey="ff6cf603bbdba6d15b71fbeaa5e416"
                  env="sandbox"
                  product="auth,transactions"
                  onLoad={this.onLoad}
                  onLoadStart={this.onLoadStart}
                  onLoadEnd={this.onLoadEnd}
                />
              </View>
              <View
                style={{
                  flex: 0.2,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CustomActionButton
                  style={styles.finalize}
                  title="Book A Driver Now!!"
                  onPress={() => this.onComplete()}
                >
                  <Text style={{ fontWeight: "100", color: "white" }}>
                    Complete Payment!!
                  </Text>
                </CustomActionButton>
              </View>
            </View>
            <SafeAreaView />
          </Modal>
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
    deleteOrder: () => dispatch({ type: "DELETE_ORDER" }),
    updateOrder: (order) =>
      dispatch({ type: "UPDATE_ORDER_HELLO", payload: order }),
    updateOrderWeight: (item) =>
      dispatch({ type: "UPDATE_ORDER_TOTAL_WEIGHT", payload: item }),
    orderIsPickedUp: (bool) =>
      dispatch({ type: "CHECK_IF_ORDER_IS_PICK_UP", payload: bool }),
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
  finalize: {
    width: 200,
    height: 50,
    backgroundColor: "transparent",
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
  onPayment: {
    width: 200,
    height: 50,
    backgroundColor: "blue",
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
    marginRight: 10,
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
    color: "white",
    marginStart: 10,
  },
  modal: {
    flex: 1,
    backgroundColor: colors.bgMain,
  },
});
