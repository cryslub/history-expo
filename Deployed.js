import React, { Component } from 'react';
import {  View,StyleSheet ,ScrollView,Text } from 'react-native';
import { Button ,Dialog,Modal,Portal ,Paragraph,List,IconButton,Surface ,Caption} from 'react-native-paper';

import mainStore from './MainContext.js'
import Icon from './Icon.js';

import i18n from 'i18n-js';

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
});



const Unit = (props) =>{

    const unit = props.unit;

    let currentPosition = unit.currentLocation?.name;
    if(unit.currentRoad!=undefined){
        const destinies = unit.currentRoad.road.destinies
        currentPosition = destinies[0].city.name +" - "+destinies[1].city.name
    }

    return <Surface >
           <View style={{flexDirection:'row',justifyContent:'space-between',height:28}} key={props.index}>
               <View style={{flexDirection:'row',height:50,display:'flex',justifyContent:'center'}}>
                   <Icon  icon={unit.icon} contentStyle={{position:'relative',top:8,marginLeft:20,height:40}}/>
                   <Paragraph style={{position:'relative',top:7}}>{unit.name}</Paragraph>
                   {unit.resources.food==undefined||unit.resources.food<=0?
                    <Icon  icon="barley" color="#fc8b8b" contentStyle={{position:'relative',top:8,marginLeft:20,height:40}}/>
                   :null}
                   {unit.moral<=0?
                    <Icon  icon="heart" color="#fc8b8b" contentStyle={{position:'relative',top:8,marginLeft:20,height:40}}/>
                   :null}
                   {unit.state=='fighting'?
                   <Icon  icon="sword-cross" color="#fc8b8b" contentStyle={{position:'relative',top:8,marginLeft:20,height:40}}/>
                   :null}
               </View>
               <View style={{flexDirection:'row'}}>
                    {
                    unit.canTrade?
                    <Button  style={{position:'relative',top:8,minWidth:40,width:40,marginRight:2,paddingTop:3}} icon="cached" color="grey" onPress={()=>props.trade(unit)}/>
                    :null
                    }
                    <Button  style={{position:'relative',top:8,minWidth:40,width:40,marginRight:2,paddingTop:3}} icon="arrow-right-drop-circle" color="grey" onPress={()=>props.move(unit)}/>
                    <Button  style={{position:'relative',top:8,minWidth:40,width:40,marginRight:2,paddingTop:3}} icon="information-outline" color="grey" onPress={()=>props.info(unit)}/>
                    <Button  style={{position:'relative',top:8,minWidth:40,width:40,marginRight:2,paddingTop:3}} icon="target" color="grey" onPress={()=>props.onSelect(unit)}/>
               </View>

           </View>
           <View style={{flexDirection:'row',justifyContent:'space-between',height:28,margin:9}} >
                <View style={{flexDirection:'row'}}>
                    <Paragraph>{i18n.t("ui.deployed.location")} </Paragraph>
                   <Caption >{currentPosition}</Caption>
               </View>
                <View style={{flexDirection:'row'}}>
                    <Paragraph>{i18n.t("ui.deployed.origin")} </Paragraph>
                   <Caption >{unit.city.name}</Caption>
               </View>
           </View>
       </Surface>
}


export const Deployed = (props)=>{


     const move = (unit)=>{
        mainStore.move(unit);
        props.navigation.navigate('Home', {unit:unit});

    }

     const trade = (unit)=>{
         mainStore.pause();
          props.navigation.navigate('Trade', {city:unit.currentLocation,unit:unit});
    }

	 const inventory = (unit)=>{
        mainStore.pause();
        mainStore.selectedUnit = unit
         props.navigation.navigate('Equip');
    }
    const group = (unit)=>{
        mainStore.pause();
        mainStore.selectedUnit = unit

         props.navigation.navigate('Group');
    }

	const select = (unit) =>{

		mainStore.onSelect(unit);

		props.navigation.navigate('Home')
	}

    const info = (unit)=>{
        if(unit.type=='group'){
            group(unit)
        }else{
            inventory(unit)
        }
    }

    return <ScrollView >
     {
        mainStore.units.map((unit,index)=>{
            if(unit.city.factionData.id == mainStore.selectedFaction.id){
                return <Unit key={index} unit={unit} onSelect={select} move={move} info={info} trade={trade}/>
            }
        })
     }
     </ScrollView>

	
}