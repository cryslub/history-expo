import React, { Component } from 'react';
import { Button ,Dialog,Modal,Portal ,Paragraph,List,IconButton,Caption,Subheading } from 'react-native-paper';

export default class Icon extends Component {
    render(){

        const style = { alignItems: 'center',justifyContent: 'center',marginTop:2,minWidth:24,width:24,height:16}
        const color = 'grey'

        return  <Button icon={this.props.icon} style={[style,this.props.style]} contentStyle={{marginLeft:16}} color={color} {... this.props}/>
    }
}