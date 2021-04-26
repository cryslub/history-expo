import React, { Component } from 'react';
import {  View,StyleSheet ,ScrollView,Text,TouchableOpacity  } from 'react-native';
import { Button ,Dialog,Modal,Portal ,Paragraph,List,IconButton,Caption,Subheading,Title,Divider ,Surface,Menu,TextInput } from 'react-native-paper';

import ResourceIcon from './ResourceIcon.js';

import mainStore from './MainContext.js';

import i18n from 'i18n-js';

export default class Resource extends Component {
     render(){
        const props = this.props;
        const resource = mainStore.data.resources[props.resource];
        let color = this.props.color;
        if(color==undefined) color='white'

        return <View style={{flexDirection:'row'}}>
            <Paragraph>{resource.name} </Paragraph>
            <ResourceIcon icon={resource.icon} color={resource.color}/>
            <Paragraph style={{marginLeft:3,color:color}}>{props.suffix}</Paragraph>
            {props.lv?<Caption> Lv.{props.lv}</Caption>:null}
        </View>
    }
}