import React, { Component } from 'react';
import {  View,StyleSheet ,ScrollView,Text,TouchableOpacity,Animated,SafeAreaView  } from 'react-native';
import { Button ,Dialog,Modal,Portal ,Paragraph,List,IconButton,Caption,Subheading,Title,Divider ,Surface,Menu } from 'react-native-paper';

import { FlatGrid } from 'react-native-super-grid';

import Icon from './Icon.js';
import Unit from './Unit.js';
import Util from './Util.js';
import Hero from './Hero.js';

import ResourceRow from './ResourceRow.js';


import mainStore from './MainContext.js';
import { observer} from "mobx-react"
import { observable, computed, action } from 'mobx';

import i18n from 'i18n-js';

export const Progress = (props)=>{
     const width = props.width
     const style = props.style
     style.width = width;
     return <Animated.View
         style={[StyleSheet.absoluteFill], style}
      >
      </Animated.View>
}


export const RoadScreen = (observer((props) => {

    const city= mainStore.selectedCity;


    const action = (key,onAction)=>{
        return <>
             <Menu.Item onPress={() =>remove(key,onAction)} title="Remove"/>
        </>
    }

    const getTypeString = (type)=>{

    }

      return (
        <ScrollView style={{padding:10}}>
             <Caption>{i18n.t("ui.manage.road.roads")} </Caption>
             {city.destinies.map((destiny,index)=>{
                    const road = destiny.road;
                     return <Surface style={{marginBottom:5,elevation:1}} key={index}>
                        <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                            <View style={{flexDirection:'row',display:'flex',justifyContent:'center',padding:10}}>
                                   <View>
                                    <View style={{flexDirection:'row'}}>
                                        <Paragraph style={{position:'relative',top:-2,marginRight:2}}>{destiny.city.name}</Paragraph>
                                        <Caption >{(destiny.length/1000).toFixed(1)}km</Caption>
                                    </View>
                                    <View style={{flexDirection:'row'}}>
                                        <Caption>{i18n.t("ui.manage.road.type."+road.type+".name")} </Caption>
                                    </View>
                                    <View style={{maxWidth:300}}>
                                        {road.type=='mountain'?<Caption>{i18n.t("ui.manage.road.type.mountain.description")} </Caption>:null}
                                        {road.type=='desert'?<>
                                            <Caption>{i18n.t("ui.manage.road.type.desert.description")} </Caption>
                                        </>:null}
                                    </View>

                                </View>
                            </View>

                        </View>
                    </Surface>

             })}

            <View style={{height:20}}/>
        </ScrollView>
      );
}))


export const TradeScreen = (observer((props) => {

    const city= mainStore.selectedCity;

    const remove = (key,onAction)=>{
        city.removeTrade(key)
        onAction();
    }

    const action = (key,onAction)=>{
        return <>
             <Menu.Item onPress={() =>remove(key,onAction)} title={i18n.t("ui.action.remove")}/>
        </>
    }

      return (
        <View style={{padding:10}}>
            <View style={{flexDirection:'row'}}>
                 <Caption>{i18n.t("ui.manage.resource.selling")} </Caption>
                 <Caption>{city.buildings.trade?
                        <>{city.trade.length}/(1+{Math.min(city.buildings.trade.completedQuantity,city.buildings.trade.units.length)})*5</>
                     :city.trade.length+'/5'}
                 </Caption>
            </View>
        <FlatGrid
           itemDimension={mainStore.unitSize}
           data={city.trade.slice()}

           spacing={1}
           renderItem={({ item }) => {
                const key = item;
                const resource = mainStore.data.resources[key];

               return   <Unit data={resource} action={(onAction)=>action(item,onAction)}

               />
           }}
         />


        </View>
      );
}))

export const UnitIcon = (props =>{

    const data = props.data

   if(data.type=='group'){
       const units = data.units;
       if(units){
           if(units.length>0){
               const ret = []
               for(var i = 0;i<Math.min(units.length,4);i++){
                   const unit = units[i];
                   ret.push(<Icon icon={unit.icon}  color={unit.color} style={{alignItems: 'center',justifyContent: 'center',marginTop:2,minWidth:18,width:18,height:16}} contentStyle={{marginLeft:14}}/>)
               }
               return <View style={{flexDirection:'row'}}>
                   {ret}
               </View>
           }
       }
   }
   return   <Icon icon={data.icon}  color={data.color}/>


})

export const InfoContent =  (observer((props) => {

    const city= mainStore.selectedCity;

    const change = ()=>{
        props.navigation.navigate('HeroList', {city:city});
    }

    const changeChancellor = ()=>{
        props.navigation.navigate('SelectChancellor', {city:city});
    }

   const setCapital = ()=>{
        const factionData =city.factionData
        factionData.capital = city
        city.setFactionData({})
        city.setFactionData(factionData)
   }

   return (
     <ScrollView style={{padding:10}}>
        {city?.factionData?.capital?.id == city.id?
            <View style={{flexDirection:'row'}}>
                <Icon icon="star"  />
            <Paragraph style={{position:'relative',top:-2}}>{i18n.t("ui.manage.info.capital")} </Paragraph>
            </View>
        :null}


        <View style={{flexDirection:'row'}}>
             <Icon icon="bank"  />
            <Paragraph  style={{position:'relative',top:-2}}>{i18n.t("ui.manage.info.governor")} </Paragraph>
            <Caption>{city.governor==undefined?i18n.t("ui.common.none"):city.governor.name}</Caption>
            {props.type!='info'?<Button icon="playlist-edit" onPress={()=>change()} />:null}
        </View>
        {city.buildings.palace?.completedQuantity>0?
        <View style={{flexDirection:'row'}}>
             <Icon icon="bank"  />
            <Paragraph  style={{position:'relative',top:-2}}>{i18n.t("ui.manage.info.chancellor")} </Paragraph>
            <Caption>{city.chancellor==undefined?i18n.t("ui.common.none"):city.chancellor.name}</Caption>
            {props.type!='info'?<Button icon="playlist-edit" onPress={()=>changeChancellor()} />:null}
        </View>
        :null}


        {city.civilization?
            <View style={{flexDirection:'row'}}>
                <Icon icon="pillar"  />
                <Paragraph>{i18n.t("ui.manage.info.civilization")} </Paragraph>
                <Caption >{city.civilization.name} </Caption>
            </View>
        :null}

        <View style={{flexDirection:'row'}}>
            <Icon icon="account-multiple"  />
            <Paragraph style={{position:'relative',top:-2}}>{i18n.t("ui.manage.info.population")} </Paragraph>
            <Caption>{Util.number(city?.population)}</Caption>
        </View>
        {props.type!='info'? <>
            <View style={{flexDirection:'row'}}>
                <Icon icon="barley"  />
                <Paragraph style={{position:'relative',top:-2}}>{i18n.t("ui.manage.info.food consumption")} </Paragraph>
                <Caption> {Util.number(city?.getFoodConsumption())}/{i18n.t("ui.manage.info.day")} {Util.number(city?.getFoodConsumption()*365)}/{i18n.t("ui.manage.info.year")}</Caption>
            </View>
            <View style={{flexDirection:'row'}}>
                <Caption style={{marginLeft:22}}>{i18n.t("ui.manage.info.consumption rate")} </Caption>

            </View>
            <View style={{flexDirection:'row'}}>
                <Button style={{position:'relative',top:-7}} labelStyle={{fontSize:20,margin:0,position:'relative',top:-3}} onPress={()=>city.addFoodConsumptionRate(-0.5)}>-</Button>
                <Paragraph>x{city.foodConsumptionRate}</Paragraph>
                <Button style={{position:'relative',top:-7}} labelStyle={{fontSize:20,margin:0,position:'relative',top:-3}} onPress={()=>city.addFoodConsumptionRate(0.5)}>+</Button>
                <Caption style={{marginLeft:15}}>{city.getHappinessGrowthText()} {i18n.t("ui.manage.info.happiness")}/{i18n.t("ui.manage.info.month")}</Caption>
            </View>

            <View style={{flexDirection:'row'}}>
                <Icon icon="heart"  />
                <Paragraph style={{position:'relative',top:-2}}>{i18n.t("resource.happiness.name")} </Paragraph>
                <Caption>{city.happiness.toFixed(2)}/{city.maxHappiness}</Caption>
            </View>
            <View style={{flexDirection:'row'}}>
                <Icon icon="hospital-box"  />
                <Paragraph style={{position:'relative',top:-2}}>{i18n.t("ui.manage.info.hygiene")} </Paragraph>
                <Caption>{city.getHygiene()}/65</Caption>
            </View>

            <View style={{flexDirection:'row'}}>
                <Icon icon="account-multiple-plus"  />
                <Paragraph style={{position:'relative',top:-2}}>{i18n.t("ui.manage.info.population growth rate")} </Paragraph>
                <Caption>{city.getGrowthRate()}%/{i18n.t("ui.manage.info.year")}</Caption>
            </View>
        </>:null}
        <Divider/>
        <View style={{flexDirection:'row'}}>
            <Icon icon="knife-military"  />
            <Paragraph style={{position:'relative',top:-2}}>{i18n.t("ui.manage.info.military units")} </Paragraph>
            <Caption>{Math.floor(city.getMilitaryUnits())} </Caption>
            <Paragraph style={{position:'relative',top:-2}}>{i18n.t("ui.manage.info.armed")} </Paragraph>
            <Caption>{Math.floor(city.getMilitaryUnits('armed'))} </Caption>
            <Paragraph style={{position:'relative',top:-2}}>{i18n.t("ui.manage.info.unarmed")} </Paragraph>
            <Caption>{Math.floor(city.getMilitaryUnits('unarmed'))} </Caption>

        </View>

        <View style={{flexDirection:'row'}}>
            <Icon icon="chess-rook"  />
            <Paragraph style={{position:'relative',top:-2}}>{i18n.t("ui.manage.info.city defense")} </Paragraph>
            <Caption> {Math.floor(city.getDefense())}/{city.getDefenseMax()}</Caption>
        </View>
        {city.snapshotSub?.resource?
        <>
            <Divider/>
            <Paragraph>{i18n.t("ui.manage.info.natural resources")} </Paragraph>
            {
                Object.keys(city.snapshotSub.resource).map(key=>{
                    const resource = city.snapshotSub.resource[key]
                    return <ResourceRow key={key} resource={key}   lv={resource}/>
                })
            }
        </>:null}
        {city?.factionData?.capital?.id == city.id || props.type=='info'?null
        :<Button onPress={()=>setCapital()}>{i18n.t("ui.manage.info.set as capital")}</Button>
        }
        <View style={{height:20}}/>
     </ScrollView>
   );
}))

export const UnitScreen  = (observer((props) => {


    const unit = props.unit;
    const city= props.type=='group'?unit.city:mainStore.selectedCity;
    const units = props.type=='group'?unit.units.slice():city.units.slice();
    let heroes = props.type=='group'?unit.heroes:city.heroes;
    const editable = props.editable

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
        mainStore.selectedUnit = unit

        props.navigation.navigate('Equip',{editable:editable});

        onAction();
    }

    const move = (unit,onAction)=>{
        mainStore.move(unit);
        props.navigation.navigate('Home', {unit:unit});
        mainStore.scene.current.rendered = false
        onAction();
    }

    const group = (unit,onAction)=>{
        mainStore.selectedUnit = unit

          props.navigation.navigate('Group',{unit:unit});

          onAction();
    }

    const leave = (u,onAction)=>{
        unit.removeUnit(u);
        u.inGroup= false
        city.addUnit(u);
        unit.checkCapacity()
        onAction();
    }

    const action = (unit,onAction)=>{

        return <>
            {unit.state=='deploy'?
            null
            :<>
                {unit.data.action.manage?<Menu.Item onPress={() => group(unit,onAction)} title={i18n.t("ui.action.manage")}/>:null}
               {unit.data.action.build&&props.type!='group'?<Menu.Item onPress={()=>build(unit,onAction)} title={i18n.t("ui.action.build")}/>:null}
                {unit.data.action.assign&&props.type!='group'?<Menu.Item onPress={() => assign(unit,onAction)} title={i18n.t("ui.action.assign")}/>:null}
                {unit.data.action.equip?<Menu.Item onPress={() => equip(unit,onAction)} title={i18n.t("ui.action.inventory")}/>:null}
                {unit.data.action.deploy&&props.type!='group'?
                    unit.type!='group'||unit.units.length>0?
                        city.happiness<=0&&unit.hasArmy()?
                        null
                        :<Menu.Item onPress={() => move(unit,onAction)} title={i18n.t("ui.action.move")}/>
                    :null
                 :null
                }
                {props.type=='group'&&props.unit.state==''?<Menu.Item onPress={() => leave(unit,onAction)} title={i18n.t("ui.action.leave group")}/>:null}

                {props.type!='group'?<Menu.Item onPress={() =>disband(unit,onAction)} title={i18n.t("ui.action.disband")}/>:null}
            </>
            }
        </>
    }

    const heroInfo = (hero)=>{

    }

  return (
    <ScrollView style={{paddingTop:10}}>
        <SafeAreaView style={{padding:10}}>
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
                        <Paragraph>{i18n.t("ui.manage.unit.available manpower")} {Util.number(Math.floor(city?.manpower))} / {Util.number(city?.getMaxManpower())}</Paragraph>
                    </View>
                     <View style={{flexDirection:'row'}}>
                        <Button  style={{marginRight:2}} onPress={()=>props.navigation.navigate('Employ', {city:city})} icon="account-plus" mode="contained"  labelStyle={{color:'white'}} contentStyle={{marginLeft:16}} />
                    </View>
                </>
            }
            </View>
                <View style={{padding:5}}>
                    {props.type=='group'?<>
                        <Caption>{i18n.t("ui.manage.unit.units")} {unit.units.length}/10</Caption>
                    </>:<Caption>{i18n.t("ui.manage.unit.idle units")}</Caption>
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
                        <Caption>{i18n.t("ui.manage.unit.idle heroes")}</Caption>
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

        </SafeAreaView>
    </ScrollView>
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

        let condition = city.factionData.id==mainStore.selectedFaction.id && unit.currentRoad == undefined;

        if(this.props.target != undefined){
            city = this.props.target;
            condition = true;
        }

        const arr = Object.keys(city.resources).filter(key=> key!='undefined')

        return <>
            {deploy==true?<>
                 <View style={{flexDirection:'row',display:'flex',justifyContent:'space-between'}}>
                   <Caption>{i18n.t("ui.common.resources")}</Caption>
                   {condition?<View style={{flexDirection:'row'}}>
                       <Caption style={{    position: 'relative',top: 5}}> {i18n.t("ui.common.transfer")}</Caption>
                       <Button onPress={()=>this.changeAmount()}>{this.state.amount}</Button>
                       <Caption style={{    position: 'relative',top: 5}}>{i18n.t("ui.common.unit")}{this.state.amount>1?i18n.t("ui.common.s"):null} {i18n.t("ui.common.per click")}</Caption>
                   </View>:null}
               </View>
                 <View style={{flexDirection:'row',display:'flex',justifyContent:'space-between'}}>
                   <Caption></Caption>
                   <View style={{flexDirection:'row'}}>
                       <Caption > {i18n.t("ui.common.can survive")} {unit.survivableDays} {i18n.t("ui.common.days")} </Caption>
                   </View>
               </View>

               <FlatGrid
                  itemDimension={mainStore.unitSize}
                  data={Object.keys(unit.resources)}
                    scrollEnabled={false}
                  spacing={1}
                  renderItem={({ item }) => {
                       const key = item;
                       const quantity = unit.resources[key];
                       const resource = mainStore.data.resources[key];

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
                   <Caption>{i18n.t("ui.common.city")} {i18n.t("ui.common.resources")}</Caption>
                   :<Caption>{i18n.t("ui.common.target")} {i18n.t("ui.common.resources")}</Caption>
                   }
                   <FlatGrid
                      itemDimension={mainStore.unitSize}
                      data={arr}

                      spacing={1}
                      renderItem={({ item }) => {
                           const key = item;
                           const quantity = city.resources[key];
                           const resource = mainStore.data.resources[key];

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
               {unit.state!=''?
                <>
               <Icon icon="heart"  />
               <Caption>{unit.moral.toFixed(2)}/100</Caption>

               <Paragraph> {i18n.t("ui.deployed.origin")} </Paragraph>
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


export const NearByUnit = (props) =>{

    const unit = props.unit;

    let currentPosition = unit.currentLocation?.name;
    if(unit.currentRoad!=undefined){
        const destinies = unit.currentRoad.road.destinies
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
                    <Paragraph>{i18n.t("ui.deployed.location")} </Paragraph>
                   <Caption >{currentPosition}</Caption>
               </View>
                <View style={{flexDirection:'row'}}>
                    <Paragraph>{i18n.t("ui.deployed.origin")} </Paragraph>
                   <Caption >{unit.city.name}</Caption>
               </View>
           </View>
       </Surface>
}
