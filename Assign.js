import React, { Component } from 'react';
import {  View,StyleSheet ,ScrollView,Text,TouchableOpacity  } from 'react-native';
import { Button ,Dialog,Modal,Portal ,Paragraph,List,IconButton,Caption,Subheading,Title,Divider ,Surface,Menu,TextInput } from 'react-native-paper';
import { FlatGrid } from 'react-native-super-grid';

import Popover from 'react-native-popover-view';

import Util from './Util.js';
import Icon from './Icon.js';


import Unit from './Unit.js';
import UnitData from './UnitData.js';

import buildings from "./json/building.json"

import mainStore from './MainContext.js';



export default class Assign extends Component {

    constructor(){
		super();

	    this.state={
            visible :false,
            amount:1
        }
	}

	minus = () =>{
        this.setState({amount:--this.state.amount})
	}
	plus = () =>{
        this.setState({amount:++this.state.amount})
	}

    add = (building,amount)=>{

        const { unit } = this.props.route.params;
        const city = mainStore.selectedCity;


        city.assign(unit,building)


        this.props.navigation.goBack();
       // city.refreshBuildings();
    }


	render(){

		const { unit } = this.props.route.params;
		 const city = mainStore.selectedCity;

		const arr = [];
		Object.keys(city.buildings).forEach(key=>{
		    const building = city.buildings[key];
            if(building.data.worker==unit.type){
                arr.push(building);
            }
            if((building.data.production ||building.data["hero effect"] || (building.data.build&&building.state=='deploy'))
                && unit.type=='hero'){
                arr.push(building);
            }
            if(unit.type=='worker' && building.data.build!=undefined && building.state=='deploy'){
                arr.push(building);
            }
		});

        if(unit.data.action?.deploy || unit.type=='hero'){
            city.units.forEach(u=>{
                if(u.type=='group' && u.units.length<10){
                    arr.push(u);
                }

            })
		}

		return 	<FlatGrid
                   itemDimension={mainStore.unitSize}
                   data={arr}

                   spacing={1}
                   renderItem={({ item }) => {

                        return <Unit data={item}  onPress={()=>this.add(item)} />
                   }}
         />

	}
	
}