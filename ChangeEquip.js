import React, { Component } from 'react';
import {  View,StyleSheet ,ScrollView,Text,TouchableOpacity  } from 'react-native';
import { Button ,Dialog,Modal,Portal ,Paragraph,List,IconButton,Caption,Subheading,Title,Divider ,Surface,Menu,TextInput,Switch,RadioButton  } from 'react-native-paper';
import { FlatGrid } from 'react-native-super-grid';

import Popover from 'react-native-popover-view';

import Util from './Util.js';
import Icon from './Icon.js';
import Resource from './Resource.js';
import ResourceRow from './ResourceRow.js';


import Unit from './Unit.js';
import UnitData from './UnitData.js';

import buildings from "./json/building.json"
import resources from './json/resource.json';

import mainStore from './MainContext.js';

import {Resources,Moral} from './Common.js';

import { observer} from "mobx-react"

const styles = StyleSheet.create({

});




const Equipment = (props)=>{

    const e = props.data;

      const unit = props.unit;
    const city= unit.currentLocation;

    const equipped = unit.equipments[e.key]!=undefined;

    const [isSwitchOn, setIsSwitchOn] = React.useState(equipped);
     const [amount, setAmount] = React.useState(equipped?unit.equipments[e.key].amount:0);

     const onToggleSwitch = () => {


       city.bringResource(e.require,equipped)

        checkEquipments(equipped?0:1)

        unit.checkCapacity();
        unit.refreshEquipment();

        setIsSwitchOn(!isSwitchOn);
     }


    const bringResource = (eqd)=>{
        Object.keys(e.require).forEach(key=>{
            let quantity = e.require[key];
            if(!eqd){
                quantity *= -1;
            }
            city.resources[key] += quantity;
         })
    }


    const checkEquipments = (amount)=>{
        if(amount ==0){
            unit.equipments[e.key] = undefined;
        }else{
            unit.equipments[e.key] = {data:e,amount:amount};
        }
    }

    const resourceJobs = (b)=>{
        setAmount(b)
        checkEquipments(b);
        unit.checkCapacity()
        unit.refreshEquipment();
    }

    const minus = (a) =>{
        const b = Math.max(0,amount-a)
        city.bringResource(e.require,true)
        resourceJobs(b)
	}
	const plus = (a,key) =>{
        const b =amount+a
        city.bringResource(e.require,false)
       resourceJobs(b)
	}


    let disabled = unit.state==''?false:true;
    if(!equipped||e.instant==true){
         Object.keys(e.require).forEach(key=>{
               if(city.resources[key]==undefined || city.resources[key]<e.require[key]  ){
                    disabled = true;
                    return false;
               }
               if(e.effect != undefined && e.effect.capacity!=undefined)  {
                   if(unit.capacity+e.effect.capacity<unit.carrying()){
                        disabled = true;
                        return false;
                   }
               }
         })
     }

    return  <Surface style={{marginBottom:10,padding:10}}>
       <View style={{flexDirection:'row'}}>
            {e.instant==true?
             <>
                 <Button  style={{minWidth:0,width:28}} disabled={amount==0} icon="minus" contentStyle={{marginLeft:12}} onPress={()=>minus(1)}/>
                 <Paragraph style={{marginTop:-1}}>{amount}</Paragraph>
                 <Button  style={{minWidth:0,width:28}} disabled={disabled} icon="plus" contentStyle={{marginLeft:12}} onPress={()=>plus(1)}/>
             </>
            :<Switch value={isSwitchOn} onValueChange={onToggleSwitch} disabled={disabled}/>}

           <Subheading style={{marginLeft:5,top: -3,position: 'relative'}}>{e.name} </Subheading>

       </View>
        <Caption>{e.description} </Caption>
       <View style={{flexDirection:'row'}}>

           <Paragraph >Require</Paragraph>
           {
               Object.keys(e.require).map(key=>{
                   return <>
                       <Paragraph style={{marginLeft:5}}> </Paragraph>
                       <ResourceRow prefix={resources[key].name} resource={key} suffix={e.require[key]}/>
                   </>

               })
           }
       </View>
   </Surface>
}



export const ChangeEquip = (props)=>{


		const { unit } = props.route.params;
		 const city = unit.currentLocation;
		const { key } = props.route.params;

        let equipIndex = 0;
        if(unit.equipments[key]){
            unit.data.action.equip[key].forEach((equipment,index)=>{
                if(equipment == unit.equipments[key].data)   equipIndex = index+1;
            })
        }

        const [value, setValue] = React.useState(equipIndex);


        const change = (id)=>{
            unit.equipments[key] = {data:unit.data.action.equip[key][id-1],amount:1}

        }

		return <ScrollView contentContainerStyle={{ padding: 10 }}>
		     <RadioButton.Group onValueChange={value => {setValue(value);change(value)}} value={value}>
            {
                unit.data.action.equip[key].map((equipment,index)=>{


                    let disabled = unit.state==''?false:true;
                    if(!equipped||e.instant==true){
                         Object.keys(e.require).forEach(key=>{
                               if(city.resources[key]==undefined || city.resources[key]<e.require[key]  ){
                                    disabled = true;
                                    return false;
                               }
                               if(e.effect != undefined && e.effect.capacity!=undefined)  {
                                   if(unit.capacity+e.effect.capacity<unit.carrying()){
                                        disabled = true;
                                        return false;
                                   }
                               }
                         })
                     }

                    return <RadioButton.Item  label={
                        <Equipment data={equipment} unit={unit}/>
                   } value={index+1} />
                })
            }
            </RadioButton.Group>
	     </ScrollView>

}