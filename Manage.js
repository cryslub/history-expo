import React, { useContext } from 'react';

import {  View,StyleSheet ,ScrollView,Text,TouchableOpacity,Dimensions ,SafeAreaView   } from 'react-native';
import { Button ,Dialog,Modal,Portal ,Paragraph,List,IconButton,Caption,Subheading,Title,Divider ,Surface,Menu } from 'react-native-paper';


import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import { Ionicons } from '@expo/vector-icons';

import { TabView, SceneMap } from 'react-native-tab-view';
import { FlatGrid } from 'react-native-super-grid';

import { observer} from "mobx-react"

import Util from './Util.js';
import Icon from './Icon.js';
import ResourceIcon from './ResourceIcon.js';


import Unit from './Unit.js';

import cityStore from './CityContext.js';
import mainStore from './MainContext.js';

import {UnitScreen,InfoContent,TradeScreen,RoadScreen} from './Common.js'
import i18n from 'i18n-js';


const Tab = createMaterialTopTabNavigator();

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
     <ScrollView style={{padding:10}}>
         <Caption>{i18n.t("ui.manage.building.buildings")} </Caption>
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

     </ScrollView>
   );
}))


const ResourceScreen = (observer((props) => {

    const city= mainStore.selectedCity;

    const trade = (key,onAction)=>{
        city.addTrade(key)
        onAction();
    }

    const action = (key,onAction)=>{

        const resource = mainStore.data.resources[key];


        const desc=<>
             <View style={{flexDirection:'row',marginBottom:10}}>
                 <Caption> 1 </Caption>
                 <ResourceIcon icon={resource.icon} color={resource.color}/>
                 <Caption> {i18n.t("ui.manage.resource.is worth for")} </Caption>
                 <Caption> {resource.price} </Caption>
                 <ResourceIcon icon={mainStore.data.resources.food.icon}  color={mainStore.data.resources.food.color}/>
             </View>
        </>

        if(city.trade.includes(key)){

            return <Paragraph>This resource is already on trade</Paragraph>
        }

        let limitExceeded = false;
        if(city.buildings.trade==undefined){
            if(city.trade.length>=5){
                limitExceeded = true;
            }
        }else{
            if((city.buildings.trade.completedQuantity+1)*5<=city.trade.length || (city.buildings.trade.units.length+1)*5<=city.trade.length){
                limitExceeded = true;
            }
        }

        if(limitExceeded){
            return <>
                 {desc}
                <Paragraph>You need extra trading post with merchant in your city</Paragraph>
            </>
        }

        return <>
            {desc}
            <Button onPress={()=>trade(key,onAction)}>{i18n.t("ui.button.ok")}</Button>
        </>
    }

      return (
        <ScrollView  >
            <View style={{padding:10}}>
                <Caption>{i18n.t("ui.manage.resource.resources")} </Caption>

                <FlatGrid
                   itemDimension={mainStore.unitSize}
                   data={Object.keys(city.resources)}

                   spacing={1}
                   renderItem={({ item }) => {
                        const key = item;
                        const quantity = city.resources[key];
                        const resource = mainStore.data.resources[key];

                       return   <Unit data={resource} action={(onAction)=>action(item,onAction)}
                            quantity={
                              ()=>(<Caption>{Util.number(Math.floor(quantity))}</Caption>)
                            }
                       />
                   }}
                 />
             </View>

            <TradeScreen {...props}/>

        </ScrollView >
      );
}))





const InfoScreen =  (observer((props) => {

   return (
        <InfoContent navigation={props.navigation}/>
   );
}))


const TabBar = (props)=>{
    let color = null;
    if(!props.tabInfo.focused) color='silver';
    return <Icon icon={props.icon} color={color}/>
}


export  const  Manage =  (observer((props) => {


    const { city } = props.route.params;

    mainStore.setSelectedCity(mainStore.data.cities[city]);


    return <View contentContainerStyle={{ padding: 10,height:'100%' }} style={{height:'100%'}}>

         <Tab.Navigator
            tabBarOptions={{
                showIcon: true,
                      showLabel: false
                    }}
         >
          <Tab.Screen name="Info" component={InfoScreen}  options={{ tabBarIcon: (tabInfo)=>(<TabBar icon="information-outline" tabInfo={tabInfo}/>)}}/>
          <Tab.Screen name="Unit" component={UnitScreen}  options={{ tabBarIcon: (tabInfo)=>(<TabBar icon="account" tabInfo={tabInfo}/>)}}/>
          <Tab.Screen name="Building" component={BuildingScreen}  options={{ tabBarIcon: (tabInfo)=>(<TabBar icon="home" tabInfo={tabInfo}/>)}}/>
          <Tab.Screen name="Resource" component={ResourceScreen}  options={{ tabBarIcon: (tabInfo)=>(<TabBar icon="barley" tabInfo={tabInfo}/>)}}/>
          <Tab.Screen name="Road" component={RoadScreen}  options={{ tabBarIcon: (tabInfo)=>(<TabBar icon="road-variant" tabInfo={tabInfo}/>)}}/>


        </Tab.Navigator>

     </View>

}))