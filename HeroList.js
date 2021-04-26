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
         height: mainStore.unitSize,
         width: mainStore.unitSize,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 1,

     }

});


export  const  HeroList =  (props) => {

    const { city } = props.route.params;

    console.log(city.heroes.indexOf(city.governor))

    let governorIndex = 0;
    city.heroes.forEach((hero,index)=>{
        if(city.governor.id == hero.id)   governorIndex = index+1;
    })

    const [value, setValue] = React.useState(governorIndex);


    const changeGovernor = (id)=>{

        city.setGovernor(city.heroes[id-1])

    }

    return <ScrollView contentContainerStyle={{ padding: 10 }} >
        <RadioButton.Group onValueChange={value => {setValue(value);changeGovernor(value)}} value={value}>
            {city.heroes.map((hero,index)=>{
                return  <RadioButton.Item  label={
                <><Paragraph style={{marginRight:10}}>{hero.name} </Paragraph>
                    <Badge style={{marginRight:2,backgroundColor:'#ff1f13',fontSize:12}}> {hero.valor} </Badge>
                   <Badge style={{marginRight:2,backgroundColor:'#2780E3',fontSize:12}}> {hero.wisdom} </Badge>
                   <Badge style={{marginRight:2,backgroundColor:'#FF7518',fontSize:12,color:'white'}}> {hero.authority} </Badge>
                </>
                } value={index+1} />
            })}

        </RadioButton.Group>
        <Divider/>
        <View style={{padding:10}}>
            {city.heroes[value-1]==undefined?null
            :<>
                <Paragraph>{i18n.t("ui.hero.governor")} {i18n.t("ui.hero.effect")}</Paragraph>

                <Caption >-{(city.heroes[value-1]?.valor/2).toFixed(1)}% {i18n.t("ui.hero.happiness cost of employing military unit")} </Caption>
                <Caption >-{(city.heroes[value-1]?.wisdom/2).toFixed(1)}% {i18n.t("ui.hero.happiness cost of employing non-military unit")} </Caption>
                 <Caption >+{Math.floor(city.heroes[value-1]?.authority/4)} {i18n.t("ui.hero.max happiness")}</Caption>
                <Caption >+{(city.heroes[value-1]?.authority/200).toFixed(2)} {i18n.t("ui.hero.happiness")}/{i18n.t("ui.hero.month")}</Caption>
            </>
            }

        </View>
     </ScrollView>

}