import React, { Component } from 'react';

import {  View,StyleSheet ,ScrollView } from 'react-native';


import { Button ,Dialog,Modal,Portal ,Paragraph,List,RadioButton,Subheading  } from 'react-native-paper';


export default class ThemeDialog extends Component{

    render(){
        return <Dialog
           visible={this.props.showThemeDialog}
           onDismiss={() => this.props.closeThemeDialog()}>
          <Dialog.Title>Themes</Dialog.Title>
          <Dialog.Content>
            <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                <Subheading >Natural</Subheading >
                <RadioButton
                  value="natural"
                  status={this.props.theme === 'natural' ? 'checked' : 'unchecked'}
                  onPress={() => { this.props.changeTheme('natural') }}
                />
            </View>
            <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                <Subheading >Simple</Subheading >

                <RadioButton
                  value="simple"
                  status={this.props.theme === 'simple' ? 'checked' : 'unchecked'}
                  onPress={() => { this.props.changeTheme( 'simple' ) }}
                />
             </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => this.props.closeThemeDialog()}>Done</Button>
          </Dialog.Actions>
        </Dialog>
    }
}