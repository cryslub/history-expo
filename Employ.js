import React, { useContext } from 'react';
import {  View,StyleSheet ,ScrollView,Text,TouchableOpacity,SafeAreaView   } from 'react-native';
import { Button ,Dialog,Modal,Portal ,Paragraph,List,IconButton,Caption,Subheading,Title,Divider ,Surface,Menu,TextInput } from 'react-native-paper';
import { FlatGrid } from 'react-native-super-grid';

import Popover from 'react-native-popover-view';

import Util from './Util.js';
import Icon from './Icon.js';
import ResourceIcon from './ResourceIcon.js';

import Unit from './Unit.js';
import UnitData from './UnitData.js';


import { observer,inject } from "mobx-react"

import mainStore from './MainContext.js';
import actionStore from './ActionContext.js';

import i18n from 'i18n-js';


export const Employ = ((props) => {

    const [visible, setVisible] = React.useState(false);
    const [amount, setAmount] = React.useState(1);


    const city = mainStore.selectedCity;

	const minus = () =>{
        this.setState({amount:--this.state.amount})
	}
	const plus = () =>{
        this.setState({amount:++this.state.amount})

	}

    const add = (unit,amount)=>{

        city.employ(unit);

        props.navigation.goBack();
    }

    const action   = (unit,disabled) =>{
        return <>
            <View style={{width:240,padding:15}}>
                <Caption>{unit.description}</Caption>
                {unit.manpower?<Paragraph>{i18n.t("ui.employ.required manpower")} : {unit.manpower}</Paragraph>:null}
                {unit.cost?
                <>
                    {Array.isArray(unit.cost)?<View style={{flexDirection:'row'}}>
                        <Paragraph style={{whiteSpace:'nowrap'}}>{i18n.t("ui.employ.cost")} : </Paragraph>
                        {
                            unit.cost.map(cost=>{
                                return <>
                                    <Paragraph> {mainStore.data.resources[cost.type].name}  </Paragraph>
                                    <ResourceIcon icon={mainStore.data.resources[cost.type].icon} />
                                    <Paragraph> {cost.quantity} </Paragraph>
                                </>
                            })
                        }
                        </View>:
                        <View style={{flexDirection:'row'}}>
                            <Paragraph>{i18n.t("ui.employ.cost")} :  {mainStore.data.resources[unit.cost.type].name}  </Paragraph>
                            <ResourceIcon icon={mainStore.data.resources[unit.cost.type].icon} />
                            <Paragraph> {city.getHiringCost(unit,unit.cost.quantity).toFixed(2)} </Paragraph>
                        </View>
                    }
                </>:null
                }
                {unit.wage?<View style={{flexDirection:'row'}}>
                    <Paragraph>{i18n.t("ui.employ.daily wage : food")}  </Paragraph>
                    <ResourceIcon icon="barley" />
                    <Paragraph>{unit.wage} / {i18n.t("ui.common.day")}</Paragraph>
                </View>:null
                }
            </View>

            {disabled?null:<Button  onPress={()=>add(unit,1)}>{i18n.t("ui.button.add")}</Button>}
             {unit.delay?<View style={{width:'100%'}}>
                <Caption style={{textAlign:'center'}}>{i18n.t("ui.employ.takes")} {unit.delay} {i18n.t("ui.employ.days")}</Caption>
            </View>:null}
        </>
    }

    let arr = Object.keys(mainStore.data.units).filter(key=>{
		    const unit = mainStore.data.units[key];

            if(unit.category=='army' && city.happiness<=0){
                return false;
            }
            if(unit.special == true) return false;

            return true;

		});

    if(city.civilization){
        if(city.civilization.add?.unit){
            arr = arr.concat(city.civilization.add?.unit)

        }
    }

    return <SafeAreaView  contentContainerStyle={{ padding: 10 }}>
         <View style={{flexDirection:'row'}}>
            <Icon icon="account" />
            <Paragraph>{i18n.t("ui.employ.available manpower")}  {Util.number(Math.floor(city?.manpower))}</Paragraph>
        </View>
         <FlatGrid
                   itemDimension={mainStore.unitSize}
                   data={arr}

                   spacing={1}
                   renderItem={({ item }) => {

                        const unit = mainStore.data.units[item];
                        let disabled = city.manpower<unit.manpower
                        if(Array.isArray(unit.cost)){
                            unit.cost.forEach(cost=>{
                                if(city.resources[cost.type]==undefined || city.resources[cost.type]<cost.quantity){
                                    disabled = true
                                }
                            })
                        }
                        return <Unit data={unit}  action={()=>action(unit,disabled)} disabled={disabled}/>
                   }}
         />

     </SafeAreaView>

	
})