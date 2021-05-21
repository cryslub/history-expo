import React, { useContext } from 'react';

import {  View,StyleSheet ,ScrollView,Text,TouchableOpacity,Dimensions   } from 'react-native';
import { Button ,Dialog,Modal,Portal ,Paragraph,List,IconButton,Caption,Subheading,Title,Divider ,Surface,Menu,Avatar,RadioButton,Badge  } from 'react-native-paper';

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import { Ionicons } from '@expo/vector-icons';

import { TabView, SceneMap } from 'react-native-tab-view';
import { FlatGrid } from 'react-native-super-grid';

import { observer} from "mobx-react"

import Util from './Util.js';
import Icon from './Icon.js';


import Unit from './Unit.js';


import {MainContext} from './MainContext.js'
import {CityContext} from './CityContext.js'
import cityStore from './CityContext.js';
import mainStore from './MainContext.js';

import i18n from 'i18n-js';

export  const  HeroList =  (props) => {

    const { city } = props.route.params;

    console.log(city.heroes.indexOf(city.governor))

    let governorIndex = 1;
    if(city.governor!=undefined){
        city.heroes.forEach((hero,index)=>{
            if(city.governor.id == hero.id)   governorIndex = index+2;
        })
    }

    const [value, setValue] = React.useState(governorIndex);


    const changeGovernor = (id)=>{
        if(id>1){
            city.setGovernor(city.heroes[id-2])
        }else{
            city.setGovernor(undefined)
        }

    }

    return <ScrollView contentContainerStyle={{ padding: 10 }} >
        <RadioButton.Group onValueChange={value => {setValue(value);changeGovernor(value)}} value={value}>
            <RadioButton.Item  label={
            <>
                <Paragraph style={{marginRight:10}}>{i18n.t("ui.common.none")} </Paragraph>
            </>
            } value={1} />
            {city.heroes.map((hero,index)=>{
                return  <RadioButton.Item  label={
                <><Paragraph style={{marginRight:10}}>{hero.name} </Paragraph>
                    <Badge style={{marginRight:2,backgroundColor:'#ff1f13',fontSize:12}}> {hero.valor} </Badge>
                   <Badge style={{marginRight:2,backgroundColor:'#2780E3',fontSize:12}}> {hero.wisdom} </Badge>
                   <Badge style={{marginRight:2,backgroundColor:'#FF7518',fontSize:12,color:'white'}}> {hero.authority} </Badge>
                </>
                } value={index+2} />
            })}

        </RadioButton.Group>
        <Divider/>
        <View style={{padding:10}}>
            {city.heroes[value-2]==undefined?null
            :<>
                <Paragraph>{i18n.t("ui.hero.governor")} {i18n.t("ui.hero.effect")}</Paragraph>

                <Caption >-{(city.heroes[value-2]?.valor/2).toFixed(1)}% {i18n.t("ui.hero.happiness cost of employing military unit")} </Caption>
                <Caption >-{(city.heroes[value-2]?.wisdom/2).toFixed(1)}% {i18n.t("ui.hero.happiness cost of employing non-military unit")} </Caption>
                 <Caption >+{Math.floor(city.heroes[value-2]?.authority/4)} {i18n.t("ui.hero.max happiness")}</Caption>
                <Caption >+{(city.heroes[value-2]?.authority/200).toFixed(2)} {i18n.t("ui.hero.happiness")}/{i18n.t("ui.hero.month")}</Caption>
            </>
            }

        </View>
     </ScrollView>

}