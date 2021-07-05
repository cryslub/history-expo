import React, { Component } from 'react';
import {  View,StyleSheet ,ScrollView,Text,TouchableOpacity  } from 'react-native';
import { Button ,Dialog,Modal,Portal ,Paragraph,List,IconButton,Caption,Subheading,Title,Divider ,Surface,Menu,TextInput,Switch  } from 'react-native-paper';
import { FlatGrid } from 'react-native-super-grid';

import Popover from 'react-native-popover-view';

import Util from './Util.js';
import Icon from './Icon.js';
import ResourceRow from './ResourceRow.js';


import Unit from './Unit.js';
import UnitData from './UnitData.js';

import buildings from "./json/building.json"

import mainStore from './MainContext.js';

import {Resources,Moral,NearByUnit} from './Common.js';

import { observer} from "mobx-react"
import i18n from 'i18n-js';



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
                   if(unit.capacity+e.effect.capacity<unit.carrying){
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
       <View style={{flexDirection:'row'}}>
            <Caption>{e.description} </Caption>
        </View>
       <View style={{flexDirection:'row'}}>

           <Paragraph >Require</Paragraph>
           {
               Object.keys(e.require).map(key=>{
                   return <>
                       <Paragraph style={{marginLeft:5}}> </Paragraph>
                       <ResourceRow prefix={mainStore.data.resources[key].name} resource={key} suffix={e.require[key]}/>
                   </>

               })
           }
       </View>
   </Surface>
}

@observer
export default class Equip extends Component {

    constructor(){
		super();

	    this.state={
            visible :false,
            amount:1
        }


	}
    changeAmount = ()=>{
        if(this.state.amount ==1){
            this.setState({amount:10})
        }else{
            this.setState({amount:1})
        }
    }

    transferToUnit = (key)=>{
         const unit = mainStore.selectedUnit
         const city = unit.currentLocation;

        const quantity = Math.min(this.state.amount,        unit.capacity - unit.carrying)
        let consume = city.consumeResource(key,quantity)
        unit.addResource(key, consume);
    }

    transferToCity = (key)=>{
         const unit = mainStore.selectedUnit

         const city = unit.currentLocation;
         if(city.factionData.id==mainStore.selectedFaction.id){


            const quantity = this.state.amount
            const consume = unit.consumeResource(key, quantity);
            city.addResource(key, consume);
        }
    }

    onExchange = (target)=>{
         const unit = mainStore.selectedUnit

        this.props.navigation.navigate('Exchange', {unit:unit,target:target});
    }

    change = (key)=>{
         const unit = mainStore.selectedUnit

        this.props.navigation.navigate('ChangeEquip', {key:key});
    }

	render(){

         const unit = mainStore.selectedUnit

		 const city = unit.currentLocation;

		 const editable =  city.factionData.id==mainStore.selectedFaction.id && unit.currentRoad == undefined;

		const arr = Object.keys(city.buildings).filter(key=>{
		    const building = city.buildings[key];
		    if(building.data.production){

                return (building.data.production.worker==unit.type)

            }else if(building.data.trade){
                return (building.data.trade.worker==unit.type)

            }else{
                return false;
            }
		});
        const equip = unit.data.action.equip
        const deploy = unit.data.action.deploy;

		return <ScrollView contentContainerStyle={{ padding: 10 }}>
            <Moral unit={unit}/>

		    {deploy==true?<>
                <View style={{flexDirection:'row'}}>
                   <Paragraph >{i18n.t("ui.equip.capacity")} </Paragraph>
                   {unit.inGroup!=true?<Caption>{Math.floor(unit.carrying)}/</Caption>:null}
                   <Caption>{unit.capacity} {i18n.t("ui.equip.units")}</Caption>
                   <Paragraph style={{marginLeft:5}}>{i18n.t("ui.equip.speed")} </Paragraph>
                   <Caption>{unit.speed}km/{i18n.t("ui.common.day")}</Caption>
                </View>
                <Divider/>
            </>:null}
            {equip!=null?
            <>
                <Caption>{i18n.t("ui.equip.equipments")}</Caption>
                {
                    Object.keys(equip).map((key,index)=>{
                        const path = "unit."+unit.data.type+".equip."+key

                        return <View style={{flexDirection:'row'}} key={key}>
                            <Paragraph>{i18n.t("ui.equip.type."+key)} </Paragraph>
                            <Caption> {unit.equipments[key]==undefined?i18n.t("ui.equip.none"):unit.equipments[key].data.name} </Caption>
                            {editable?
                            <Button icon="playlist-edit" onPress={()=>this.change(key)} />
                            :null
                            }
                        </View>
                    })
                }
            </>
            :null}

            {unit.inGroup!=true?<>
                <Resources unit={unit} />
                {unit.nearByUnits.length>0?
                <>
                    <Caption>{i18n.t("ui.equip.near by units")}</Caption>
                    {
                        unit.nearByUnits.map((u,index)=>{
                            return <NearByUnit key={index} unit={u} onExchange={this.onExchange}/>
                        })
                    }
                </>:null
                }
            </>:null}

	     </ScrollView>
	}
	
}