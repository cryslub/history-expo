import React, { Component } from 'react';
import {  View,Animated,PanResponder,TouchableOpacity,Text,StyleSheet  } from 'react-native';
import { Subheading,Paragraph,Button,Caption  } from 'react-native-paper';

import { observer} from "mobx-react"
import Util from './Util.js';
import Progress from './Progress.js';

import mainStore from './MainContext.js'

import i18n from 'i18n-js';

const styles = StyleSheet.create({
	text:{
		color: "white",
		 textShadowColor: 'rgba(0, 0, 0, 1)',
		  textShadowOffset: {width: -1, height: 1},
		  textShadowRadius: 1,

			lineHeight:13,
			textAlign:'center',
	},
	textLabel:{
		position:'absolute',
		marginLeft:-50,

		width:100,
	},
	detail:{
		position:'absolute',
		zIndex:10,
		marginTop:-50,
		marginLeft:15,
		padding:10,
		borderWidth:1,
		borderColor:'#111111',
		opacity: 1
	},
	button:{
    	borderColor:'white',
    	marginRight:3,
    	marginBottom:5
	}
});

@observer
export default class BuildingDetail extends Component{

    layoutWidth = 0

    manage = (detail)=>{
        const inf = this.props.interface;
        const scene = this.props.scene;
        scene.detailOff();
        inf.manage(detail.city,detail.faction)
    }

    canTrade = (city)=>{
        return city.currentLocation.trade.length>0&&
            city.currentLocation.factionData.id!=mainStore.selectedFaction.id&&
            (city.type=='merchant' || city.hasUnit('merchant'))
    }

    enter = (unit)=>{
        const inf = this.props.interface;
        inf.enter(unit)

        const scene = this.props.scene;
        scene.detailOff();
    }

    exchange = (unit)=>{
        const inf = this.props.interface;
        inf.exchange(unit)

        const scene = this.props.scene;
        scene.detailOff();
    }

    onLayout = (event)=>{
        this.layoutWidth  = event.nativeEvent.layout.width
    }

    unassign = (unit)=>{
        const detail = this.props.detail;
        const building = detail.building;

        building.unassignUnit(unit)
    }

    assign = (type)=>{

        const detail = this.props.detail;
        const building = detail.building;
        const city = building.city;
        const unit = city.getUnit(type)
        if(unit!=undefined)
           city.assign(unit,building)
    }

    manage = ()=>{
        const detail = this.props.detail;
        const building = detail.building;
        const city = building.city;

        this.props.navigation.navigate('BuildingDetail', {building:building,city:city});
    }

    render(){
        const detail = this.props.detail;
        const inf = this.props.interface;
        const building = detail.building;

        const worker = building.data.worker
        const width = ((building.delay-building.remain)*(this.layoutWidth-20))/building.delay;

        return <View onLayout={this.onLayout} style={[styles.detail,{top:detail.top,left:detail.left,backgroundColor:detail.color}]}>
            <View style={{flexDirection:'row'}}>
                  <Button icon={detail.icon} color="white" style={{minWidth:24,width:24}} contentStyle={{marginLeft:6,marginRight:-4,height:30}}/>
                   <Subheading style={{color:'white'}}>{detail.name}</Subheading>
            </View>
            {building.state=='deploy'?
            <>
                <View style={{flexDirection:'row'}}>
                    <Caption style={{color:'white'}}>{i18n.t("ui.build.under construction")}</Caption>
                </View>
             </>
             :null}
            {building.state=='deploy'||building.state=='produce'?
            <>
                <View style={{flexDirection:'row'}}>
                   <Progress width={width} style={{backgroundColor: "white",left:0,top:0,height:4,position:'absolute',zIndex:1 }}/>
                </View>
            </>
            :null}
            <View style={{flexDirection:'row'}}>
                {Object.keys(worker).map(key=>{
                    var ret = [];
                    for(var i =0 ;i<worker[key];i++){
                        if(building.units.length>i){
                            ret.push(<Button icon="account" color="white" onPress={()=>this.unassign(building.units[0])} style={{minWidth:14,width:14}} contentStyle={{marginLeft:16,marginRight:-4,height:30}}/>)
                        }else{
                            ret.push(<Button icon="account-outline" color="white" onPress={()=>this.assign(key)} style={{minWidth:14,width:14}} contentStyle={{marginLeft:16,marginRight:-4,height:30}}/>)
                        }
                    }
                    return ret;
                })}
            </View>
            <Button mode="outlined" onPress={this.manage}
                 compact={true} color="white" style={styles.button} labelStyle={{fontSize:9}}>
                 {i18n.t("ui.button.manage")}
             </Button>
        </View>
    }
}