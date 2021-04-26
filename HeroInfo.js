import React, { useContext } from 'react';

import {  View,StyleSheet ,ScrollView,Text,TouchableOpacity,Dimensions   } from 'react-native';
import { Button ,Dialog,Modal,Portal ,Paragraph,List,IconButton,Caption,Subheading,Title,Divider ,Surface,Menu,Avatar  } from 'react-native-paper';


import { observer} from "mobx-react"
import i18n from 'i18n-js';

export  const  HeroInfo =  (observer((props) => {


    const { hero } = props.route.params;


    return <ScrollView contentContainerStyle={{ padding: 10}} >
         <View style={{flexDirection:'row',margin:5}}>
            <View style={{marginRight:5,width:90}}>
                <View style={{margin:5,height:76,alignItems:'center'}}>
                    <Avatar.Text style={{backgroundColor:'#ff1f13',margin:2}} size={36} label={hero.valor} />
                    <Subheading >{i18n.t("ui.hero.info.valor")}</Subheading>
                </View>

            </View>
            <View style={{width:255}}>
                <Paragraph >+{(hero.valor/2).toFixed(1)}% {i18n.t("ui.hero.info.military unit extra damage when assigned to a group")}</Paragraph>
                <Paragraph >-{(hero.valor/2).toFixed(1)}% {i18n.t("ui.hero.info.happiness cost of employing military unit when assigned as a governor")}</Paragraph>

            </View>
         </View>
          <View style={{flexDirection:'row',margin:5}}>
             <View style={{marginRight:5,width:90}}>

                 <View style={{margin:5,height:76,alignItems:'center'}}>
                     <Avatar.Text style={{backgroundColor:'#2780E3',margin:2}} size={36} label={hero.wisdom} />
                     <Subheading >{i18n.t("ui.hero.info.wisdom")}</Subheading>
                 </View>

             </View>
             <View style={{width:255}}>
                 <Paragraph >-{(hero.wisdom/5).toFixed(1)}% {i18n.t("ui.hero.info.traveling unit food consumption when assigned to a group")}</Paragraph>
                 <Paragraph >-{(hero.wisdom/10).toFixed(1)}% {i18n.t("ui.hero.info.trading commission when assigned to a group")}</Paragraph>
                 <Paragraph >-{(hero.wisdom/2).toFixed(1)}% {i18n.t("ui.hero.info.happiness cost of employing non-military unit when assigned as a governor")}</Paragraph>
                 <Paragraph >+{(hero.wisdom/2).toFixed(1)}% {i18n.t("ui.hero.info.production result when assigned to a production building")}</Paragraph>
             </View>
          </View>
           <View style={{flexDirection:'row',margin:5}}>
              <View style={{marginRight:5,width:90}}>

                  <View style={{margin:5,alignItems:'center'}}>
                      <Avatar.Text style={{backgroundColor:'#FF7518',margin:2}} color="white" size={36} label={hero.authority} />
                      <Subheading >{i18n.t("ui.hero.info.authority")}</Subheading>
                  </View>
              </View>
              <View style={{width:255}}>
                  <Paragraph >+{(hero.authority/10).toFixed(1)} {i18n.t("ui.hero.info.moral when assigned to a group")}</Paragraph>
                  <Paragraph >+{Math.floor(hero.authority/4)} {i18n.t("ui.hero.info.max happiness when assigned as a governor")}</Paragraph>
                  <Paragraph >+{(hero.authority/400).toFixed(2)} {i18n.t("ui.hero.info.happiness/month when assigned as a governor")}</Paragraph>
              </View>
           </View>
     </ScrollView>

}))