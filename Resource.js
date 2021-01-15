import React, { Component } from 'react';
import {  View   } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default class Resource extends Component {
    render(){

        const style = {verticalAlign: 'text-bottom'}
        const color = this.props.color==undefined?'grey':this.props.color

        return <View style={{position:'relative',top:3}}>
            <MaterialCommunityIcons name={this.props.icon} size={18}  style={style} color={color}  />
        </View>
    }
}