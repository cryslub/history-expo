import React, { Component } from 'react';
import {  View,StyleSheet ,ScrollView,Text,TouchableOpacity  } from 'react-native';
import { Button ,Dialog,Modal,Portal ,Paragraph,List,IconButton,Caption,Subheading,Title,Divider ,Surface,Menu,TextInput } from 'react-native-paper';

import Resource from './Resource.js';

import resources from './json/resource.json';

export default class ResourceRow extends Component {
     render(){
        const props = this.props;
        const resource = resources[props.resource];
        return <View style={{flexDirection:'row'}}>
            <Paragraph>{props.prefix} </Paragraph>
            <Resource icon={resource.icon} color={resource.color}/>
            <Paragraph style={{marginLeft:3}}>{props.suffix}</Paragraph>
            {props.lv?<Caption> Lv.{props.lv}</Caption>:null}
        </View>
    }
}