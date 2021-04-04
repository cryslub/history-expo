import React, { Component } from 'react';
import {  View,StyleSheet ,ScrollView,Text,TouchableOpacity,Animated  } from 'react-native';
import { Button ,Dialog,Modal,Portal ,Paragraph,List,IconButton,Caption,Subheading,Title,Divider ,Surface,Menu } from 'react-native-paper';

import { FlatGrid } from 'react-native-super-grid';

import Icon from './Icon.js';
import Unit from './Unit.js';
import Util from './Util.js';
import Hero from './Hero.js';

import mainStore from './MainContext.js';
import { observer} from "mobx-react"
import { observable, computed, action } from 'mobx';

import resources from './json/resource.json';


export const Progress = (props)=>{
     const width = props.width
     const style = props.style
     style.width = width;
     return <Animated.View
         style={[StyleSheet.absoluteFill], style}
      >
      </Animated.View>
}


export const UnitScreen  = (observer((props) => {


    const unit = props.unit;
    const city= props.type=='group'?unit.city:mainStore.selectedCity;
    const units = props.type=='group'?unit.units.slice():city.units.slice();
    let heroes = props.type=='group'?unit.heroes:city.heroes;

    if(heroes){
        heroes = heroes.filter(hero => hero.assigned==undefined)
    }else{
        heroes = []
    }

    const build = (unit,onAction)=>{
        props.navigation.navigate('Build', {unit:unit});
        onAction();
    }


    const disband= (unit,onAction)=>{
        unit.disband()
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

    const assignHero = (hero)=>{
        props.navigation.navigate('Assign', {unit:{type:'hero',data:hero}});

    }

    const equip = (unit,onAction)=>{
        mainStore.pause();
        props.navigation.navigate('Equip', {unit:unit});

        onAction();
    }

    const move = (unit,onAction)=>{
        mainStore.move(unit);
        props.navigation.navigate('Home', {unit:unit});

        onAction();
    }

    const group = (unit,onAction)=>{

          props.navigation.navigate('Group', {city:city,unit:unit});

          onAction();
    }

    const leave = (u,onAction)=>{
        unit.removeUnit(u);
        city.addUnit(u);
        unit.checkCapacity()
        onAction();
    }

    const action = (unit,onAction)=>{

        return <>
            {unit.state=='deploy'?
            null
            :<>
                {unit.data.action.manage?<Menu.Item onPress={() => group(unit,onAction)} title="Manage"/>:null}
               {unit.data.action.build&&props.type!='group'?<Menu.Item onPress={()=>build(unit,onAction)} title="Build"/>:null}
                {unit.data.action.assign&&props.type!='group'?<Menu.Item onPress={() => assign(unit,onAction)} title="Assign"/>:null}
                {unit.data.action.equip?<Menu.Item onPress={() => equip(unit,onAction)} title="Inventory"/>:null}
                {unit.data.action.deploy&&props.type!='group'?
                    unit.type!='group'||unit.units.length>0?
                        city.happiness<=0&&unit.hasArmy()?
                        null
                        :<Menu.Item onPress={() => move(unit,onAction)} title="Move"/>
                    :null
                 :null
                }
                {props.type=='group'&&props.unit.state==''?<Menu.Item onPress={() => leave(unit,onAction)} title="Leave Group"/>:null}

                {props.type!='group'?<Menu.Item onPress={() =>disband(unit,onAction)} title="Disband"/>:null}
            </>
            }
        </>
    }

    const heroInfo = (hero)=>{

    }

  return (
    <View style={{padding:10}}>
        <View style={{flexDirection:'row',justifyContent:'space-between'}}>
        {props.type=='group'?
            <>
                 <View style={{flexDirection:'row'}}>
                </View>
                 <View style={{flexDirection:'row'}}>
                    {props.unit.state==''?
                    <Button dark={true} style={{marginRight:2}}   onPress={()=>props.navigation.navigate('SelectUnit', {city:city,unit:unit})} icon="account-plus" contentStyle={{marginLeft:16}} />
                    :null}
                </View>
            </>:<>
                 <View style={{flexDirection:'row'}}>
                    <Icon icon="account" />
                    <Paragraph>Available Manpower {Util.number(Math.floor(city?.manpower))} / {Util.number(city?.getMaxManpower())}</Paragraph>
                </View>
                 <View style={{flexDirection:'row'}}>
                    <Button  style={{marginRight:2}} onPress={()=>props.navigation.navigate('Employ', {city:city})} icon="account-plus" mode="contained"  labelStyle={{color:'white'}} contentStyle={{marginLeft:16}} />
                </View>
            </>
        }
        </View>
            <View style={{padding:5}}>
                {props.type=='group'?<>
                    <Caption>Units {unit.units.length}/10</Caption>
                </>:<Caption>Idle Units</Caption>
                }
                 <FlatGrid
                      itemDimension={mainStore.unitSize}
                      data={units}

                      spacing={1}
                      renderItem={({ item }) => (
                        <Unit data={item}  action={(onAction)=>action(item,onAction)} />
                      )}
                    />
             </View>

            <View style={{padding:5}}>
                {heroes&&heroes.length>0?<>
                    <Caption>Idle Heroes</Caption>
                </>:null
                }
                 <FlatGrid
                      itemDimension={mainStore.unitSize}
                      data={heroes}

                      spacing={1}
                      renderItem={({ item }) => (
                        <Hero data={item} assign={assignHero} navigation={props.navigation}/>
                      )}
                    />

             </View>

    </View>
  );
}))

@observer
export class Resources extends Component {

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
            }else if(this.state.amount ==10){
                this.setState({amount:100})
            }else{
                this.setState({amount:1})
            }
        }

        transferToUnit = (key)=>{
            const unit = this.props.unit;
             let city = unit.currentLocation;

             if(this.props.target != undefined){
                 city = this.props.target;
             }


            const quantity = Math.min(this.state.amount,        unit.capacity - unit.carrying)
            let consume = city.consumeResource(key,quantity)
            unit.addResource(key, consume);
        }

        transferToCity = (key)=>{
             const unit = this.props.unit;
             let city = unit.currentLocation;

            let condition = city.factionData.id==mainStore.selectedFaction.id;

            const target = this.props.target;
            if(target != undefined){
                city = target;
                condition = true;
            }

             if(condition){


                let quantity = this.state.amount
                if(target != undefined){
                    quantity = Math.min(this.state.amount,        target.capacity - target.carrying)
                }
                const consume = unit.consumeResource(key, quantity);
                city.addResource(key, consume);
            }
        }

    render(){

        const unit = this.props.unit;
        let city = unit.currentLocation;
        const deploy = unit.data.action.deploy;

        let condition = city.factionData.id==mainStore.selectedFaction.id;

        if(this.props.target != undefined){
            city = this.props.target;
            condition = true;
        }


        return <>
            {deploy==true?<>
               <Divider/>
                 <View style={{flexDirection:'row',display:'flex',justifyContent:'space-between'}}>
                   <Caption>Resources</Caption>
                   {condition?<View style={{flexDirection:'row'}}>
                       <Caption style={{    position: 'relative',top: 5}}> Transfer</Caption>
                       <Button onPress={()=>this.changeAmount()}>{this.state.amount}</Button>
                       <Caption style={{    position: 'relative',top: 5}}>unit{this.state.amount>1?'s':null} per click</Caption>
                   </View>:null}
               </View>
                 <View style={{flexDirection:'row',display:'flex',justifyContent:'space-between'}}>
                   <Caption></Caption>
                   <View style={{flexDirection:'row'}}>
                       <Caption > Can survive {unit.survivableDays} days with {unit.resources.food?Math.floor(unit.resources.food):0} foods</Caption>
                   </View>
               </View>

               <FlatGrid
                  itemDimension={mainStore.unitSize}
                  data={Object.keys(unit.resources)}

                  spacing={1}
                  renderItem={({ item }) => {
                       const key = item;
                       const quantity = unit.resources[key];
                       const resource = resources[key];

                      return   <Unit data={resource} onPress={()=>this.transferToCity(key)}
                           quantity={
                             ()=>(<Caption>{Util.number(Math.floor(quantity))}</Caption>)
                           }
                      />
                  }}
                />
                {condition?<>
                    <View style={{flexDirection:'row',display:'flex',justifyContent:'center'}}>
                       <Icon icon="arrow-up"/>
                       <Icon icon="arrow-down"/>
                   </View>
                   {this.props.target == undefined?
                   <Caption>City Resources</Caption>
                   :<Caption>Target Resources</Caption>
                   }
                   <FlatGrid
                      itemDimension={mainStore.unitSize}
                      data={Object.keys(city.resources)}

                      spacing={1}
                      renderItem={({ item }) => {
                           const key = item;
                           const quantity = city.resources[key];
                           const resource = resources[key];

                          return   <Unit data={resource} onPress={()=>this.transferToUnit(key)}
                               quantity={
                                 ()=>(<Caption>{Util.number(Math.floor(quantity))}</Caption>)
                               }
                          />
                      }}

                   />
                </>:null}
           </>:null}
       </>
    }
}

@observer
export class Moral extends Component {
    render (){
        const unit = this.props.unit;

        return <View style={{flexDirection:'row'}}>
               <Icon icon="account"  />
               <Caption>{Math.floor(unit.manpower)} </Caption>
               <Caption> {unit.state} </Caption>
               {unit.state=='traveling'||unit.state=='fighting'||unit.state=='waiting'?
                <>
               <Icon icon="heart"  />
               <Caption>{unit.moral.toFixed(2)}/100</Caption>

               <Paragraph> Origin </Paragraph>
               <Caption>{unit.city.name}</Caption>
               </>
               :null}
           </View>

     }
}

export class SubUnits {

    @observable units = [];

    getUnit(type){
        let ret;
        this.units.forEach(unit=>{
            if(unit.type==type){
                ret= unit;
            }
        })
        return ret;
    }


    getMilitaryUnits(armed){

        let ret = 0;
        this.units.forEach(unit=>{
            if(unit.type=='group'){
                ret+=unit.getMilitaryUnits(armed)
            }else{
                if(unit.category=='army'){
                    const damage = unit.getEffect('piercingDamage') + unit.getEffect('slashDamage') +unit.getEffect('bluntDamage')
                    if(armed=='armed'){
                        if(damage>0)  ret+=unit.men
                    }else if(armed=='unarmed'){
                        if(damage==0)  ret+=unit.men
                    }else{
                        ret+=unit.men
                    }
                }
            }
        })

        return ret;
    }

     @action
    refreshUnits(){
        this.units = this.units.splice(0);
    }
}