import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  TouchableOpacity,
  title,
  Image,
} from "react-native";

import {
  DrawerItemList,
  DrawerContentScrollView,
  DrawerItem,
} from "@react-navigation/drawer";

import colors from "../../assets/colors";
import { connect } from "react-redux";
import Animated from "react-native-reanimated";

class CustomDrawerNavigator extends Component {
  translateX = (props) => {
    const temp = Animated.interpolate(props.progress, {
      inputRange: [0, 0.5, 0.7, 0.8, 1],
      outputRange: [-100, -85, -70, -45, 0],
    });
  };

  render() {
    return (
      <DrawerContentScrollView>
        <Animated.View
        //@ts-ignore
        //style={[styles.drawerContent]}
        >
          <View style={styles.userInfoSection}>
            <TouchableOpacity disabled={true} style={{ flex: 1 }}>
              {this.props.recycleItemList.user.image ? (
                <Image
                  source={{ uri: this.props.recycleItemList.user.image }}
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
                <Image
                  source={require("../../assets/icon.png")}
                  style={styles.image}
                />
              )}
            </TouchableOpacity>
            <Text style={styles.title}>
              {this.props.recycleItemList.user.first_name}{" "}
              {this.props.recycleItemList.user.last_name}
            </Text>
          </View>
          <DrawerItemList {...this.props} />
        </Animated.View>
      </DrawerContentScrollView>
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
    signIn: (user) => dispatch({ type: "SIGN_IN", payload: user }),
    signOut: () => dispatch({ type: "SIGN_OUT" }),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CustomDrawerNavigator);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  drawerContent: {
    flex: 1,
  },
  userInfoSection: {
    height: 180,
    backgroundColor: colors.bgMain,
    alignItems: "center",
    justifyContent: "center",
    //paddingTop: Platform.OS == "android" ? 20 : 0,
  },
  title: {
    backgroundColor: "transparent",
    fontSize: 22,
    fontWeight: "200",
    color: "white",
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
  },
  row: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  section: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  paragraph: {
    fontWeight: "bold",
    marginRight: 3,
  },
  drawerSection: {
    marginTop: 15,
  },
  preference: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  listItemContainer: {
    minHeight: 100,
    flexDirection: "row",
    backgroundColor: "white",
    alignItems: "center",
  },
  imageContainer: {
    flex: 1,
    borderColor: "white",
    maxHeight: 150,
    marginBottom: 50,
  },
  image: {
    flex: 1,
    height: null,
    width: 150,
    borderRadius: 150,
    alignSelf: "center",
  },
});
