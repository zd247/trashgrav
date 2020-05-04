import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import colors from "../assets/colors";

const DriverOrderList = ({
  item,
  children,
  marginVertical,
  editable,
  onPress,
}) => (
  <View style={[styles.ItemListContainer, { marginVertical }]}>
    <View style={styles.imageContainer}>
      <TouchableOpacity
        disabled={!editable}
        style={{ flex: 1 }}
        onPress={() => onPress(item)}
      >
        {item.user.image ? (
          <Image
            source={{ uri: item.user.image }}
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
      <Text style={styles.ItemListTitle}>
        Customer Name: {item.user.first_name} {item.user.last_name}
      </Text>
      <Text style={styles.ItemListTitle}>Order Price: {item.totalPrice} </Text>
    </View>
    {children}
  </View>
);

DriverOrderList.defaultProps = {
  marginVertical: 5,
  editable: false,
};

export default DriverOrderList;

const styles = StyleSheet.create({
  ItemListContainer: {
    minHeight: 100,
    flexDirection: "row",
    backgroundColor: "#fbfbf1",
    alignItems: "center",
    borderWidth: 0.15,
    borderRadius: 10,
    padding: 10,
  },
  imageContainer: {
    height: 70,
    width: 70,
  },
  image: {
    width: "100%",
    height: "100%",
    borderWidth: 5,
    borderColor: "white",
    borderRadius: 10,
  },
  ItemListTitleContainer: {
    flex: 1,
    justifyContent: "center",
    paddingLeft: 2,
  },
  ItemListTitle: {
    fontWeight: "100",
    fontSize: 15,
    color: "black",
    marginStart: 5,
  },
});
