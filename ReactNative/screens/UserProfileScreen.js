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
  Keyboard,
  ActivityIndicator,
} from "react-native";

import CustomActionButton from "../components/CustomTempButton";
import colors from "../assets/colors";
import { Ionicons } from "@expo/vector-icons";
import { connect } from "react-redux";
import { compose } from "redux";
import { connectActionSheet } from "@expo/react-native-action-sheet";

import { NavigationContainer } from "@react-navigation/native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";

import * as ImageHelpers from "../helpers/imageHelpers";
import * as firebase from "firebase/app";
import "firebase/storage";

class UserProfileScreen extends Component {
  constructor() {
    super();
    this.state = {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      image: "",
      uid: "",
      currentUser: {},
    };
  }

  componentDidMount = async () => {
    this.setState({
      currentUser: this.props.recycleItemList.user,
      firstName: this.props.recycleItemList.user.first_name,
      lastName: this.props.recycleItemList.user.last_name,
      email: this.props.recycleItemList.user.email,
      image: this.props.recycleItemList.user.image,
      uid: this.props.recycleItemList.user.uid,
    });
    this.props.toggleIsLoadingItems(false);
  };

  componentWillUnmount() {
    console.log("unmount");
  }

  submit = async (item) => {
    const tempUser = [
      {
        first_name: this.state.firstName,
        last_name: this.state.lastName,
        email: this.state.email,
        image: this.props.recycleItemList.user.image,
        uid: this.state.uid,
      },
    ];

    try {
      this.props.toggleIsLoadingItems(true);
      await firebase
        .database()
        .ref("Users")
        .child(this.props.recycleItemList.user.key)
        .update({
          email: this.state.email,
          first_name: this.state.firstName,
          last_name: this.state.lastName,
        });

      this.props.updateUser(tempUser[0]);
      console.log(tempUser);
      this.props.toggleIsLoadingItems(false);
    } catch (error) {
      console.log(error);
      this.props.toggleIsLoadingItems(false);
    }
  };

  uploadImage = async (image) => {
    const ref = firebase
      .storage()
      .ref("Profile Pictures/")
      .child(this.props.currentUser.uid)

    try {
      //converting to blob
      const blob = await ImageHelpers.prepareBlob(image.uri);
      const snapshot = await ref.put(blob);

      let downloadUrl = await ref.getDownloadURL();

      await firebase
        .database()
        .ref("Users")
        .child(this.state.currentUser.uid)
        .update({ image: downloadUrl });

      blob.close();

      return downloadUrl;
    } catch (error) {
      console.log(error);
    }
  };

  openImageLibrary = async () => {
    const result = await ImageHelpers.openImageLibrary();

    if (result) {
      this.props.toggleIsLoadingItems(true);
      const downloadUrl = await this.uploadImage(result);

      const tempUser = [
        {
          first_name: this.state.firstName,
          last_name: this.state.lastName,
          email: this.state.email,
          image: downloadUrl,
          uid: this.state.uid,
        },
      ];

      this.props.updateUser(tempUser[0]);
      //this.props.updateImage({ uri: downloadUrl });
      //this.state.image = downloadUrl;
      this.props.toggleIsLoadingItems(false);
    }
  };

  openCamera = async () => {
    const result = await ImageHelpers.openCamera();

    if (result) {
      this.props.toggleIsLoadingItems(true);
      const downloadUrl = await this.uploadImage(result);

      const tempUser = [
        {
          first_name: this.state.firstName,
          last_name: this.state.lastName,
          email: this.state.email,
          image: downloadUrl,
          uid: this.state.uid,
        },
      ];

      this.props.updateUser(tempUser[0]);
      //this.props.updateImage({ uri: downloadUrl });
      //this.state.image = downloadUrl;
      this.props.toggleIsLoadingItems(false);
    }
  };

  changePicture() {
    const options = ["Select from Photos", "Camera", "Cancel"];
    const cancelButtonIndex = 2;

    this.props.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      (buttonIndex) => {
        // Do something here depending on the button index selected
        if (buttonIndex == 0) {
          this.openImageLibrary();
        } else if (buttonIndex == 1) {
          this.openCamera();
        }
      }
    );
  }

  render() {
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
            {this.props.recycleItemList.user.first_name}'s Profile !!
          </Text>
        </View>
        <View style={styles.imageContainer}>
          {this.props.recycleItemList.isLoading && (
            <View
              style={{
                ...StyleSheet.absoluteFill,
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                elevation: 1000,
              }}
            >
              <ActivityIndicator size="large" color={colors.logoColor} />
            </View>
          )}
          <TouchableOpacity
            disabled={false}
            style={{ flex: 1 }}
            onPress={() => this.changePicture()}
          >
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
                source={require("../assets/icon.png")}
                style={styles.image}
              />
            )}
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.textInputContainer}>
            <View
              style={{
                flex: 1,
                //flexDirection: "row",
                marginBottom: 20,
              }}
            >
              <Text style={styles.prefix}>First Name: </Text>
              <TextInput
                style={styles.textInput}
                placeholder={this.state.firstName}
                placeholderTextColor={"white"}
                onBlur={Keyboard.dismiss}
                onChangeText={(text) => this.setState({ firstName: text })}
                ref={(component) => {
                  this.textInputRef = component;
                }}
              />
            </View>
            <View style={{ flex: 1, paddingBottom: 20 }}>
              <Text style={styles.prefix}>Last Name: </Text>
              <TextInput
                style={styles.textInput}
                placeholder={this.state.lastName}
                placeholderTextColor={"white"}
                onBlur={Keyboard.dismiss}
                onChangeText={(text) => this.setState({ lastName: text })}
                ref={(component) => {
                  this.textInputRef = component;
                }}
              />
            </View>
            <View style={{ flex: 1, paddingBottom: 20 }}>
              <Text style={styles.prefix}>Email: </Text>
              <TextInput
                style={styles.textInput}
                placeholder={this.state.email}
                placeholderTextColor={"white"}
                onBlur={Keyboard.dismiss}
                onChangeText={(text) => this.setState({ email: text })}
                ref={(component) => {
                  this.textInputRef = component;
                }}
              />
            </View>
          </View>
          <CustomActionButton
            style={[styles.saveChange, { borderColor: colors.bgPrimary }]}
            title="Save Change"
            onPress={this.submit}
          >
            <Text style={{ fontWeight: "200", color: "black" }}>
              Save Change
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
  textInputContainer: {
    //flexDirection: "row",
    flex: 1,
    margin: 5,
  },
  prefix: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    //backgroundColor: "red",
    fontSize: 22,
    fontWeight: "200",
    paddingRight: 20,
    paddingLeft: 20,
    //paddingTop: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: "transparent",
    borderColor: "white",
    borderWidth: 5,
    fontSize: 22,
    fontWeight: "200",
    color: "white",
    paddingRight: 20,
    paddingLeft: 20,
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
  footer: {
    height: 70,
    flexDirection: "row",
    borderTopWidth: 0.5,
    borderTopColor: colors.borderColor,
    color: "white",
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
  saveChange: {
    width: 100,
    height: 50,
    backgroundColor: "#a5deba",
    alignSelf: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  image: {
    flex: 1,
    height: null,
    width: 150,
    borderRadius: 200,
    alignSelf: "center",
  },
});

const mapStateToProps = (state) => {
  return {
    recycleItemList: state.recycleItemList,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateUser: (user) =>
      dispatch({
        type: "UPDATE_USER_INFORMATION",
        payload: user,
      }),
    updateImage: (image) =>
      dispatch({ type: "UPDATE_USER_IMAGE", payload: image }),
    toggleIsLoadingItems: (bool) =>
      dispatch({ type: "TOGGLE_IS_LOADING_ITEMS", payload: bool }),
  };
};

const wrapper = compose(
  connect(mapStateToProps, mapDispatchToProps),
  connectActionSheet
);

export default wrapper(UserProfileScreen);
