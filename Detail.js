import React, { Component } from 'react';
import {  View,Animated,PanResponder,TouchableOpacity,Text,StyleSheet  } from 'react-native';
import { Subheading,Paragraph,Button,Caption  } from 'react-native-paper';

import { observer} from "mobx-react"
import Util from './Util.js';

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
export default class Detail extends Component{

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

    render(){
        const detail = this.props.detail;
        const inf = this.props.interface;
        const city = detail.city;

        return <View style={[styles.detail,{top:detail.top,left:detail.left,backgroundColor:detail.color}]}>
            <View style={{flexDirection:'row'}}>
                   {detail.isCapital?<Button icon="star" color="white" style={{minWidth:24,width:24}} contentStyle={{marginLeft:6,marginRight:-4,height:30}}/>:null}
                   <Subheading style={{color:'white'}}>{detail.name}</Subheading>
            </View>
            {detail.population>0?
            <>
                <View style={{flexDirection:'row'}}>
                    <Button icon="bookmark" color="white" style={{minWidth:22,width:22}} contentStyle={{marginLeft:0,marginRight:-15,height:27}}/>
                    <Caption style={{color:'white',fontWeight: "bold",marginRight:8}}>{detail.factionName}</Caption>
                    <Button icon="account-multiple" color="white" style={{minWidth:16,width:16}} contentStyle={{marginLeft:0,marginRight:-15,height:27}}/>
                    <Caption  style={{color:'white',marginLeft:5}}>{Util.number(city.population)}</Caption>
                </View>
                {mainStore.stage=='game'?<>
                    <View style={{flexDirection:'row'}}>
                        <Button icon="knife-military" color="white" style={{minWidth:16,width:16}} contentStyle={{marginLeft:0,marginRight:-15,height:27}}/>
                        <Caption  style={{color:'white',marginLeft:5,marginRight:8}}>{Util.number(city.getMilitaryUnits('armed'))}</Caption>
                        <Button icon="chess-rook" color="white" style={{minWidth:16,width:16}} contentStyle={{marginLeft:0,marginRight:-15,height:27}}/>
                        <Caption  style={{color:'white',marginLeft:5}}>{Math.floor(city.getDefense())}/{city.getDefenseMax()}</Caption>
                    </View>
                </>:null}
                 <View style={{flexDirection:'row',marginBottom:7}}>
                {
                    city.snapshotSub?.resource?
                    <>
                    {
                        Object.keys(city.snapshotSub?.resource).map(key=>{
                            return <Button key={key} icon={mainStore.data.resources[key].icon} color="white" style={{minWidth:24,width:24}} contentStyle={{marginLeft:6,marginRight:-4}}/>
                        })
                    }
                    </>
                    :null
                }
                </View>
                {mainStore.stage=='start'&&detail.factionName!='None'?<Button mode="outlined"  onPress={()=>inf.chooseFaction(detail.faction)}
                    compact={true} color="white" style={{borderColor:'white',marginRight:3}} labelStyle={{fontSize:9}}>
                    {i18n.t("ui.button.choose")}
                </Button>:null}
                {mainStore.stage=='game'?<>

                    {detail.manageable?<Button mode="outlined"  onPress={()=>this.manage(detail)}
                        compact={true} color="white" style={styles.button} labelStyle={{fontSize:9}}>
                        {i18n.t("ui.button.manage")}
                    </Button>
                    :<Button mode="outlined"  onPress={()=>inf.info(city,detail.faction)}
                         compact={true} color="white" style={styles.button} labelStyle={{fontSize:9}}>
                         {i18n.t("ui.button.info")}
                     </Button>
                     }
                </>:null}
            </>
            :null
            }
            {mainStore.stage=="choose"&&mainStore.movingUnit!=city?
                <Button mode="outlined" onPress={()=>inf.go(city)}
                    compact={true} color="white" style={styles.button} labelStyle={{fontSize:9}}>
                    {i18n.t("ui.button.go")}
                </Button>
            :null}
            {city.sort=='unit'?
                mainStore.stage=="game"&&detail.manageable?<>
                    {city.moral>0?
                    <Button mode="outlined" onPress={()=>inf.moveUnit(city)}
                        compact={true} color="white" style={styles.button} labelStyle={{fontSize:9}}>
                        {i18n.t("ui.button.move")}
                    </Button>
                    :null
                    }
                    {city.type=='group'&&detail.manageable?<Button mode="outlined" onPress={()=>inf.group(city)}
                        compact={true} color="white" style={styles.button} labelStyle={{fontSize:9}}>
                        {i18n.t("ui.button.mange")}
                    </Button>:null}
                    {city.type!='group'&&detail.manageable?<Button mode="outlined" onPress={()=>inf.inventory(city)}
                         compact={true} color="white" style={styles.button} labelStyle={{fontSize:9}}>
                         {i18n.t("ui.button.inventory")}
                     </Button>:null
                    }
                    {
                        city.state=='traveling'&&city.moral>0?<Button mode="outlined" onPress={()=>city.toggleStop()}
                                compact={true} color="white" style={styles.button} labelStyle={{fontSize:9}}>
                                {city.pause?"Resume":"Stop"}
                            </Button>
                        :<>
                        {
                            city.canTrade?
                             <Button mode="outlined" onPress={()=>inf.trade(city)}
                                 compact={true} color="white" style={styles.button} labelStyle={{fontSize:9}}>
                                 {i18n.t("ui.button.trade")}
                             </Button>
                            :null
                        }
                        {
                            city.currentLocation.id == city.city.id&&city.currentRoad==undefined?
                            <Button mode="outlined" onPress={()=>this.enter(city)}
                                 compact={true} color="white" style={styles.button} labelStyle={{fontSize:9}}>
                                 {i18n.t("ui.button.enter")}
                            </Button>
                            :null
                        }

                        </>
                    }
                </>:null:null
            }
        </View>
    }
}