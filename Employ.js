import React, { useContext } from 'react';
import {  View,StyleSheet ,ScrollView,Text,TouchableOpacity  } from 'react-native';
import { Button ,Dialog,Modal,Portal ,Paragraph,List,IconButton,Caption,Subheading,Title,Divider ,Surface,Menu,TextInput } from 'react-native-paper';
import { FlatGrid } from 'react-native-super-grid';

import Popover from 'react-native-popover-view';

import Util from './Util.js';
import Icon from './Icon.js';
import Resource from './Resource.js';

import Unit from './Unit.js';
import UnitData from './UnitData.js';

import unitProto from "./json/unit.json"
import resources from './json/resource.json';

import { observer,inject } from "mobx-react"

import mainStore from './MainContext.js';
import actionStore from './ActionContext.js';

const styles = StyleSheet.create({

	title:{
		fontSize:15,
	},
	electionTitle:{
		fontSize:15,
		padding:0,
		margin:0,
		position:'relative',
		left: -7
	},
	accordion:{
		margin:0,
		padding:0
	},
	election:{
		margin:0,
		paddingTop:4,
		paddingBottom:4,
	},
	sub:{
		marginLeft:12
	},
	faction:{
    	marginLeft:30
    },
	subTitle:{
		fontSize:13,
		padding:0,
		margin:0,
		position:'relative',
		left:-5
	},
	subIcon:{
		width:15,
		height:15
	},

    unit: {
        padding: 8,
         height: 60,
         width: 60,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 1,
        margin:2
     }
});




export const Employ = ((props) => {

    const [visible, setVisible] = React.useState(false);
    const [amount, setAmount] = React.useState(1);


    const city = mainStore.selectedCity;

	const minus = () =>{
        this.setState({amount:--this.state.amount})
	}
	const plus = () =>{
        this.setState({amount:++this.state.amount})

	}

    const add = (unit,amount)=>{

        city.employ(unit);

        props.navigation.goBack();
    }

    const action   = (unit) =>{
        return <>
            <View style={{width:240,padding:15}}>
                <Caption>{unit.description}</Caption>
                {unit.manpower?<Paragraph>Require {unit.manpower} Manpower</Paragraph>:null}
                {unit.cost?<View style={{flexDirection:'row'}}>
                    <Paragraph>Cost {unit.cost.type} </Paragraph>
                    <Resource icon={resources[unit.cost.type].icon} />
                    <Paragraph>{city.getHiringCost(unit,unit.cost.quantity).toFixed(2)} </Paragraph>
                </View>:null
                }
            </View>
            {false?<View style={{flexDirection:'row',alignItems: 'center',justifyContent: 'center',padding:15}}>
                 <Button icon="minus" contentStyle={{marginLeft:12}} onPress={()=>this.minus()}/>{this.state.amount}
                 <Button icon="plus" contentStyle={{marginLeft:12}} onPress={()=>this.plus()}/>
             </View>
             :null}
            {city.manpower>=unit.manpower||unit.manpower==undefined?<Button  onPress={()=>add(unit,1)}>Add</Button>:null}
             {unit.delay?<View style={{width:'100%'}}>
                <Caption style={{textAlign:'center'}}>Takes {unit.delay} days</Caption>
            </View>:null}
        </>
    }

    const arr = Object.keys(unitProto).filter(key=>{
		    const unit = unitProto[key];

            if(unit.category=='army' && city.happiness<=0){
                return false;
            }else{
                return true;
            }
		});

    return <ScrollView contentContainerStyle={{ padding: 10 }}>
         <View style={{flexDirection:'row'}}>
            <Icon icon="account" />
            <Text>Available Manpower {Util.number(Math.floor(city?.manpower))}</Text>
        </View>
         <FlatGrid
                   itemDimension={mainStore.unitSize}
                   data={arr}

                   spacing={1}
                   renderItem={({ item }) => {

                        const unit = unitProto[item];
                          return <Unit data={unit}  action={()=>action(unit)} disabled={city.manpower<unit.manpower}/>
                   }}
         />

     </ScrollView>

	
})