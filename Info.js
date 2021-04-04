import React, { useContext } from 'react';

import {  View,StyleSheet ,ScrollView,Text,TouchableOpacity,Dimensions   } from 'react-native';
import { Button ,Dialog,Modal,Portal ,Paragraph,List,IconButton,Caption,Subheading,Title,Divider ,Surface,Menu } from 'react-native-paper';

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

        {city?.factionData?.capital?.id == city.id?
            <View style={{flexDirection:'row'}}>
                <Icon icon="star"  />
            <Paragraph style={{position:'relative',top:-2}}>Capital City</Paragraph>
            </View>
        :null}
        <View style={{flexDirection:'row'}}>
            <Icon icon="account-multiple"  />
            <Paragraph style={{position:'relative',top:-2}}>Population </Paragraph><Caption>{Util.number(city?.population)}</Caption>
        </View>

        <View style={{flexDirection:'row'}}>
            <Icon icon="chess-rook"  />
            <Paragraph style={{position:'relative',top:-2}}>City defense </Paragraph>
            <Caption>{Math.floor(city.getDefense())}/100</Caption>
        </View>
        {Object.keys(city.rareResources).length>0?
        <>
            <Divider/>
            <Paragraph>Natural resources</Paragraph>
            {
                Object.keys(city.rareResources).map(key=>{
                    const resource = city.rareResources[key]
                    return <ResourceRow resource={key} suffix={resource.name}/>
                })
            }
        </>:null}
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


export  const  Info =  (observer((props) => {


    const { city } = props.route.params;

    mainStore.setSelectedCity(city);
    console.log("init")


    return <View contentContainerStyle={{ padding: 10,height:'100%' }} style={{height:'100%'}}>

         <Tab.Navigator
            tabBarOptions={{
                showIcon: true,
                      showLabel: false
                    }}
         >
          <Tab.Screen name="Info" component={InfoScreen}  options={{ tabBarIcon: (tabInfo)=>(<TabBar icon="information-outline" tabInfo={tabInfo}/>)}}/>
          <Tab.Screen name="Trade" component={TradeScreen}  options={{ tabBarIcon: (tabInfo)=>(<TabBar icon="cached" tabInfo={tabInfo}/>)}}/>
        <Tab.Screen name="Road" component={RoadScreen}  options={{ tabBarIcon: (tabInfo)=>(<TabBar icon="road-variant" tabInfo={tabInfo}/>)}}/>

        </Tab.Navigator>

     </View>

}))