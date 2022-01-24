import React, { useContext } from 'react';

import {  View,StyleSheet ,ScrollView,Text,TouchableOpacity,Dimensions   } from 'react-native';
import { Button ,Dialog,Modal,Portal ,Paragraph,List,IconButton,Caption,Subheading,Title,Divider ,Surface,Menu,Avatar  } from 'react-native-paper';


import { observer} from "mobx-react"
import i18n from 'i18n-js';

export  const  HeroInfo =  (observer((props) => {


    const { hero } = props.route.params;


    return <ScrollView contentContainerStyle={{ padding: 10}} >

        <View style={{backgroundColor: '#ff1f13',width:hero.valor+'%',height:6}}/>
         <View style={{flexDirection:'row',marginTop:5}}>

            <Title >{hero.valor} </Title>
            <Caption style={{paddingTop:2}}>{i18n.t("ui.hero.info.valor")} </Caption>
        </View>


        <Paragraph >+{(hero.valor/2).toFixed(1)}% {i18n.t("ui.hero.info.military unit extra damage when assigned to a group")}</Paragraph>
        <Paragraph >-{(hero.valor/2).toFixed(1)}% {i18n.t("ui.hero.info.happiness cost of employing military unit when assigned as a governor")}</Paragraph>

        <View style={{height:30}}/>
        <Divider/>
        <View style={{height:30}}/>
        <View style={{backgroundColor: '#2780E3',width:hero.wisdom+'%',height:6}}/>

         <View style={{flexDirection:'row',marginTop:5}}>

              <Title >{hero.wisdom} </Title>
              <Caption  style={{paddingTop:2}}>{i18n.t("ui.hero.info.wisdom")} </Caption>
         </View>

         <Paragraph >-{(hero.wisdom/5).toFixed(1)}% {i18n.t("ui.hero.info.traveling unit food consumption when assigned to a group")}</Paragraph>
         <Paragraph >-{(hero.wisdom/10).toFixed(1)}% {i18n.t("ui.hero.info.trading commission when assigned to a group")}</Paragraph>
         <Paragraph >+{(hero.wisdom/5).toFixed(1)}% {i18n.t("ui.hero.info.building speed when assigned to a building project")}</Paragraph>
         <Paragraph >-{(hero.wisdom/2).toFixed(1)}% {i18n.t("ui.hero.info.happiness cost of employing non-military unit when assigned as a governor")}</Paragraph>
         <Paragraph >+{(hero.wisdom/2).toFixed(1)}% {i18n.t("ui.hero.info.production result when assigned to a production building")}</Paragraph>

        <View style={{height:30}}/>
        <Divider/>
        <View style={{height:30}}/>
         <View style={{backgroundColor: '#FF7518',width:hero.authority+'%',height:6}}/>
           <View style={{flexDirection:'row',marginTop:5}}>

               <Title >{hero.authority} </Title>
               <Caption  style={{paddingTop:2}}>{i18n.t("ui.hero.info.authority")} </Caption>
           </View>

          <Paragraph >+{(hero.authority/10).toFixed(1)} {i18n.t("ui.hero.info.moral when assigned to a group")}</Paragraph>
          <Paragraph >+{Math.floor(hero.authority/4)} {i18n.t("ui.hero.info.max happiness when assigned as a governor")}</Paragraph>

     </ScrollView>

}))