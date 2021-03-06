import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Proptypes from "prop-types";
import colors from "../assets/colors";

function getPosition(position) {
  switch (position) {
    case "left":
      return { position: "absolute", left: 20, bottom: 270 };
    default:
      return { position: "absolute", right: 20, bottom: 270 };
  }
}

const CustomTempButton = ({ children, onPress, style, position }) => {
  const floatingActionButton = position ? getPosition(position) : [];
  return (
    <TouchableOpacity style={floatingActionButton} onPress={onPress}>
      <View style={[styles.button, style]}>{children}</View>
    </TouchableOpacity>
  );
};

CustomTempButton.propTypes = {
  onPress: Proptypes.func.isRequired,
  children: Proptypes.element.isRequired,
  style: Proptypes.oneOfType([Proptypes.object, Proptypes.array]),
};

CustomTempButton.defaultProps = {
  style: {},
};

export default CustomTempButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.bgError,
    alignItems: "center",
    justifyContent: "center",
  },
});

//backgroundColor: colors.bgError,
