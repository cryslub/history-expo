import React, { Component } from 'react';
import i18n from 'i18n-js';

import {  View,StyleSheet ,ScrollView } from 'react-native';


import { Button ,Dialog,Modal,Portal ,Paragraph,List,RadioButton,Subheading  } from 'react-native-paper';


export default class ConfirmDialog extends Component{

	constructor(){
		super();
        this.state = {
                  show: false,
        };
    }

    open(title,text,onOK){
        this.setState({show:true,title:title,text:text});
        this.callback = onOK;
    }

    onOK(){
        this.setState({show:false})
        this.callback();
    }

    render(){
        return <Dialog
           visible={this.state.show}
           onDismiss={() => this.setState({show:false})}>
          <Dialog.Title>{this.state.title}</Dialog.Title>
          <Dialog.Content>
          {this.state.text}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => this.setState({show:false})}>{i18n.t("ui.button.cancel")}</Button>
            <Button onPress={() => this.onOK()}>{i18n.t("ui.button.ok")}</Button>
          </Dialog.Actions>
        </Dialog>
    }
}