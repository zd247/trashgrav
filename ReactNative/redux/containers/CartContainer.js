import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { connect } from "react-redux";
import colors from "../../assets/colors";
import PropTypes from "prop-types";
const CartContainer = ({ color, type, ...props }) => (
  <View style={styles.container}>
    <Text style={{ color: color }}>
      {props.recycleItemList[type].length || 0}
    </Text>
  </View>
);

const mapStateToProps = (state) => {
  return {
    recycleItemList: state.recycleItemList,
  };
};

CartContainer.defaultProps = {
  color: colors.txtPlaceholder,
};

CartContainer.propTypes = {
  color: PropTypes.string,
  type: PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(CartContainer);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
