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
  Button,
  Alert,
  Image,
  Modal,
} from "react-native";

import MapView, { Polyline, Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";

import CustomActionButton from "../../components/CustomTempButton";

import apiKey from "../../helpers/googleAPIkey";

import colors from "../../assets/colors";
import ItemList from "../../components/ItemList";
import { Ionicons } from "@expo/vector-icons";
import { connect } from "react-redux";
import * as firebase from "firebase/app";
import _ from "lodash";
import { snapshotToArray } from "../../helpers/firebaseHelpers";
import { normalize } from "../../helpers/fontHelper";
import { Rating } from "react-native-elements";
const { width, height } = Dimensions.get("window");

class CustomerMapScreen extends Component {
  constructor(props) {
    super(props);
    this.initialState = {
      location: null,
      errorMessage: null,
      latitude: 0,
      longitude: 0,
      destination: "",
      predictions: [],
      pointCoords: [],
      routeResponse: {},
      lookingForDriver: false,
      customerLocation: [],
      driverLocation: {},
      isButtonEnabled: true,
      serverID: "",
      driverResponse: [],
      orderStatus: 0,
      isModalVisible: false,
      driverRating: 1,
      showComponent: false,
      coordinates: [],
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
    this.listenforUpdate();
  }

  componentWillUnmount() {
    firebase.database().ref("Requests").off();
  }

  toggleModal = () => {
    this.setState({ isModalVisible: !this.state.isModalVisible });
  };

  ratingCompleted = (rating) => {
    console.log("Rating is: " + rating);
    this.setState({ driverRating: rating });
  };

  listenforUpdate = async () => {
    let temp;
    try {
      const response = firebase
        .database()
        .ref("Requests")
        .on("child_changed", (snapshot) => {
          console.log("User data: ", snapshot.key);
          if (snapshot.key === this.state.serverID) {
            temp = snapshot.val();
            if (temp.status == 1) {
              this.setState({
                orderStatus: 1,
                driverResponse: temp.driver,
                driverLocation: temp.driverLocation,
                coordinates: [...this.state.coordinates, temp.driverLocation],
              });
              this.props.toggleIsLoadingItems(false);
              return Alert.alert(
                "Driver " +
                  temp.driver.first_name +
                  " is on the way to get your trash"
              );
            } else if (temp.status == 2) {
              this.setState({
                orderStatus: 2,
              });
              return Alert.alert(
                "Driver " +
                  temp.driver.first_name +
                  " has arrived to your location"
              );
            } else if (temp.status == 3) {
              this.setState({ isModalVisible: true });
            }
          }
        });
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  findCurrentLocationAsync = async () => {
    this.props.toggleIsLoadingItems(true);
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
    this.props.toggleIsLoadingItems(false);
  };

  async getRouteDirections(destinationPlaceId, destinationName) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${this.state.latitude},${this.state.longitude}&destination=place_id:${destinationPlaceId}&key=${apiKey}`
      );
      const json = await response.json();
      //console.log(json);
      const points = PolyLine.decode(json.routes[0].overview_polyline.points);
      const pointCoords = points.map((point) => {
        return { latitude: point[0], longitude: point[1] };
      });
      this.setState({
        pointCoords,
        predictions: [],
        destination: destinationName,
        routeResponse: json,
      });
      Keyboard.dismiss();
      this.map.fitToCoordinates(pointCoords, {
        edgePadding: { top: 20, bottom: 20, left: 20, right: 20 },
      });
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
        showComponent: true,
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
      customerLocation: prediction.description,
      isButtonEnabled: false,
      showComponent: true,
    });
    Keyboard;
  }

  useCurrentLocation() {
    this.setState({
      predictions: [],
      destination: "Use Current Location",
      customerLocation: {
        latitude: this.state.latitude,
        longitude: this.state.longitude,
      },
      isButtonEnabled: false,
      showComponent: true,
    });
  }

  submit = async () => {
    this.setState({ isButtonEnabled: true });
    console.log(this.state.customerLocation);
    try {
      this.props.toggleIsLoadingItems(true);
      const response = await firebase.database().ref("Requests").push({
        user: this.props.recycleItemList.user,
        item: this.props.recycleItemList.recycleCart,
        totalPrice: this.props.recycleItemList.totalPrice,
        totalWeight: this.props.recycleItemList.totalWeight,
        destination: this.state.destination,
        prediction: this.state.customerLocation,
        paymentMethod: "Cash",
        status: 0,
      });

      let t;
      if (response) {
        t = JSON.stringify(response);
        let n = t.lastIndexOf("/");
        let l = t.length;
        t = t.slice(n + 1, l - 1);
        //console.log(t);
        //console.log(response);
      }

      this.setState({ serverID: t });
      //console.log(this.state.serverID);
    } catch (error) {
      console.log(error);
      this.props.toggleIsLoadingItems(false);
    }
  };

  onComplete = async () => {
    let uid = this.state.driverResponse.uid;
    let currentRating = this.state.driverResponse.rating.average;
    let no = this.state.driverResponse.rating.noOfCust;
    currentRating = (currentRating + this.state.driverRating) / 2;
    try {
      //this.props.toggleIsLoadingItems(true);
      await firebase
        .database()
        .ref("Users")
        .child(uid)
        .update({ rating: { average: currentRating, noOfCust: no + 1 } });
      //this.props.toggleIsLoadingItems(false);
    } catch (error) {
      console.log(error);
    }
    this.setState(this.initialState);
    this.props.deleteOrder();
    this.props.navigation.navigate("Recycle Item List");
    //console.log("Complete Request");
  };

  render() {
    const predictions = this.state.predictions.map((prediction) => (
      <TouchableHighlight
        key={prediction.id}
        onPress={() => this.pressedPrediction(prediction)}
      >
        <Text style={styles.locationSuggestion}>{prediction.description}</Text>
      </TouchableHighlight>
    ));
    let component;
    if (this.state.showComponent == true) {
      if (this.state.orderStatus == 0) {
        component = (
          <TouchableOpacity
            style={styles.changeMode}
            title="Book A Driver Now!!"
            onPress={() => this.submit()}
            disabled={this.state.isButtonEnabled}
          >
            <Text style={styles.ItemListTitle}>Request</Text>
          </TouchableOpacity>
        );
      } else {
        component = (
          <View style={styles.component}>
            {this.state.driverResponse.image ? (
              <Image
                source={{ uri: this.state.driverResponse.image }}
                style={styles.image}
                // indicator={ProgressPie}
                indicatorProps={{
                  size: 40,
                  borderWidth: 0,
                  color: colors.logoColor,
                  unfilledColor: "rgba(200,200,200,0.2)",
                }}
                imageStyle={{ borderRadius: 35 }}
              />
            ) : (
              <Image
                source={require("../../assets/icon.png")}
                style={styles.image}
              />
            )}
            {this.state.driverResponse.first_name ? (
              <View style={styles.ItemListTitleContainer}>
                <Text style={styles.ItemListTitle}>
                  Driver Name: {this.state.driverResponse.first_name}{" "}
                  {this.state.driverResponse.last_name}
                </Text>
                <Text style={styles.ItemListTitle}>
                  {" "}
                  Driver Phone: {this.state.driverResponse.phone}
                </Text>
              </View>
            ) : (
              <View style={styles.ItemListTitleContainer}>
                <Text style={styles.ItemListTitle}>
                  Error: cannot load Driver Detail
                </Text>
              </View>
            )}
          </View>
        );
      }
    }

    let marker = null;

    if (this.state.coordinates.length >= 2) {
      marker = this.state.coordinates.map((coordinate, index) => (
        <MapView.Marker key={`coordinate_${index}`} coordinate={coordinate} />
      ));
    }

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
        <View style={{ flex: 1 }}>
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
            ref={(c) => (this.mapView = c)}
          >
            {marker}
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
              placeholder="Enter your current location.."
              style={styles.destinationInput}
              onChangeText={(destination) => {
                this.setState({ destination });
                this.onChangeDestinationDebounced(destination);
              }}
              value={this.state.destination}
            />
            {predictions}
            <TouchableOpacity
              style={styles.currentLocation}
              title="Use My Current Location"
              onPress={() => this.useCurrentLocation()}
            >
              <Ionicons name="ios-navigate" size={30} color="white" />
            </TouchableOpacity>
          </View>
          <View
            style={{
              flex: 1,
              bottom: 20,
              position: "absolute",
              alignSelf: "center",
            }}
          >
            {component}
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
                <Text style={styles.headerTitle}>Rate Your Driver !!</Text>
              </View>
              <View style={{ flex: 1, flexDirection: "row" }}>
                <View
                  style={
                    (styles.ItemListTitleContainer, { alignItems: "center" })
                  }
                >
                  <Text
                    style={{
                      fontWeight: "100",
                      fontSize: 35,
                      color: "white",
                      marginStart: 10,
                    }}
                  >
                    Please rate your experience with{" "}
                    {this.state.driverResponse.first_name}
                  </Text>

                  <Image
                    source={{ uri: this.state.driverResponse.image }}
                    style={styles.imageModal}
                    // indicator={ProgressPie}
                    indicatorProps={{
                      size: 40,
                      borderWidth: 0,
                      color: colors.logoColor,
                      unfilledColor: "rgba(200,200,200,0.2)",
                    }}
                    imageStyle={{ borderRadius: 35 }}
                  />
                  <Text style={styles.modalWord}>
                    Driver Name: {this.state.driverResponse.first_name}{" "}
                    {this.state.driverResponse.last_name}
                  </Text>
                  <Text style={styles.modalWord}>
                    {" "}
                    Driver Phone: {this.state.driverResponse.phone}
                  </Text>

                  <Rating
                    ratingCount={5}
                    imageSize={60}
                    showRating
                    fractions={1}
                    //startingValue={this.state.driverResponse.rating.average}
                    onFinishRating={(rating) =>
                      this.setState({ driverRating: rating })
                    }
                  />
                </View>
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
                    Complete Request
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
    toggleIsLoadingItems: (bool) =>
      dispatch({ type: "TOGGLE_IS_LOADING_ITEMS", payload: bool }),
    updateOrder: () => dispatch({ type: "UPDATE_ORDER" }),
    updateOrderWeight: (item) =>
      dispatch({ type: "UPDATE_ORDER_TOTAL_WEIGHT", payload: item }),
    updateOrderLocation: (location) =>
      dispatch({ type: "UPDATE_ORDER_LOCATION", payload: location }),
    deleteOrder: () => dispatch({ type: "DELETE_ORDER" }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CustomerMapScreen);

const heightN = Dimensions.get("screen").height;
const height_image = heightN * 0.5 * 0.5;

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
    padding: normalize(10),
    fontSize: 18,
    borderWidth: 0.5,
  },
  changeMode: {
    width: normalize(200),
    height: normalize(50),
    backgroundColor: colors.logoColor,
    borderWidth: 0.5,
    borderRadius: normalize(10),
    borderColor: colors.bgError,
    marginBottom: 5,
    marginTop: "auto",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    height: 70,
    width: 70,
    marginLeft: 10,
    borderRadius: 35,
  },
  component: {
    flex: 1,
    width: Dimensions.get("window").width,
    minHeight: 100,
    flexDirection: "row",
    backgroundColor: "#fbfbf1",
    alignItems: "center",
    borderWidth: 0.15,
    borderRadius: 10,
    padding: 10,
  },
  ItemListTitleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 5,
  },
  ItemListTitle: {
    fontWeight: "100",
    fontSize: 20,
    color: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    flex: 1,
    backgroundColor: colors.bgMain,
  },
  imageModal: {
    width: height_image,
    height: height_image,
    alignSelf: "center",
    borderWidth: 5,
    borderColor: "grey",
    borderRadius: 30,
  },
  modalWord: {
    fontWeight: "100",
    fontSize: 20,
    color: "white",
    marginStart: 10,
    padding: 10,
    margin: 10,
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
  modalInput: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: "grey",
    height: height_image * 0.5,
    marginTop: 20,
    marginLeft: 5,
    marginRight: 5,
    padding: 5,
    backgroundColor: "white",
    width: "100",
  },
  textInputContainer: {
    flex: 1,
    margin: 20,
  },
  currentLocation: {
    width: 30,
    height: 30,
    backgroundColor: colors.logoColor,
    borderWidth: 0.5,
    borderColor: colors.bgError,
    marginRight: 15,
    marginTop: 15,
    alignSelf: "flex-end",
    alignItems: "center",
    justifyContent: "center",
  },
});
