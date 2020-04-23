import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
} from "react-native";
import { render } from "react-dom";

import BottomBar from "../components/BottomBar";
import CustomTempButton from "../components/CustomTempButton";
import ListItem from "../components/ItemList";
import { snapshotToArray } from "../helpers/firebaseHelpers";
import { Ionicons } from "@expo/vector-icons";
import colors from "../assets/colors";

import { connect } from "react-redux";
import { compose } from "redux";
//import { connectActionSheet } from "@expo/react-native-action-sheet";

import * as firebase from "firebase/app";
import "firebase/storage";

class HomeScreen extends Component {
  constructor() {
    super();
    this.state = {
      isSearchRecycleItem: false,
      textInputData: "",
      recycleItemList: [],
      recycleCart: [],
      currentUser: {},
    };
  }

  componentDidMount = async () => {
    const user = this.props.currentUser;

    //const { navigation } = this.props;
    //const user = navigation.getParam("user");

    const currentUserData = await firebase
      .database()
      .ref("Users")
      .child(user.uid)
      .once("value");

    const recycleItems = await firebase.database().ref("Items").once("value");
    const recycleItemsArray = snapshotToArray(recycleItems);

    this.setState({
      currentUser: currentUserData.val(),
      recycleItemList: recycleItemsArray,
    });

    this.props.loadUser(currentUserData.val());
    this.props.loadRecycleItem(recycleItemsArray);
    //console.log(currentUserData.val());
    //console.log(this.props.user);
  };

  showSearchRecycleItem = () => {
    this.setState({ isSearchRecycleItem: true });
  };

  hideSearchRecycleItem = () => {
    this.setState({ isSearchRecycleItem: false });
  };

  addRecycleItem = (item) => {
    this.setState(
      (state, props) => ({
        recycleItemList: [...state.recycleItemList, item],
      }),
      () => {
        console.log(this.state.recycleItemList);
      }
    );
  };

  chooseItem = (selectedItem, index) => {
    let newList = this.state.recycleItemList.filter(
      (recycleItem) => recycleItem == selectedItem
    );

    //console.log(newList[0]);

    this.props.moveItemToCart(newList[0]);
    //console.log(this.state.recycleCart);
  };

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
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Search Recycle Items"
              placeholderTextColor={colors.txtPlaceholder}
              onChangeText={(text) => this.setState({ textInputData: text })}
              ref={(component) => {
                this.textInputRef = component;
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
              <View style={{ marginTop: 50, alignItems: "center" }}>
                <Text style={{ fontWeight: "bold" }}>
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

        <SafeAreaView />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    recycleItemList: state.recycleItemList,
    currentUser: state.auth.currentUser,
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
  };
};

//export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);

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
});
