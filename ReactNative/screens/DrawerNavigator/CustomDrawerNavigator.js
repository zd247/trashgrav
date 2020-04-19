import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
} from "react-native";

import { DrawerItemList } from "@react-navigation/drawer";
//import { DrawerItems } from "react-navigation";
import colors from "../../assets/colors";
import { Ionicons } from "@expo/vector-icons";
class CustomDrawerNavigator extends Component {
  render() {
    return (
      <ScrollView>
        <SafeAreaView style={{ backgroundColor: "white" }} />
        <View
          style={{
            height: 150,
            backgroundColor: colors.bgMain,
            alignItems: "center",
            justifyContent: "center",
            paddingTop: Platform.OS == "android" ? 20 : 0,
          }}
        >
          <Ionicons name="ios-nuclear" size={100} color={colors.logoColor} />
          <Text style={{ fontSize: 24, color: "white", fontWeight: "100" }}>
            Trash Grav
          </Text>
        </View>
        <DrawerItemList {...this.props} />
      </ScrollView>
    );
  }
}
export default CustomDrawerNavigator;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
