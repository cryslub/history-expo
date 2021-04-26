import React, { Component } from 'react';
import {  View,StyleSheet ,ScrollView,Text,TouchableOpacity  } from 'react-native';
import { Button ,Dialog,Modal,Portal ,Paragraph,List,IconButton,Caption,Subheading,Title,Divider ,Surface,Menu,TextInput,Switch,RadioButton  } from 'react-native-paper';
import { FlatGrid } from 'react-native-super-grid';

import Popover from 'react-native-popover-view';

import Util from './Util.js';
import Icon from './Icon.js';
import ResourceRow from './ResourceRow.js';


import Unit from './Unit.js';
import UnitData from './UnitData.js';

import buildings from "./json/building.json"

import mainStore from './MainContext.js';

import {Resources,Moral} from './Common.js';

import { observer} from "mobx-react"

const styles = StyleSheet.create({

});




const Equipment = (props)=>{

    const e = props.data;
    const unit = props.unit;
    const index = props.index
    const city = props.city;

    const onSelect = ()=>{
        if(!props.disabled)
            props.onSelect()
    }

    return  <Surface style={{marginBottom:10,padding:10,width:'100%',minHeight:80,opacity:props.disabled?0.5:1}} >
        <TouchableOpacity onPress={onSelect}>
           <View style={{flexDirection:'row'}}>
               <Subheading style={{marginLeft:5,top: -3,position: 'relative'}}>{e.name} </Subheading>
                {props.equipped?<Icon icon="check-bold" style={{right: -24,position: 'absolute'}} />:null}
           </View>
           <Caption>{e.description} </Caption>
           {e.require?
           <View style={{flexDirection:'row'}}>
               <Paragraph >Require</Paragraph>
               {
                   Object.keys(e.require).map(key=>{

                        const availability = city.resources[key]>=e.require[key]

                       return <>
                           <Paragraph style={{marginLeft:2}}> </Paragraph>
                           <ResourceRow prefix={mainStore.data.resources[key].name} resource={key} suffix={e.require[key]} color={availability?'white':'red'}/>
                       </>

                   })
               }
           </View>
           :null}
       </TouchableOpacity>
   </Surface>
}



export const ChangeEquip = (props)=>{


         const unit = mainStore.selectedUnit

		 const city = unit.currentLocation;
		const { key } = props.route.params;
		const equipment = unit.equipments[key];

        let equipIndex = 0;
        if(unit.equipments[key]){
            unit.data.action.equip[key].forEach((equipment,index)=>{
                if(equipment == unit.equipments[key].data)   equipIndex = index+2;
            })
        }

        const [value, setValue] = React.useState(equipIndex);
      const [amount, setAmount] = React.useState(unit.equipments[key]?unit.equipments[key].amount:0);

        const bringResource = (eqd,e,amount)=>{
            Object.keys(e.require).forEach(key=>{
                let quantity = e.require[key];
                if(!eqd){
                    quantity *= -1;
                }
                city.resources[key] += quantity*amount;
             })
        }

        const change = (id)=>{
            console.log(id)
            if(unit.equipments[key]){
                bringResource(true,unit.equipments[key].data,unit.equipments[key].amount)
            }
            if(id==0){
                unit.setEquipment(key,undefined)
            }else{
                const equipment = unit.data.action.equip[key][id-1];
                unit.setEquipment(key,{data:equipment,amount:1})
                setAmount(1)
                bringResource(false,equipment,1)
            }

        }

        const minus = (a) =>{
            const b = Math.max(0,equipment.amount-a)
            city.bringResource(equipment.data.require,true)
            resourceJobs(b)
        }
        const plus = (a) =>{
            const b =equipment.amount+a
            city.bringResource(equipment.data.require,false)
           resourceJobs(b)
        }

          const resourceJobs = (b)=>{
            setAmount(b)
            unit.setEquipment(key,{data:equipment.data,amount:b})
//            checkEquipments(b);
            unit.checkCapacity()
            unit.refreshEquipment();
        }

         const checkEquipments = (amount)=>{
            if(amount ==0){
                unit.equipments[key] = undefined;
            }else{
                unit.equipments[key] = {data:e,amount:amount};
            }
        }

        const onSelect = (value)=>{
            setValue(value);
            change(value)
        }

		return <ScrollView contentContainerStyle={{ padding: 10 }}>
            <Equipment data={{name:'None'}} unit={unit}  equipped={value==0} onSelect={()=>onSelect(0)}/>
            {unit.data.action.equip[key].map((equipment,index)=>{
                    return <Equipment data={equipment} unit={unit} city={city} index={index+1} key={index} equipped={(index+1)==value}
                        disabled={!unit.isEquipmentAvailable(equipment)} onSelect={()=>onSelect(index+1)}/>
                })
            }
             {equipment?.data.instant==true?
                <View style={{flexDirection:'row'}}>
                    <Paragraph>Quantity </Paragraph>
                    <Button  style={{minWidth:0,width:28}} disabled={amount<=1} icon="minus" contentStyle={{marginLeft:12}} onPress={()=>minus(1)}/>
                    <Paragraph style={{marginTop:-1}}>{amount}</Paragraph>
                    <Button  style={{minWidth:0,width:28}}  disabled={!unit.isEquipmentAvailable(equipment.data)}  icon="plus" contentStyle={{marginLeft:12}} onPress={()=>plus(1)}/>
                </View>
               :null}
	     </ScrollView>

}