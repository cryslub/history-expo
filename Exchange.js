import React, { Component } from 'react';
import {  View,StyleSheet ,ScrollView,Text,TouchableOpacity  } from 'react-native';
import { Button ,Dialog,Modal,Portal ,Paragraph,List,IconButton,Caption,Subheading,Title,Divider ,Surface,Menu,TextInput,Switch  } from 'react-native-paper';
import { FlatGrid } from 'react-native-super-grid';

import Popover from 'react-native-popover-view';

import Util from './Util.js';
import Icon from './Icon.js';
import ResourceRow from './ResourceRow.js';


import Unit from './Unit.js';
import UnitData from './UnitData.js';

import buildings from "./json/building.json"

import mainStore from './MainContext.js';

import {Resources,Moral} from './Common.js';

import { observer} from "mobx-react"

import i18n from 'i18n-js';



@observer
export default class Exchange extends Component {

    constructor(){
		super();

	    this.state={
            visible :false,
            amount:1
        }
	}
    changeAmount = ()=>{
        if(this.state.amount ==1){
            this.setState({amount:10})
        }else{
            this.setState({amount:1})
        }
    }

    transferToUnit = (key)=>{
         const { unit } = this.props.route.params;
         const city = unit.currentLocation;

        const quantity = Math.min(this.state.amount,        unit.capacity - unit.carrying())
        let consume = city.consumeResource(key,quantity)
        unit.addResource(key, consume);
    }

    transferToCity = (key)=>{
         const { unit } = this.props.route.params;
         const city = unit.currentLocation;
         if(city.factionData.id==mainStore.selectedFaction.id){


            const quantity = this.state.amount
            const consume = unit.consumeResource(key, quantity);
            city.addResource(key, consume);
        }
    }


	render(){

		const { unit,target } = this.props.route.params;

		return <ScrollView contentContainerStyle={{ padding: 10 }}>

            {unit.inGroup!=true?<Resources unit={unit} target={target}/>:null}

	     </ScrollView>
	}
	
}