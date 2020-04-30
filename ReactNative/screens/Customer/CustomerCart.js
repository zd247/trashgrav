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

import CustomActionButton from "../../components/CustomTempButton";

import colors from "../../assets/colors";
import ItemList from "../../components/ItemList";
import { Ionicons } from "@expo/vector-icons";
import { connect } from "react-redux";

class CustomerCart extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

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

  renderRecycleItemList = (item, index) => (
    <ItemList item={item}>
      <TouchableOpacity
        style={{ paddingRight: 20 }}
        onPress={() => this.removeItem(item, index)}
      >
        <View style={styles.removingButton}>
          <Text>Remove From Cart</Text>
        </View>
      </TouchableOpacity>
    </ItemList>
  );

  render() {
    const { navigate } = this.props.navigation;
    //{ console.log(this.props.recycleItemList.recycleCart) }
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
            {this.props.recycleItemList.user.first_name}'s Recycle Cart !!
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <FlatList
            data={this.props.recycleItemList.recycleCart}
            renderItem={({ item, index }) =>
              this.renderRecycleItemList(item, index)
            }
            keyExtractor={(item, index) => index.toString()}
            ListEmptyComponent={
              <View
                style={{
                  marginTop: 50,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontWeight: "bold" }}>
                  No Recycle Item Currently Exist In this List
                </Text>
              </View>
            }
          />
        </View>
        <View
          style={{ flex: 0.1, alignItems: "center", justifyContent: "center" }}
        >
          <CustomActionButton
            style={styles.changeMode}
            title="Book A Driver Now!!"
            onPress={() => this.props.navigation.navigate("CustomerMapScreen")}
          >
            <Text style={{ fontWeight: "100", color: "white" }}>
              Book A Driver Now
            </Text>
          </CustomActionButton>
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
  removingButton: {
    width: 150,
    height: 50,
    backgroundColor: "#CA2F2F",
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
});

const mapStateToProps = (state) => {
  return {
    recycleItemList: state.recycleItemList,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    deleteItem: (item) =>
      dispatch({ type: "REMOVE_RECYCLE_ITEMS_FROM_CART", payload: item }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CustomerCart);
