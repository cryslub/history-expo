import React, { Component } from 'react';

import {  View,StyleSheet ,ScrollView } from 'react-native';


import { Button ,Dialog,Modal,Portal ,Paragraph,Caption,List,RadioButton,Subheading  ,Menu} from 'react-native-paper';

import mainStore from './MainContext.js'

import {UnitIcon} from './Common.js'

export default class SelectDialog extends Component{

    select = (unit)=>{
        mainStore.objects.detail(unit)
        this.props.closeDialog()
    }

    render(){
        return <Dialog
           visible={this.props.showDialog}
           onDismiss={() => this.props.closeDialog()}>
          <Dialog.Content>
            {mainStore.selectionList.map(unit=>{
                return <Menu.Item  onPress={() => this.select(unit)} title={<>
                    <UnitIcon data={unit}/> <Paragraph>{unit.name} </Paragraph><Caption> {unit.city.name}</Caption>
                </>} />
            })}

          </Dialog.Content>

        </Dialog>
    }
}