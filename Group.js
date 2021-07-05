import React, { useContext } from 'react';
import {  View,StyleSheet ,ScrollView,Text,TouchableOpacity  } from 'react-native';
import { Button ,Dialog,Modal,Portal ,Paragraph,List,IconButton,Caption,Subheading,Title,Divider ,Surface,Menu,TextInput } from 'react-native-paper';
import { FlatGrid } from 'react-native-super-grid';

import Popover from 'react-native-popover-view';

import Util from './Util.js';
import Icon from './Icon.js';
import Hero from './Hero.js';


import Unit from './Unit.js';
import UnitData from './UnitData.js';


import { observer,inject } from "mobx-react"

import mainStore from './MainContext.js';

import {UnitScreen,Resources,Moral,NearByUnit} from './Common.js'

import i18n from 'i18n-js';



export const Group =  (observer((props) => {

         const unit = props.route.params.unit

    const removeHero = ()=>{
        const city = unit.currentLocation;
        //city.addHero(unit.hero);
        unit.removeHero()
    }

    const onExchange = (target)=>{
         const unit = mainStore.selectedUnit

        props.navigation.navigate('Exchange', {unit:unit,target:target});
    }

    const removable = unit.state=='' || (unit.currentRoad == undefined && unit.currentLocation.factionData.id==unit.city.factionData.id)


      return (
        <ScrollView >
             <View style={{padding:10}}>
                <Moral unit={unit}/>

                <View style={{flexDirection:'row'}}>
                   <Paragraph>{i18n.t("ui.equip.capacity")} </Paragraph>
                   <Caption>{Math.floor(unit.carrying)}/{unit.capacity} {i18n.t("ui.equip.units")}</Caption>
                   <Paragraph style={{marginLeft:5}}>{i18n.t("ui.equip.speed")} </Paragraph>
                   <Caption>{unit.speed}km/{i18n.t("ui.common.day")}</Caption>
                </View>
                <Divider/>
            {unit.hero!=undefined?<>
                <Caption>{i18n.t("ui.equip.leader")}</Caption>
                <Hero data={unit.hero}  {...props} type='group' remove={removeHero} removable={removable}/>
            </>:null
            }
            </View>
             <UnitScreen unit={unit} type='group' {...props} editable={removable}/>


             <View style={{padding:10}}>
                 <Resources unit={unit} editable={removable}/>
             </View>

             {unit.nearByUnits.length>0?
             <>
                 <Caption>{i18n.t("ui.equip.near by units")}</Caption>
                 {
                     unit.nearByUnits.map((u,index)=>{
                         return <NearByUnit key={index} unit={u} onExchange={onExchange}/>
                     })
                 }
             </>:null
             }
        </ScrollView>
      );

	
}))