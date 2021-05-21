import React, { useContext } from 'react';
import {  View,StyleSheet ,ScrollView,Text,TouchableOpacity ,SafeAreaView } from 'react-native';
import { Button ,Dialog,Modal,Portal ,Paragraph,List,IconButton,Caption,Subheading,Title,Divider ,Surface,Menu,TextInput } from 'react-native-paper';
import { FlatGrid } from 'react-native-super-grid';

import Popover from 'react-native-popover-view';

import Util from './Util.js';
import Icon from './Icon.js';



import Unit from './Unit.js';
import UnitData from './UnitData.js';


import { observer,inject } from "mobx-react"

import mainStore from './MainContext.js';

import i18n from 'i18n-js';


export const SelectUnit = ((props) => {

     const { city ,unit} = props.route.params;

    const navigation = props.navigation;

      React.useLayoutEffect(() => {
        navigation.setOptions({
          headerRight: () => (
            <Button onPress={() => select()} >{i18n.t("ui.button.select")}</Button>
          ),
        });
      }, [navigation]);

    const units = city.units.filter(unit=>{
        return unit.data.action.deploy!=undefined && unit.type!='group'&&unit.state!='deploy'
    })

    const select = ()=>{
        if(units.length+unit.units.length>10){
        }else{
            units.forEach(u=>{
                if(u.selected){
                    u.toggleSelected();
                    unit.addGroup(u);
                }
            })
            navigation.goBack();
        }
    }



      return (
        <View style={{padding:10}}>
             <Caption>{i18n.t("ui.select.you can select")} {10-unit.units.length} {i18n.t("ui.select.units")}</Caption>
             <FlatGrid
                itemDimension={mainStore.unitSize}
                data={units}

                spacing={1}
                renderItem={({ item }) => (
                  <Unit data={item}  onPress={()=>item.toggleSelected()} />
                )}
              />


        </View>
      );

	
})