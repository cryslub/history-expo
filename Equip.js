import React, { Component } from 'react';
import {  View,StyleSheet ,ScrollView,Text,TouchableOpacity  } from 'react-native';
import { Button ,Dialog,Modal,Portal ,Paragraph,List,IconButton,Caption,Subheading,Title,Divider ,Surface,Menu,TextInput,Switch  } from 'react-native-paper';
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
         height: 60,
         width: 60,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 1,
        margin:2
     }
});




const NearByUnit = (props) =>{

    const unit = props.unit;

    let currentPosition = unit.currentLocation?.name;
    if(unit.currentRoad!=undefined){
        const destinies = unit.currentRoad.destinies
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
                    <Button  style={{position:'relative',top:8,minWidth:40,width:40,marginRight:2,paddingTop:3}} icon="swap-horizontal" color="grey" onPress={()=>props.onExchange(unit)}/>
               </View>

           </View>
           <View style={{flexDirection:'row',justifyContent:'space-between',height:28,margin:9}} >
                <View style={{flexDirection:'row'}}>
                    <Paragraph>Location </Paragraph>
                   <Caption >{currentPosition}</Caption>
               </View>
                <View style={{flexDirection:'row'}}>
                    <Paragraph>Origin </Paragraph>
                   <Caption >{unit.city.name}</Caption>
               </View>
           </View>
       </Surface>
}


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
         const { unit } = this.props.route.params;
         const city = unit.currentLocation;

        const quantity = Math.min(this.state.amount,        unit.capacity - unit.carrying())
        let consume = city.consumeResource(key,quantity)
        unit.addResource(key, consume);
    }

    transferToCity = (key)=>{
         const { unit } = this.props.route.params;
         const city = unit.currentLocation;
         if(city.factionData.id==mainStore.selectedFaction.id){


            const quantity = this.state.amount
            const consume = unit.consumeResource(key, quantity);
            city.addResource(key, consume);
        }
    }

    onExchange = (target)=>{
        const { unit } = this.props.route.params;
        this.props.navigation.navigate('Exchange', {unit:unit,target:target});
    }

	render(){

		const { unit } = this.props.route.params;
		 const city = unit.currentLocation;

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
                   <Paragraph >Capacity </Paragraph>
                   {unit.inGroup!=true?<Caption>{Math.floor(unit.carrying())}/</Caption>:null}
                   <Caption>{unit.capacity} units</Caption>
                   <Paragraph style={{marginLeft:5}}>Speed </Paragraph>
                   <Caption>{unit.speed}km/day</Caption>
                </View>
                <Divider/>
            </>:null}
            <Caption>Equipments</Caption>
            {
                equip.map(e=>{
                    return <Equipment data={e} unit={unit}/>
                })
            }
            {unit.inGroup!=true?<Resources unit={unit} />:null}

            <Caption>Near by units</Caption>
            {
                unit.nearByUnits.map(u=>{
                    return <NearByUnit unit={u} onExchange={this.onExchange}/>
                })
            }
	     </ScrollView>
	}
	
}