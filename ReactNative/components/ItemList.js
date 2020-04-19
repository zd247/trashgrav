import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import colors from "../assets/colors";

// import NetworkImage from 'react-native-image-progress';
// import ProgressPie from 'react-native-progress/Pie';

const ItemList = ({ item, children, marginVertical, editable, onPress }) => (
  <View style={[styles.ItemListContainer, { marginVertical }]}>
    <View style={styles.imageContainer}>
      <TouchableOpacity
        disabled={!editable}
        style={{ flex: 1 }}
        onPress={() => onPress(item)}
      >
        {item.image ? (
          <Image
            source={{ uri: item.image }}
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
          <Image source={require("../assets/icon.png")} style={styles.image} />
        )}
      </TouchableOpacity>
    </View>
    <View style={styles.ItemListTitleContainer}>
      <Text style={styles.ItemListTitle}>{item.key}</Text>
    </View>
    {children}
  </View>
);

ItemList.defaultProps = {
  marginVertical: 5,
  editable: false,
};

export default ItemList;

const styles = StyleSheet.create({
  ItemListContainer: {
    minHeight: 100,
    flexDirection: "row",
    backgroundColor: "#9ACD32",
    alignItems: "center",
  },
  imageContainer: {
    height: 70,
    width: 70,
    marginLeft: 10,
  },
  image: {
    flex: 1,
    height: null,
    width: null,
    borderRadius: 35,
  },
  ItemListTitleContainer: {
    flex: 1,
    justifyContent: "center",
    paddingLeft: 5,
  },
  ItemListTitle: {
    fontWeight: "100",
    fontSize: 22,
    color: "black",
  },
});
