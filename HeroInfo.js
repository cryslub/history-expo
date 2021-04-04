import React, { useContext } from 'react';

import {  View,StyleSheet ,ScrollView,Text,TouchableOpacity,Dimensions   } from 'react-native';
import { Button ,Dialog,Modal,Portal ,Paragraph,List,IconButton,Caption,Subheading,Title,Divider ,Surface,Menu,Avatar  } from 'react-native-paper';


import { observer} from "mobx-react"


export  const  HeroInfo =  (observer((props) => {


    const { hero } = props.route.params;


    return <View contentContainerStyle={{ padding: 10,height:'100%' }} style={{height:'100%'}}>
         <View style={{flexDirection:'row',margin:5}}>
            <View style={{marginRight:5,width:73}}>
                <View style={{margin:5,height:76,alignItems:'center'}}>
                    <Avatar.Text style={{backgroundColor:'#ff1f13',margin:2}} size={36} label={hero.valor} />
                    <Subheading >Valor</Subheading>
                </View>

            </View>
            <View style={{width:270}}>
                <Paragraph >+{(hero.valor/2).toFixed(1)}% military unit extra damage when assigned to a group</Paragraph>
                <Paragraph >-{(hero.valor/2).toFixed(1)}% happiness cost of employing military unit when assigned as a governor</Paragraph>

            </View>
         </View>
          <View style={{flexDirection:'row',margin:5}}>
             <View style={{marginRight:5,width:73}}>

                 <View style={{margin:5,height:76,alignItems:'center'}}>
                     <Avatar.Text style={{backgroundColor:'#2780E3',margin:2}} size={36} label={hero.wisdom} />
                     <Subheading >Wisdom</Subheading>
                 </View>

             </View>
             <View style={{width:270}}>
                 <Paragraph >-{(hero.wisdom/5).toFixed(1)}% traveling unit food consumption when assigned to a group</Paragraph>
                 <Paragraph >{(hero.wisdom/10).toFixed(1)}% less trading commission when assigned to a group</Paragraph>
                 <Paragraph >-{(hero.wisdom/2).toFixed(1)}% happiness cost of employing non-military unit when assigned as a governor</Paragraph>
                 <Paragraph >+{(hero.wisdom/2).toFixed(1)}% production result when assigned to a production building</Paragraph>
             </View>
          </View>
           <View style={{flexDirection:'row',margin:5}}>
              <View style={{marginRight:5,width:73}}>

                  <View style={{margin:5,alignItems:'center'}}>
                      <Avatar.Text style={{backgroundColor:'#FF7518',margin:2}} color="white" size={36} label={hero.authority} />
                      <Subheading >Authority</Subheading>
                  </View>
              </View>
              <View style={{width:270}}>
                  <Paragraph >+{(hero.authority/10).toFixed(1)} moral when assigned to a group</Paragraph>
                  <Paragraph >+{(hero.authority/200).toFixed(2)} happiness/month when assigned as a governor</Paragraph>
              </View>
           </View>
     </View>

}))