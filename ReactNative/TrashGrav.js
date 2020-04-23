import React, { Component } from "react";
import { View, Text, StyleSheet } from "react-native";

import WelcomeScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import HomeScreen from "./screens/HomeScreen";
import UserProfileScreen from "./screens/UserProfileScreen";
import AdminHomeScreen from "./screens/Admin/AdminHomeScreen";
import CustomerCart from "./screens/Customer/CustomerCart";
import CustomerMapScreen from "./screens/Customer/CustomerMapScreen";
import SettingScreen from "./screens/SettingScreen";
import SecurityCheck from "./screens/AppSwitchNavigator/SecurityCheck";
import LoadingScreen from "./screens/LoadingScreen";
import DriverHomeScreen from "./screens/Driver/DriverHomeScreen";

import CustomDrawerNavigator from "./screens/DrawerNavigator/CustomDrawerNavigator";
import CartContainer from "./redux/containers/CartContainer";

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";

import colors from "./assets/colors";
import { Ionicons } from "@expo/vector-icons";

import { connect } from "react-redux";

import * as firebase from "firebase/app";
import { firebaseConfig } from "./config/config";

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

class TrashGrav extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.checkIfLoggedIn();
  }

  checkIfLoggedIn = () => {
    let unsubscribe;
    try {
      unsubscribe = firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          this.props.signIn(user);
        } else {
          console.log("No user Sign In");
          this.props.signOut();
        }
        unsubscribe();
      });
    } catch (e) {
      this.props.signOut();
    }
  };

  render() {
    {
      /*if (this.props.auth.isLoading) {
      return <LoadingScreen />;
    } */
    }
    return (
      <NavigationContainer>
        {!this.props.auth.isSignedIn ? (
          <Stack.Navigator
            screenOptions={{
              headerStyle: {
                backgroundColor: colors.bgMain,
              },
              headerTintColor: "white",
            }}
          >
            <Stack.Screen
              name="Welcome Screen"
              component={WelcomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SignUpScreen"
              component={SignUpScreen}
              options={{ headerBackTitleVisible: false }}
            />
          </Stack.Navigator>
        ) : !this.props.auth.isDriver ? (
          <CustomerDrawerNavigator />
        ) : (
          <DriverDrawerNavigator />
        )}
      </NavigationContainer>
    );
  }
}

const CustomerTabNavigator = ({ route }) => (
  <Tab.Navigator
    tabBarOptions={{
      style: {
        backgroundColor: colors.bgMain,
      },
      activeTintColor: colors.logoColor,
      inactiveTintColor: colors.bgTextInput,
    }}
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        switch (route.name) {
          case "Recycle Item List":
            return <CartContainer color={color} type="recycleItemList" />;
          case "Recycle Cart":
            return <CartContainer color={color} type="recycleCart" />;
        }
      },
    })}
  >
    <Tab.Screen name="Recycle Item List" component={HomeScreen} />
    <Tab.Screen name="Recycle Cart" component={CustomerCart} />
  </Tab.Navigator>
);

const getHeaderTitle = (route) => {
  const routeName = route.state
    ? route.state.routes[route.state.index].name
    : "Home";

  switch (routeName) {
    case "Home":
      return "Recycle Item List";
    case "Recycle Cart":
      return "Recycle Cart";
    case "CustomerMapScreen":
      return "Book A Driver";
  }
};

const CustomerStackNavigator = ({ navigation }) => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: colors.bgMain,
      },
      headerTintColor: "white",
      headerLeft: () => (
        <Ionicons
          onPress={() => navigation.openDrawer()}
          name="ios-menu"
          size={30}
          color="white"
          style={{ marginLeft: 10 }}
        />
      ),
      gestureEnabled: true,
    }}
    initialRouteName="Recycle Item List"
  >
    <Stack.Screen
      options={({ route }) => ({
        title: getHeaderTitle(route),
      })}
      name="Recycle Item List"
      component={CustomerTabNavigator}
    />

    <Stack.Screen
      options={{ title: "Customer Map Screen" }}
      name="CustomerMapScreen"
      component={CustomerMapScreen}
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.bgMain,
        },
        headerTintColor: "white",
        headerLeft: () => (
          <Ionicons
            onPress={() => navigation.goBack()}
            name="ios-arrow-round-back"
            size={30}
            color="white"
            style={{ marginLeft: 10 }}
          />
        ),
      }}
    />
  </Stack.Navigator>
);

const CustomerDrawerNavigator = () => (
  <ActionSheetProvider>
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerNavigator {...props} />}
    >
      <Drawer.Screen
        options={{ drawerIcon: () => <Ionicons name="ios-home" size={24} /> }}
        name="Home"
        component={CustomerStackNavigator}
      />
      <Drawer.Screen
        options={{ drawerIcon: () => <Ionicons name="ios-person" size={24} /> }}
        name="User Profile"
        component={UserProfileScreen}
      />
      <Drawer.Screen
        options={{
          drawerIcon: () => <Ionicons name="ios-settings" size={24} />,
        }}
        name="Setting"
        component={SettingScreen}
      />
      <Drawer.Screen
        options={{ drawerIcon: () => <Ionicons name="ios-people" size={24} /> }}
        name="Admin"
        component={AdminHomeScreen}
      />
    </Drawer.Navigator>
  </ActionSheetProvider>
);

const DriverDrawerNavigator = () => (
  <ActionSheetProvider>
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerNavigator {...props} />}
    >
      <Drawer.Screen
        options={{
          drawerIcon: () => <Ionicons name="ios-bicycle" size={24} />,
        }}
        name="Home"
        component={DriverHomeScreen}
      />
      <Drawer.Screen
        options={{ drawerIcon: () => <Ionicons name="ios-person" size={24} /> }}
        name="User Profile"
        component={UserProfileScreen}
      />
      <Drawer.Screen
        options={{
          drawerIcon: () => <Ionicons name="ios-settings" size={24} />,
        }}
        name="Setting"
        component={SettingScreen}
      />
    </Drawer.Navigator>
  </ActionSheetProvider>
);

const mapStateToProps = (state) => {
  return {
    auth: state.auth,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    signIn: (user) => dispatch({ type: "SIGN_IN", payload: user }),
    signOut: () => dispatch({ type: "SIGN_OUT" }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TrashGrav);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  header: {
    height: 70,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderColor,
    alignItems: "center",
    justifyContent: "center",
  },
});
