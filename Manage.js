import React, { useContext } from 'react';

import {  View,StyleSheet ,ScrollView,Text,TouchableOpacity,Dimensions   } from 'react-native';
import { Button ,Dialog,Modal,Portal ,Paragraph,List,IconButton,Caption,Subheading,Title,Divider ,Surface,Menu } from 'react-native-paper';

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


import cityStore from './CityContext.js';
import mainStore from './MainContext.js';

import resources from './json/resource.json';

import {UnitScreen} from './Common.js'


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
        onAction();
    }

    const action = (key,onAction)=>{

        const resource = resources[key];


        const desc=<>
             <View style={{flexDirection:'row',marginBottom:10}}>
                 <Caption> 1 </Caption>
                 <Resource icon={resource.icon} color={resource.color}/>
                 <Caption> is worth for </Caption>
                 <Caption> {resource.price} </Caption>
                 <Resource icon={resources.food.icon}  color={resources.food.color}/>
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
            <Button onPress={()=>trade(key,onAction)}>OK</Button>
        </>
    }

      return (
        <ScrollView style={{padding:10}}>
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
                      ()=>(<Caption>{Util.number(Math.floor(quantity))}</Caption>)
                    }
               />
           }}
         />

        <TradeScreen {...props}/>

        </ScrollView>
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
        <View style={{paddingTop:10}}>
                 <Caption>Selling
                    {city.buildings.trade?
                        <>{city.trade.length}/(1+{Math.min(city.buildings.trade.completedQuantity,city.buildings.trade.units.length)})*5</>
                     :city.trade.length+'/5'}
                 </Caption>

        <FlatGrid
           itemDimension={mainStore.unitSize}
           data={city.trade}

           spacing={1}
           renderItem={({ item }) => {
                const key = item;
                const resource = resources[key];

               return   <Unit data={resource} action={(onAction)=>action(item,onAction)}

               />
           }}
         />


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


const InfoScreen =  (observer((props) => {

    const city= mainStore.selectedCity;

    const change = ()=>{
        props.navigation.navigate('HeroList', {city:city});
    }

    const changeChancellor = ()=>{
        props.navigation.navigate('SelectChancellor', {city:city});
    }

   return (
     <View style={{padding:10}}>


        <View style={{flexDirection:'row'}}>
             <Icon icon="bank"  />
            <Paragraph  style={{position:'relative',top:-2}}>Governor </Paragraph>
            <Caption>{city.governor==undefined?'None':city.governor.name}</Caption>
                <Button icon="playlist-edit" onPress={()=>change()} />
        </View>
        <View style={{flexDirection:'row'}}>
             <Icon icon="bank"  />
            <Paragraph  style={{position:'relative',top:-2}}>Chancellor </Paragraph>
            <Caption>{city.chancellor==undefined?'None':city.chancellor.name}</Caption>
                <Button icon="playlist-edit" onPress={()=>changeChancellor()} />
        </View>

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
            <Icon icon="barley"  />
            <Paragraph style={{position:'relative',top:-2}}>Food consumption </Paragraph>
            <Caption> {Util.number(city?.getFoodConsumption())}/day {Util.number(city?.getFoodConsumption()*365)}/year</Caption>
        </View>
        <View style={{flexDirection:'row'}}>
            <Caption style={{marginLeft:22}}>Consumption rate</Caption>

        </View>
        <View style={{flexDirection:'row'}}>
            <Button style={{position:'relative',top:-7}} labelStyle={{fontSize:20,margin:0,position:'relative',top:-3}} onPress={()=>city.addFoodConsumptionRate(-0.5)}>-</Button>
            <Paragraph>{city.foodConsumptionRate}</Paragraph>
            <Button style={{position:'relative',top:-7}} labelStyle={{fontSize:20,margin:0,position:'relative',top:-3}} onPress={()=>city.addFoodConsumptionRate(0.5)}>+</Button>
            <Caption style={{marginLeft:15}}>{city.getHappinessGrowthText()} happiness/month</Caption>
        </View>

        <View style={{flexDirection:'row'}}>
            <Icon icon="heart"  />
            <Paragraph style={{position:'relative',top:-2}}>Happiness </Paragraph>
            <Caption>{city.happiness.toFixed(2)}/{city.maxHappiness}</Caption>
        </View>
        <View style={{flexDirection:'row'}}>
            <Icon icon="hospital-box"  />
            <Paragraph style={{position:'relative',top:-2}}>Hygiene </Paragraph>
            <Caption>{city.getHygiene()}/65</Caption>
        </View>

        <View style={{flexDirection:'row'}}>
            <Icon icon="account-multiple-plus"  />
            <Paragraph style={{position:'relative',top:-2}}>Population Growth rate </Paragraph>
            <Caption>{city.getGrowthRate()}%/year</Caption>
        </View>

        <Divider/>
        <View style={{flexDirection:'row'}}>
            <Icon icon="sword-cross"  />
            <Paragraph style={{position:'relative',top:-2}}>Military Units </Paragraph>
            <Caption>{city.getMilitaryUnits()} </Caption>
            <Paragraph style={{position:'relative',top:-2}}>Armed </Paragraph>
            <Caption>{city.getMilitaryUnits('armed')} </Caption>
            <Paragraph style={{position:'relative',top:-2}}>Unarmed </Paragraph>
            <Caption>{city.getMilitaryUnits('unarmed')} </Caption>

        </View>

        <View style={{flexDirection:'row'}}>
            <Icon icon="chess-rook"  />
            <Paragraph style={{position:'relative',top:-2}}>City defense </Paragraph>
            <Caption>{Math.floor(city.getDefense())}/{city.getDefenseMax()}</Caption>
        </View>
        {city.snapshotSub?.resource?
        <>
            <Divider/>
            <Paragraph>Natural resources</Paragraph>
            {
                Object.keys(city.snapshotSub.resource).map(key=>{
                    const resource = city.snapshotSub.resource[key]
                    return <ResourceRow resource={key} suffix={resources[key].name} lv={resource}/>
                })
            }
        </>:null}
     </View>
   );
}))


const TabBar = (props)=>{
    let color = null;
    if(!props.tabInfo.focused) color='silver';
    return <Icon icon={props.icon} color={color}/>
}


export  const  Manage =  (observer((props) => {


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
          <Tab.Screen name="Unit" component={UnitScreen}  options={{ tabBarIcon: (tabInfo)=>(<TabBar icon="account" tabInfo={tabInfo}/>)}}/>
          <Tab.Screen name="Building" component={BuildingScreen}  options={{ tabBarIcon: (tabInfo)=>(<TabBar icon="home" tabInfo={tabInfo}/>)}}/>
          <Tab.Screen name="Resource" component={ResourceScreen}  options={{ tabBarIcon: (tabInfo)=>(<TabBar icon="barley" tabInfo={tabInfo}/>)}}/>
          <Tab.Screen name="Road" component={RoadScreen}  options={{ tabBarIcon: (tabInfo)=>(<TabBar icon="road-variant" tabInfo={tabInfo}/>)}}/>


        </Tab.Navigator>

     </View>

}))