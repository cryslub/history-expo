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
    const index = props.index


    return  <Surface style={{marginBottom:10,padding:10,width:300,minHeight:80}} key={'equipment-'+index}>
       <View style={{flexDirection:'row'}}>
           <Subheading style={{marginLeft:5,top: -3,position: 'relative'}}>{e.name} </Subheading>

       </View>
       <Caption>{e.description} </Caption>
       {e.require?
       <View style={{flexDirection:'row'}}>
           <Paragraph >Require</Paragraph>
           {
               Object.keys(e.require).map(key=>{
                   return <View key={key}>
                       <Paragraph style={{marginLeft:5}}> </Paragraph>
                       <ResourceRow prefix={resources[key].name} resource={key} suffix={e.require[key]}/>
                   </View>

               })
           }
       </View>
       :null}
   </Surface>
}



export const ChangeEquip = (props)=>{


		const { unit } = props.route.params;
		 const city = unit.currentLocation;
		const { key } = props.route.params;
		const equipment = unit.equipments[key];

        let equipIndex = 1;
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
            if(id==1){
                unit.setEquipment(key,undefined)
            }else{
                const equipment = unit.data.action.equip[key][id-2];
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

		return <ScrollView contentContainerStyle={{ padding: 10 }}>
		     <RadioButton.Group onValueChange={value => {setValue(value);change(value)}} value={value}>
                 <RadioButton.Item   label={
                     <Equipment data={{name:'None'}} unit={unit}/>
                } value={1} />
                {

                    unit.data.action.equip[key].map((equipment,index)=>{


                        return <RadioButton.Item  key={index} disabled={!unit.isEquipmentAvailable(equipment)} label={
                            <Equipment data={equipment} unit={unit} index={index} key={index}/>
                       } value={index+2} />
                    })
                }
            </RadioButton.Group>
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