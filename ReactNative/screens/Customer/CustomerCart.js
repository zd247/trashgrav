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

import colors from "../../assets/colors";
import ItemList from "../../components/ItemList";
import { connect } from "react-redux";

class CustomerCart extends Component {
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
    return (
      <View style={styles.container}>
        <SafeAreaView />

        {/*<View style={styles.header}>
          <Text style={styles.headerTitle}>
            {this.props.recycleItemList.user.first_name}'s Recycle Cart !!
          </Text>
        </View> */}

        <FlatList
          data={this.props.recycleItemList.recycleCart}
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
    color: "white",
  },
  removingButton: {
    width: 150,
    height: 50,
    backgroundColor: "#CA2F2F",
    alignItems: "center",
    justifyContent: "center",
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
