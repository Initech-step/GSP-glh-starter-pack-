import { View, useWindowDimensions } from "react-native";
import React, { useEffect, useState } from 'react';


export default function ReadBook({ route, navigation }) {
    const { width, height } = useWindowDimensions();
    const { key, name } = route.params;
    console.log(`key ${key} with name ${name}`)
    return (
        <View style={{ flex: 1 }}>
        
        </View>
    );
}