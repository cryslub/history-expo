import React, { useContext } from 'react';
import {  View,StyleSheet ,ScrollView,Text,TouchableOpacity  } from 'react-native';
import { Button ,Dialog,Modal,Portal ,Paragraph,List,IconButton,Caption,Subheading,Title,Divider ,Surface,Menu,TextInput } from 'react-native-paper';
import { FlatGrid } from 'react-native-super-grid';

import Popover from 'react-native-popover-view';

import Util from './Util.js';
import Icon from './Icon.js';
import ResourceRow from './ResourceRow.js';



import Unit from './Unit.js';
import UnitData from './UnitData.js';


import { observer,inject } from "mobx-react"

import mainStore from './MainContext.js';

import i18n from 'i18n-js';


export const Trade = ((props) => {

     const { city ,unit} = props.route.params;

    const [amount, setAmount] = React.useState(1);

    const minus = (a) =>{
        const b = Math.max(0,amount-a)
        setAmount(b)
	}
	const plus = (a,key) =>{
	    const c = unit.capacity-unit.carrying;
        const b = Math.min(city.resources[key],amount+a)
        setAmount(b)

	}


    const checkTrade = (source,target)=>{
        const sourceResource = mainStore.data.resources[source];
        const targetResource = mainStore.data.resources[target];
        const sourcePrice = sourceResource.price;
        const targetPrice = targetResource.price;

        let bonus = 0;
        if(unit.hero){
            bonus = unit.hero.wisdom/100
        }

        const totalPrice = (sourcePrice*amount*(11-bonus))/10
        let targetAmount = Util.intDivide(totalPrice,targetPrice);
        if(unit.resources[target]<targetAmount){
            if(amount) return {message:i18n.t("ui.trade.not enough resource to trade")};
        }
        if(unit.capacity < unit.carrying - targetAmount+amount){
            return {message:i18n.t("ui.trade.not enough capacity to hold")};
        }

        return {message:i18n.t("ui.trade.succeed"),targetAmount : targetAmount};
    }

    const trade =(source,target,onAction)=>{

        const result = checkTrade(source,target);

        if(result.message==i18n.t("ui.trade.succeed")){
            const totalAmount = result.targetAmount
            unit.consumeResource(target,totalAmount);
            city.consumeResource(source,amount);

            unit.addResource(source,amount);
            city.addResource(target,totalAmount);
        }

        onAction();
    }

    const action = (key,onAction)=>{


         if(unit.resources.length ==0 || unit.carrying==0){

            return <Paragraph>{i18n.t("ui.trade.you are not holding any resources to trade with")} </Paragraph>
        }

        const resource = mainStore.data.resources[key];

        return <>
            <Paragraph>{i18n.t("ui.trade.trade amount")}</Paragraph>
            <View style={{flexDirection:'row',alignItems: 'center',justifyContent: 'center',padding:15}}>
                <Button  style={{minWidth:0}} onPress={()=>minus(10,key)}>10</Button>
                <Button  style={{minWidth:0}} onPress={()=>minus(5,key)}>5</Button>
                 <Button  style={{minWidth:0}} icon="minus" contentStyle={{marginLeft:12}} onPress={()=>minus(1,key)}/>{amount}
                 <Button  style={{minWidth:0}} icon="plus" contentStyle={{marginLeft:12}} onPress={()=>plus(1,key)}/>
                <Button  style={{minWidth:0}} onPress={()=>plus(5,key)}>5</Button>
                <Button  style={{minWidth:0}} onPress={()=>plus(10,key)}>10</Button>
             </View>
            <Paragraph>{i18n.t("ui.trade.with")}</Paragraph>
            {
                Object.keys(unit.resources).map(k=>{

                    const result = checkTrade(key,k);
                    return <View style={{flexDirection:'row'}}>
                        <ResourceRow prefix={Util.intDivide(resource.price*amount*(11/10),mainStore.data.resources[k].price)} resource={k}/>
                        {result.message==i18n.t("ui.trade.succeed")?<Button onPress={()=>trade(key,k,onAction)}>{i18n.t("ui.trade.trade")}</Button>
                        :<Caption>{result.message}</Caption>}
                    </View>
                })
            }
        </>
    }

      return (
        <ScrollView style={{padding:10}}>
        <Caption>{i18n.t("ui.trade.trade")} {city.buildings.trade?<>{city.trade.length}/{Math.min(city.buildings.trade.completedQuantity,city.buildings.trade.units.length)}</>:'0/0'}</Caption>
        <Caption>{i18n.t("ui.trade.the city will get")} 10% {i18n.t("ui.trade.commission")}</Caption>
        <FlatGrid
           itemDimension={mainStore.unitSize}
           data={city.trade}

           spacing={1}
           renderItem={({ item }) => {
                const key = item;
                const resource = mainStore.data.resources[key];
                const quantity = city.resources[key]
               return   <Unit data={resource} action={(onAction)=>action(item,onAction)}
                    quantity = { ()=>(<Caption>{Util.number(quantity)}</Caption>)}
               />
           }}
         />


        </ScrollView>
      );

	
})