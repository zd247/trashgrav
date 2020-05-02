import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import colors from "../../assets/colors";
import ItemList from "../../components/ItemList";
import { Ionicons } from "@expo/vector-icons";
import { connect } from "react-redux";


class CustomerPayment extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <View style={styles.container}>
                <Text> CustomerPayment </Text>
            </View>
        );
    }
}

export default CustomerPayment;

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
    removingButton: {
        width: 150,
        height: 50,
        backgroundColor: "#CA2F2F",
        alignItems: "center",
        justifyContent: "center",
    },
});