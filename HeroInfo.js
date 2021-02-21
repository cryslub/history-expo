import React, { useContext } from 'react';

import {  View,StyleSheet ,ScrollView,Text,TouchableOpacity,Dimensions   } from 'react-native';
import { Button ,Dialog,Modal,Portal ,Paragraph,List,IconButton,Caption,Subheading,Title,Divider ,Surface,Menu,Avatar  } from 'react-native-paper';

import { NavigationContainer } from '@react-navigation/native';

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import { Ionicons } from '@expo/vector-icons';

import { TabView, SceneMap } from 'react-native-tab-view';
import { FlatGrid } from 'react-native-super-grid';

import { observer} from "mobx-react"

import Util from './Util.js';
import Icon from './Icon.js';
import Resource from './Resource.js';


import Unit from './Unit.js';
import ResourceRow from './ResourceRow.js';


import {MainContext} from './MainContext.js'
import {CityContext} from './CityContext.js'
import cityStore from './CityContext.js';
import mainStore from './MainContext.js';

import resources from './json/resource.json';


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
         height: mainStore.unitSize,
         width: mainStore.unitSize,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 1,

     }

});

const Tab = createMaterialTopTabNavigator();

const UnitScreen  = (observer((props) => {

    const city= mainStore.selectedCity;

    const build = (unit,onAction)=>{
        props.navigation.navigate('Build', {unit:unit});
        onAction();
    }
    const add = ()=>{
        cityStore.setNumber(2);
    }

    const disband= (unit,onAction)=>{
        city.disband(unit)
        onAction();

    }

    const assign = (unit,onAction)=>{
        if(unit.type=='farmer'){
            if(city.buildings.farm){
                city.removeUnit(unit);
                city.buildings.farm.addUnit(unit);
            }
        }else{
            props.navigation.navigate('Assign', {unit:unit});
        }


        onAction();
    }

    const action = (unit,onAction)=>{

        return <>
            {unit.state=='deploy'?
            null
            :<>
               {unit.data.action.build?<Menu.Item onPress={()=>build(unit,onAction)} title="Build"/>:null}
                {unit.data.action.assign?<Menu.Item onPress={() => assign(unit,onAction)} title="Assign"/>:null}
                <Menu.Item onPress={() =>disband(unit,onAction)} title="Disband"/>
            </>
            }
        </>
    }

  return (
    <View style={{padding:10}}>
        <View style={{flexDirection:'row',justifyContent:'space-between'}}>
             <View style={{flexDirection:'row'}}>
                <Icon icon="account" />
                <Text>Available Manpower {Util.number(Math.floor(city?.manpower))}</Text>
            </View>
             <View style={{flexDirection:'row'}}>
                <Button  style={{marginRight:2}} onPress={()=>props.navigation.navigate('Employ', {city:city})} icon="account-plus" mode="contained"  contentStyle={{marginLeft:16}} />
            </View>

        </View>
        <Caption>Idle Units</Caption>
             <FlatGrid
                  itemDimension={mainStore.unitSize}
                  data={city.units}

                  spacing={1}
                  renderItem={({ item }) => (
                    <Unit data={item}  action={(onAction)=>action(item,onAction)} />
                  )}
                />


    </View>
  );
}))

const BuildingScreen = (observer((props) => {

    const city= mainStore.selectedCity;

     const action = (unit,onAction)=>{

        return <>

        </>
    }

    const onPress = (building)=>{
         props.navigation.navigate('BuildingDetail', {building:building,city:city});
    }

   return (
     <View style={{padding:10}}>
         <Caption>Buildings</Caption>
          <FlatGrid
           itemDimension={mainStore.unitSize}
           data={Object.keys(city.buildings)}

           spacing={1}
           renderItem={({ item }) => {
               const key = item;
               const building = city.buildings[key];
                return <Unit data={building}
                    quantity={
                      ()=>(<Caption>{Util.number(building.completedQuantity)}/{Util.number(building.quantity)}</Caption>)
                    }
                    onPress={()=>onPress(building)}
                />
           }}
         />

     </View>
   );
}))


const ResourceScreen = (observer((props) => {

    const city= mainStore.selectedCity;

    const trade = (key,onAction)=>{
        city.addTrade(key)
        props.navigation.navigate('Trade');
        onAction();
    }

    const action = (key,onAction)=>{

        if(city.trade.includes(key)){

            return <Paragraph>This resource is already on trade</Paragraph>
        }
        const resource = resources[key];
        return <>
            <Paragraph>Trade with food</Paragraph>
            <View style={{flexDirection:'row',marginBottom:10}}>
                <Caption> 1 </Caption>
                <Resource icon={resource.icon}/>
                <Caption> {resource.name} To </Caption>
                <Caption> {resource.price} </Caption>
                <Resource icon={resources.food.icon}/>
                <Caption> {resources.food.name}</Caption>
            </View>
            <Button onPress={()=>trade(key,onAction)}>OK</Button>
        </>
    }

      return (
        <View style={{padding:10}}>
                 <Caption>Resources</Caption>

        <FlatGrid
           itemDimension={mainStore.unitSize}
           data={Object.keys(city.resources)}

           spacing={1}
           renderItem={({ item }) => {
                const key = item;
                const quantity = city.resources[key];
                const resource = resources[key];

               return   <Unit data={resource} action={(onAction)=>action(item,onAction)}
                    quantity={
                      ()=>(<Caption>{Util.number(quantity)}</Caption>)
                    }
               />
           }}
         />


        </View>
      );
}))



const TradeScreen = (observer((props) => {

    const city= mainStore.selectedCity;

    const remove = (key,onAction)=>{
        city.removeTrade(key)
        onAction();
    }

    const action = (key,onAction)=>{
        return <>
             <Menu.Item onPress={() =>remove(key,onAction)} title="Remove"/>
        </>
    }

      return (
        <View style={{padding:10}}>
           <Caption>Trade {city.buildings.trade?<>{city.trade.length}/{Math.min(city.buildings.trade.completedQuantity,city.buildings.trade.units.length)}</>:'0/0'}</Caption>


        <FlatGrid
           itemDimension={mainStore.unitSize}
           data={city.trade}

           spacing={1}
           renderItem={({ item }) => {
                const key = item;
                const resource = resources[key];

               return   <Unit data={resource}

               />
           }}
         />


        </View>
      );
}))


const InfoScreen =  (observer((props) => {

    const city= mainStore.selectedCity;

   return (
     <View style={{padding:10}}>

     </View>
   );
}))


const RoadScreen = (observer((props) => {

    const city= mainStore.selectedCity;


    const action = (key,onAction)=>{
        return <>
             <Menu.Item onPress={() =>remove(key,onAction)} title="Remove"/>
        </>
    }

      return (
        <View style={{padding:10}}>
             <Caption>Roads</Caption>
             {city.destinies.map(destiny=>{
                    const road = destiny.road;
                     return <Surface style={{marginBottom:4}}>
                        <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                            <View style={{flexDirection:'row',display:'flex',justifyContent:'center',padding:10}}>
                                   <View>
                                    <View style={{flexDirection:'row'}}>
                                        <Paragraph style={{position:'relative',top:-2,marginRight:2}}>To {destiny.city.name}</Paragraph>
                                        <Caption >{(destiny.length/1000).toFixed(1)}km</Caption>
                                    </View>
                                    <View style={{flexDirection:'row'}}>
                                        <Paragraph style={{position:'relative',top:-2,marginRight:2}}>Road type</Paragraph>
                                        <Caption >{road.type}</Caption>
                                    </View>
                                    <View style={{maxWidth:300}}>
                                        {road.type=='mountain'?<Caption >Travel time will be increased by 50% </Caption>:null}
                                        {road.type=='desert'?<>
                                            <Caption >In summer season (Apr-Sep), moral will decrease 50% faster</Caption>
                                            <Caption >Unit needs to carry water to survive</Caption>
                                        </>:null}
                                    </View>

                                </View>
                            </View>

                        </View>
                    </Surface>

             })}


        </View>
      );
}))

const TabBar = (props)=>{
    let color = null;
    if(!props.tabInfo.focused) color='silver';
    return <Icon icon={props.icon} color={color}/>
}


export  const  HeroInfo =  (observer((props) => {


    const { hero } = props.route.params;
    console.log("init")


    return <View contentContainerStyle={{ padding: 10,height:'100%' }} style={{height:'100%'}}>
         <View style={{flexDirection:'row',margin:5}}>
            <View style={{marginRight:5,width:73}}>
                <View style={{margin:5,height:76,alignItems:'center'}}>
                    <Avatar.Text style={{backgroundColor:'#ff1f13',margin:2}} size={36} label={hero.valor} />
                    <Subheading >Valor</Subheading>
                </View>

            </View>
            <View style={{width:270}}>
                <Paragraph >+{(hero.valor/2).toFixed(1)}% military unit extra damage when assigned to a group</Paragraph>
                <Paragraph >-{(hero.valor/2).toFixed(1)}% happiness cost of employing military unit when assigned as a governor</Paragraph>

            </View>
         </View>
          <View style={{flexDirection:'row',margin:5}}>
             <View style={{marginRight:5,width:73}}>

                 <View style={{margin:5,height:76,alignItems:'center'}}>
                     <Avatar.Text style={{backgroundColor:'#2780E3',margin:2}} size={36} label={hero.wisdom} />
                     <Subheading >Wisdom</Subheading>
                 </View>

             </View>
             <View style={{width:270}}>
                 <Paragraph >-{(hero.wisdom/5).toFixed(1)}% traveling unit food consumption when assigned to a group</Paragraph>
                 <Paragraph >{(hero.wisdom/10).toFixed(1)}% less trading commission when assigned to a group</Paragraph>
                 <Paragraph >-{(hero.wisdom/2).toFixed(1)}% happiness cost of employing non-military unit when assigned as a governor</Paragraph>
                 <Paragraph >+{(hero.wisdom/2).toFixed(1)}% production result when assigned to a production building</Paragraph>
             </View>
          </View>
           <View style={{flexDirection:'row',margin:5}}>
              <View style={{marginRight:5,width:73}}>

                  <View style={{margin:5,alignItems:'center'}}>
                      <Avatar.Text style={{backgroundColor:'#FF7518',color:'white',margin:2}} color="white" size={36} label={hero.authority} />
                      <Subheading >Authority</Subheading>
                  </View>
              </View>
              <View style={{width:270}}>
                  <Paragraph >+{(hero.authority/10).toFixed(1)} moral when assigned to a group</Paragraph>
                  <Paragraph >+{(hero.authority/100).toFixed(2)} happiness/month when assigned as a governor</Paragraph>
              </View>
           </View>
     </View>

}))