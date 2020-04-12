import React from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
} from "react-native";
import { render } from "react-dom";

import BottomBar from "../components/BottomBar";
import CustomTempButton from "../components/CustomTempButton";
import { Ionicons } from "@expo/vector-icons";
import colors from "../assets/colors";

class HomeScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      isSearchRecycleItem: false,
      textInputData: "",
      recycleItemList: [],
      recycleCart: [],
    };
  }

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
    console.log(newList);
    this.setState(
      (state, props) => ({
        recycleCart: [...state.recycleCart, newList],
      }),
      () => {
        console.log(this.state.recycleCart);
      }
    );
  };

  renderRecycleItemList = (item, index) => (
    <View style={{ height: 50, flexDirection: "row" }}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          paddingLeft: 5,
          paddingRight: 5,
        }}
      >
        <Text>{item}</Text>
      </View>
      <TouchableOpacity onPress={() => this.chooseItem(item, index)}>
        <View
          style={{
            width: 100,
            height: 50,
            backgroundColor: "#a5deba",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text>Add To Cart</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  render() {
    return (
      <View style={{ flex: 1 }}>
        <SafeAreaView />
        <View
          style={{
            height: 70,
            borderBottomWidth: 0.5,
            borderBottomColor: "#E9E9E9",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text> Trash Grav</Text>
        </View>

        <View style={{ flex: 1 }}>
          {this.state.isSearchRecycleItem && (
            <View style={{ height: 50, flexDirection: "row" }}>
              <TextInput
                onChangeText={(text) => this.setState({ textInputData: text })}
                style={{ flex: 1, backgroundColor: "#ececec", paddingLeft: 5 }}
                placeholder="Enter Recycling Item"
              />
              <CustomTempButton
                onPress={() => this.addRecycleItem(this.state.textInputData)}
                style={{ backgroundColor: "#a5deba" }}
              >
                <Ionicons name="ios-checkmark" color="white" size={40} />
              </CustomTempButton>
            </View>
          )}
          <FlatList
            data={this.state.recycleItemList}
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
          <CustomTempButton
            position="right"
            style={{ backgroundColor: "#CAF1DE", borderRadius: 25 }}
            onPress={this.showSearchRecycleItem}
          >
            <Text style={{ color: "white", fontSize: 30 }}>+</Text>
          </CustomTempButton>
        </View>
        <View
          style={{
            height: 70,
            borderTopWidth: 0.5,
            borderTopColor: "#E9E9E9",
            flexDirection: "row",
          }}
        >
          <BottomBar
            count={this.state.recycleItemList.length}
            title="Recycle Item List"
          />
          <BottomBar
            count={this.state.recycleCart.length}
            title="Recycle Cart"
          />
          <BottomBar title="User Profile" />
        </View>
        <SafeAreaView />
      </View>
    );
  }
}

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
  },
  headerTitle: {
    fontSize: 24,
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
    color: colors.txtWhite,
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
  addNewBookButton: {
    backgroundColor: colors.bgPrimary,
    borderRadius: 25,
  },
  addNewBookButtonText: {
    color: "white",
    fontSize: 30,
  },
  footer: {
    height: 70,
    flexDirection: "row",
    borderTopWidth: 0.5,
    borderTopColor: colors.borderColor,
  },
});

export default HomeScreen;
