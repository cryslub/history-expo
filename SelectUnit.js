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
         height: 60,
         width: 60,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 1,
        margin:2
     }
});




export const SelectUnit = ((props) => {

     const { city ,unit} = props.route.params;

    const navigation = props.navigation;

      React.useLayoutEffect(() => {
        navigation.setOptions({
          headerRight: () => (
            <Button onPress={() => select()} >Select</Button>
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
        <SafeAreaView style={{padding:10}}>
             <Caption>You can select {10-unit.units.length} units</Caption>
             <FlatGrid
                itemDimension={mainStore.unitSize}
                data={units}

                spacing={1}
                renderItem={({ item }) => (
                  <Unit data={item}  onPress={()=>item.toggleSelected()} />
                )}
              />


        </SafeAreaView>
      );

	
})