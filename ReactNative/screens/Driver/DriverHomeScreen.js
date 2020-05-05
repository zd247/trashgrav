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
  RefreshControl,
} from "react-native";

import Constants from "expo-constants";
import * as Location from "expo-location";

import CustomActionButton from "../../components/CustomTempButton";
import DriverOrderList from "../../components/DriverOrderList";
import colors from "../../assets/colors";

import apiKey from "../../helpers/googleAPIkey";
import * as firebase from "firebase/app";
import { snapshotToArray } from "../../helpers/firebaseHelpers";

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
      order: [],
      destination: "",
      refreshing: false,
    };
  }

  componentDidMount() {
    this.loadInitialOrder();
  }

  loadInitialOrder = async () => {
    const orders = await firebase.database().ref("Requests").once("value");
    const ordersArray = snapshotToArray(orders);

    let tempArray = [];
    ordersArray.forEach((child) => {
      if (child.status == 0) {
        tempArray.push(child);
      }
    });
    // console.log(tempArray);

    this.setState({ order: tempArray });
  };

  updateOrder = async () => {
    this.setState({ refreshing: true });
    const orders = await firebase.database().ref("Requests").once("value");
    const ordersArray = snapshotToArray(orders);

    let tempArray = [];
    ordersArray.forEach((child) => {
      if (child.status == 0) {
        tempArray.push(child);
      }
    });
    // console.log(tempArray);

    this.setState({ order: tempArray });
    this.setState({ refreshing: false });
  };

  chooseOrder = (selectedItem, index) => {
    let tempLocation = selectedItem.destination;
    console.log(selectedItem);
    this.props.updateOrderLocation(tempLocation);
    this.props.updateOrderHello(selectedItem);
    this.props.navigation.navigate("Driver Map Screen");
  };

  renderOrder = (item, index) => (
    <DriverOrderList item={item}>
      <TouchableOpacity
        style={{ paddingRight: 10 }}
        onPress={() => this.chooseOrder(item, index)}
      >
        <View style={styles.addingButton}>
          <Text>Pick Order</Text>
        </View>
      </TouchableOpacity>
    </DriverOrderList>
  );

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
        <View style={{ flex: 1 }}>
          <FlatList
            data={this.state.order}
            renderItem={({ item, index }) => this.renderOrder(item, index)}
            keyExtractor={(item, index) => index.toString()}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this.updateOrder}
              />
            }
            ListEmptyComponent={
              <View style={{ marginTop: 50, alignItems: "center" }}>
                <Text style={{ fontWeight: "bold" }}>
                  No Recycle Item Currently Exist In this List
                </Text>
              </View>
            }
          />
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
    updateOrderHello: (order) =>
      dispatch({ type: "UPDATE_ORDER_HELLO", payload: order }),
    updateOrderWeight: (item) =>
      dispatch({ type: "UPDATE_ORDER_TOTAL_WEIGHT", payload: item }),
    updateOrderLocation: (location) =>
      dispatch({ type: "UPDATE_ORDER_LOCATION", payload: location }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DriverHomeScreen);

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
  addingButton: {
    width: 100,
    height: 50,
    backgroundColor: "#a5deba",
    alignItems: "center",
    justifyContent: "center",
  },
});
