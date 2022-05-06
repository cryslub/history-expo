import React, { Component } from 'react';
import {  View,StyleSheet ,ScrollView,Text,TouchableOpacity,Animated  } from 'react-native';


const Progress = (props)=>{
     const width = props.width
     const style = props.style
     style.width = width;
     return <Animated.View
         style={[StyleSheet.absoluteFill], style}
      >
      </Animated.View>
}

export default Progress