import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Modal,
  Button,
  Alert,
} from "react-native";
import { render } from "react-dom";

import BottomBar from "../components/BottomBar";
import CustomActionButton from "../components/CustomTempButton";
import ListItem from "../components/ItemList";
import OrderSummary from "../components/OrderSummary"
import { snapshotToArray } from "../helpers/firebaseHelpers";
import { Ionicons } from "@expo/vector-icons";
import colors from "../assets/colors";

import { connect } from 'react-redux'
import { compose } from 'redux'
//import { connectActionSheet } from "@expo/react-native-action-sheet";

import * as firebase from 'firebase/app'
import 'firebase/storage'


class HomeScreen extends Component {
  constructor() {
    super();
    this.state = {
      isSearchRecycleItem: false,
      textInputData: "",
      recycleItemList: [],
      recycleCart: [],
      currentUser: {},
      isModalVisible: false,
      isModalVisible2: false,
      totalWeight: 0,
      totalPrice: 0,
      tempInt: 1,
    };
  }

  componentDidMount = async () => {
    const user = this.props.currentUser

    //const { navigation } = this.props;
    //const user = navigation.getParam("user");

    const currentUserData = await firebase
      .database()
      .ref('Users')
      .child(user.key)
      .once('value')

    const recycleItems = await firebase.database().ref('Items').once('value')
    const recycleItemsArray = snapshotToArray(recycleItems)

    let temp = currentUserData.val()
    delete temp["password"];

    //console.log(temp)
    this.setState({
      currentUser: temp,
      recycleItemList: recycleItemsArray,
    });

    this.props.loadUser(temp);
    this.props.loadRecycleItem(recycleItemsArray);

    //console.log(this.props.recycleItemList.user);
  };

  showSearchRecycleItem = () => {
    this.setState({ isSearchRecycleItem: true })
  }

  hideSearchRecycleItem = () => {
    this.setState({ isSearchRecycleItem: false });

  };

  toggleModal = () => {
    this.setState({ isModalVisible: !this.state.isModalVisible });

  };

  toggleModal2 = () => {
    this.setState({ isModalVisible2: !this.state.isModalVisible2 });

  };

  addRecycleItem = item => {
    this.setState(
      (state, props) => ({
        recycleItemList: [...state.recycleItemList, item],
      }),
      () => {
        console.log(this.state.recycleItemList)
      }
    )
  }

  chooseItem = (selectedItem, index) => {

    let newList = this.state.recycleItemList.filter(
      (recycleItem) => recycleItem.key == selectedItem.key
    );

    let tempList = this.props.recycleItemList.recycleCart.filter(
      (recycleItem) => recycleItem.key == selectedItem.key
    );

    if (tempList.length > 0) {
      return Alert.alert("This Item already exist in the cart")
    }



    delete newList[0].description;
    newList[0].weight = this.state.tempInt;



    var interger = 0;
    if (typeof newList[0].price === "string") {
      interger = parseInt(newList[0].price, 10);
      newList[0].price = interger;
    }

    //console.log(newList)
    console.log(newList[0]);
    //console.log(this.state.recycleItemList)
    this.props.moveItemToCart(newList[0]);

  };

  removeItem = (selectedItem, index) => {
    let newList = this.props.recycleItemList.recycleCart.filter(
      (recycleItem) => recycleItem !== selectedItem
    );

    let tempList = this.props.recycleItemList.recycleCart.filter(
      (recycleItem) => recycleItem == selectedItem
    );


    //console.log(tempList);
    //console.log(newList);

    this.props.deleteItem(tempList[0]);
    //console.log(this.state.recycleCart);
  };

  componentWillUnmount = () => {
    console.log('[HomeScreen] component umounted')
  }

  renderRecycleItemList = (item, index) => (
    <ListItem item={item}>
      <TouchableOpacity
        style={{ paddingRight: 20 }}
        onPress={() => this.chooseItem(item, index)}
      >
        <View style={styles.addingButton}>
          <Text>Add To Cart</Text>
        </View>
      </TouchableOpacity>

    </ListItem>
  );

  renderOrderSummary = (item, index) => (
    <OrderSummary item={item}>
      <TextInput
        style={styles.orderInput}
        placeholder={"Current Weight: " + JSON.stringify(item.weight)}
        placeholderTextColor="black"
        onChangeText={(text) => { item.weight = text }}
        keyboardType='phone-pad'
        ref={(component) => {
          this.textInputRef = component;
        }}
      />
      <TouchableOpacity
        style={{ paddingRight: 20 }}
        onPress={() => this.removeItem(item, index)}
      >
        <Ionicons
          name="ios-remove"
          size={30}
          color="white"
          style={{ marginLeft: 10 }}
        />
      </TouchableOpacity>

    </OrderSummary>
  );

  requestDriver = () => {

    var i;
    var tempWeight = 0;
    var interger = 0;
    let tempList = this.props.recycleItemList.recycleCart;
    for (i = 0; i < tempList.length; i++) {
      if (typeof tempList[i].weight === "string") {
        interger = parseInt(tempList[i].weight, 10);
        tempList[i].weight = interger;
      }
      tempWeight += tempList[i].weight;
    }
    if (tempWeight > 5) {
      return Alert.alert("The total weight cannot be heavier than 5 kg. Please remove some of your item in the cart or decrease its weight value")
    }

    this.setState({ isModalVisible: false });
    this.props.updateOrderWeight(tempWeight)
    //console.log(tempWeight)
    //this.props.updateOrder()
    //console.log(JSON.stringify(this.props.recycleItemList.order))
    this.props.navigation.navigate("CustomerMapScreen")
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
          <Text style={styles.headerTitle}>
            Welcome {this.props.recycleItemList.user.first_name} !!
          </Text>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate("CustomerMapScreen")}
            style={{ marginRight: 15 }}
          >
            <Ionicons
              name="ios-map"
              size={30}
              color="white"
              style={{ marginLeft: 10 }}
            />
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder='Search Recycle Items'
              placeholderTextColor={colors.txtPlaceholder}
              onChangeText={text => this.setState({ textInputData: text })}
              ref={component => {
                this.textInputRef = component
              }}
            />
          </View>
          <FlatList
            data={this.props.recycleItemList.recycleItemList}
            renderItem={({ item, index }) =>
              this.renderRecycleItemList(item, index)
            }
            keyExtractor={(item, index) => index.toString()}
            ListEmptyComponent={
              <View style={{ marginTop: 50, alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold' }}>
                  No Recycle Item Currently Exist In this List
								</Text>
              </View>
            }
          />

          {/*<CustomTempButton
            position="right"
            style={{ backgroundColor: "#CAF1DE", borderRadius: 25 }}
            onPress={this.showSearchRecycleItem}
          >
            <Text style={{ color: "white", fontSize: 30 }}>+</Text>
          </CustomTempButton> */}
        </View>
        <View
          style={{ flex: 0.1, alignItems: "center", justifyContent: "center" }}
        >
          <CustomActionButton
            style={styles.changeMode}
            title="Book A Driver Now!!"
            onPress={this.toggleModal}
          >
            <Text style={{ fontWeight: "100", color: "white" }}>
              Check Out Now!!
            </Text>
          </CustomActionButton>
          {/* Modal Start here */}
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
                <Text style={styles.headerTitle}>
                  Order Summary !!
                </Text>
              </View>
              <View style={{ flex: 1 }}>

                <FlatList
                  data={this.props.recycleItemList.recycleCart}
                  renderItem={({ item, index }) =>
                    this.renderOrderSummary(item, index)
                  }
                  keyExtractor={(item, index) => index.toString()}
                  ListEmptyComponent={
                    <View style={{ marginTop: 50, alignItems: "center" }}>
                      <Text style={{ fontWeight: "bold" }}>
                        No Recycle Item Currently Exist In this List
                      </Text>
                    </View>
                  }
                />
              </View>
              <View
                style={{ flex: 0.2, alignItems: "center", justifyContent: "center" }}
              >
                <Text position="left" style={styles.orderSummary}>Total Weight: {this.props.recycleItemList.totalWeight} Kg</Text>
                <Text style={styles.orderSummary}>Total Price: ${this.props.recycleItemList.totalPrice}</Text>
                <CustomActionButton
                  style={styles.requestButton}
                  title="Book A Driver Now!!"
                  onPress={this.requestDriver}
                >
                  <Text style={{ fontWeight: "100", color: "white" }}>
                    Request A Driver Now
                  </Text>
                </CustomActionButton>
              </View>

            </View>
            <SafeAreaView />
          </Modal>
        </View>


        <SafeAreaView />
      </View>
    )
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
    loadRecycleItem: (recycleItemList) =>
      dispatch({
        type: "LOAD_RECYCLE_ITEMS_FROM_SERVER",
        payload: recycleItemList,
      }),
    loadUser: (user) =>
      dispatch({
        type: "LOAD_USER_FROM_SERVER",
        payload: user,
      }),
    moveItemToCart: (item) =>
      dispatch({ type: "ADD_RECYCLE_ITEMS_TO_CART", payload: item }),
    toggleIsLoadingItems: (bool) =>
      dispatch({ type: "TOGGLE_IS_LOADING_ITEMS", payload: bool }),
    deleteItem: (item) =>
      dispatch({ type: "REMOVE_RECYCLE_ITEMS_FROM_CART", payload: item }),
    updateOrder: () => dispatch({ type: 'UPDATE_ORDER' }),
    updateOrderWeight: (item) =>
      dispatch({ type: "UPDATE_ORDER_TOTAL_WEIGHT", payload: item }),
  };
};

const mapDispatchToProps = dispatch => {
  return {
    loadRecycleItem: recycleItemList =>
      dispatch({
        type: 'LOAD_RECYCLE_ITEMS_FROM_SERVER',
        payload: recycleItemList,
      }),
    loadUser: user =>
      dispatch({
        type: 'LOAD_USER_FROM_SERVER',
        payload: user,
      }),
    moveItemToCart: item =>
      dispatch({ type: 'ADD_RECYCLE_ITEMS_TO_CART', payload: item }),
    toggleIsLoadingItems: bool =>
      dispatch({ type: 'TOGGLE_IS_LOADING_ITEMS', payload: bool }),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgMain,
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
  textInputContainer: {
    height: 50,
    flexDirection: "row",
    margin: 5,
  },
  textInput: {
    flex: 1,
    backgroundColor: "transparent",
    borderColor: colors.listItemBg,
    borderBottomWidth: 5,
    fontSize: 22,
    fontWeight: "200",
    color: "white",
  },
  checkmarkButton: {
    backgroundColor: colors.bgSuccess,
  },
  listEmptyComponent: {
    marginTop: 50,
    alignItems: "center",
  },
  listEmptyComponentText: {
    fontWeight: "bold",
  },
  markAsReadButton: {
    width: 100,
    backgroundColor: colors.bgSuccess,
  },
  markAsReadButtonText: {
    fontWeight: "bold",
    color: "white",
  },
  footer: {
    height: 70,
    flexDirection: "row",
    borderTopWidth: 0.5,
    borderTopColor: colors.borderColor,
    color: "white",
  },
  listItemContainer: {
    minHeight: 100,
    flexDirection: "row",
    backgroundColor: "white",
    alignItems: "center",
  },
  imageContainer: {
    height: 70,
    width: 70,
    marginLeft: 10,
  },
  addingButton: {
    width: 100,
    height: 50,
    backgroundColor: "#a5deba",
    alignItems: "center",
    justifyContent: "center",
  },
  changeMode: {
    width: 200,
    height: 50,
    backgroundColor: "transparent",
    borderWidth: 0.5,
    borderColor: colors.bgError,
    marginBottom: 5,
  },
  modal: {
    flex: 1,

    backgroundColor: colors.bgMain,
  },
  orderInput: {
    //flex: 1,
    backgroundColor: "transparent",
    borderColor: colors.listItemBg,
    padding: 5,
    fontSize: 20,
    fontWeight: "100",
    color: "black",
  },
  orderSummary: {
    //flex: 1,
    backgroundColor: "transparent",
    borderColor: colors.listItemBg,
    padding: 5,
    fontSize: 20,
    fontWeight: "100",
    color: "white",
  },
  requestButton: {

    width: 200,
    height: 50,
    backgroundColor: "transparent",
    borderWidth: 0.5,
    borderColor: colors.bgError,
    margin: 5,
  },
});
