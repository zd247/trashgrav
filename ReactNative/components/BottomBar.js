import React from "react";
import { Text, View } from "react-native";
import PropTypes from "prop-types";

const BottomBar = ({ title, count }) => (
  <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
    <Text style={{ color: "white" }}>{title}</Text>
    <Text style={{ fontSize: 20, color: "white" }}>{count}</Text>
  </View>
);

BottomBar.propTypes = {
  count: PropTypes.number,
  title: PropTypes.string,
};

BottomBar.defaultProps = {
  title: "Title",
};

export default BottomBar;
