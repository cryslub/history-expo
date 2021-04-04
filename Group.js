import React, { useContext } from 'react';
import {  View,StyleSheet ,ScrollView,Text,TouchableOpacity  } from 'react-native';
import { Button ,Dialog,Modal,Portal ,Paragraph,List,IconButton,Caption,Subheading,Title,Divider ,Surface,Menu,TextInput } from 'react-native-paper';
import { FlatGrid } from 'react-native-super-grid';

import Popover from 'react-native-popover-view';

import Util from './Util.js';
import Icon from './Icon.js';
import Resource from './Resource.js';
import ResourceRow from './ResourceRow.js';
import Hero from './Hero.js';


import Unit from './Unit.js';
import UnitData from './UnitData.js';

import unitProto from "./json/unit.json"
import resources from './json/resource.json';

import { observer,inject } from "mobx-react"

import mainStore from './MainContext.js';

import {UnitScreen,Resources,Moral} from './Common.js'

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




export const Group =  (observer((props) => {

     const { unit} = props.route.params;

    const removeHero = ()=>{
        const city = unit.currentLocation;
        city.addHero(unit.hero);
        unit.setHero(undefined);
    }

    const removable = unit.state=='' || (unit.currentRoad == undefined && unit.currentLocation.factionData.id==unit.city.factionData.id)

      return (
        <ScrollView >
             <View style={{padding:10}}>
                <Moral unit={unit}/>

                <View style={{flexDirection:'row'}}>
                   <Paragraph >Capacity </Paragraph>
                   <Caption>{Math.floor(unit.carrying)}/{unit.capacity} units</Caption>
                   <Paragraph style={{marginLeft:5}}>Speed </Paragraph>
                   <Caption>{unit.speed}km/day</Caption>
                </View>
                <Divider/>
            {unit.hero!=undefined?<>
                <Caption>Leader</Caption>
                <Hero data={unit.hero}  {...props} type='group' remove={removeHero} removable={removable}/>
            </>:null
            }
            </View>
             <UnitScreen unit={unit} type='group' {...props}/>

             <View style={{padding:10}}>
                 <Resources unit={unit} />
             </View>
        </ScrollView>
      );

	
}))