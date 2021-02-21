import React, { Component } from 'react';

import {  View,StyleSheet ,ScrollView,Text,TouchableOpacity,Animated  } from 'react-native';
import { Button ,Dialog,Modal,Portal ,Paragraph,List,IconButton,Caption,Subheading,Title,Divider ,Surface,Menu,TextInput } from 'react-native-paper';

import Icon from './Icon.js';
import Util from './Util.js';
import {Progress} from './Common.js';

import { observer} from "mobx-react"


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
        height: 100,
         width: mainStore.unitSize,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 1,
        margin:2
     },
     deploy:{
        backgroundColor: "black",
        opacity:0.3,
        right:0,
        height:60,
        position:'absolute',
        zIndex:1
     }

});

const containerStyle = {backgroundColor: 'white', padding: 20};

@observer
export default class Unit extends Component {


    constructor(){
		super();

	    this.state={
            visible :false,
            amount:1
        }
	}

	minus = () =>{
        this.setState({amount:--this.state.amount})
	}
	plus = () =>{
        this.setState({amount:++this.state.amount})

	}

    onAction = ()=>{
        this.setState({visible:false});

    }

    onPress = ()=>{
        if(this.props.action && this.props.data.state!='deploy')
            this.setState({visible:true})
        if(typeof this.props.onPress ==='function'){
            this.props.onPress();
        }
    }

    icon = (data)=>{
        if(data.type=='group'){
            const units = data.units;
            if(units){
                if(units.length>0){
                    const ret = []
                    for(var i = 0;i<Math.min(units.length,4);i++){
                        const unit = units[i];
                        ret.push(<Icon icon={unit.icon}  color={unit.color} style={{alignItems: 'center',justifyContent: 'center',marginTop:2,minWidth:18,width:18,height:16}} contentStyle={{marginLeft:14}}/>)
                    }
                    return <View style={{flexDirection:'row'}}>
                        {ret}
                    </View>
                }
            }
        }
        return   <Icon icon={data.icon}  color={data.color}/>
    }

	render(){

        const data = this.props.data;
        if(data==undefined) return null;
        const type = this.props.type;
        const selected = data.selected;

        let width = data.remain*mainStore.unitSize/data.delay;
        if(data.delay == 0) width=0
        const color = data.color==undefined?'grey':data.color

		return <View style={{opacity:this.props.disabled?0.5:1}}>
		    <Portal>
		    <Dialog visible={this.state.visible} onDismiss={()=>this.setState({visible:false})}>
              <Dialog.Content>
                 {this.props?this.props.action?this.props.action(this.onAction,this.props.disabled):null:null}
              </Dialog.Content>

            </Dialog>
          </Portal>


              <TouchableOpacity  onPress={this.onPress} style={styles.unit}>
                 {data.state=='deploy'?<Progress width={width} style={{backgroundColor: "black",opacity:0.3,right:0,height:100,position:'absolute',zIndex:1 }}/>:null}
                 {data.state=='produce'?<Progress width={mainStore.unitSize-width} style={{backgroundColor: color,opacity:0.3,left:0,bottom:0,height:4,position:'absolute',zIndex:1 }}/>:null}

                {
                    data.subs?.map((sub,index)=>{
                        let i = data.subs.length - (index+1);
                        const width = sub.remain*mainStore.unitSize/sub.delay;
                        return <Progress width={width} style={{backgroundColor: "black",opacity:0.3,right:0,top:4*i,height:4,position:'absolute',zIndex:1 }}/>
                    })
                }

                <Surface style={styles.unit}>
                   {selected==true?<Icon icon="check-bold" style={{right: -24,position: 'absolute',top:1}} />:null}

                    {this.icon(data)}
                   <View style={{height:40,display:'flex',justifyContent:'center'}}>
                       <Paragraph style={{fontSize:data.name.length>20?10:12,textAlign:'center',lineHeight:13,verticalAlign:'middle'}}>{data.name}</Paragraph>
                   </View>
                   {this.props.quantity?this.props.quantity():null}
                </Surface>

              </TouchableOpacity>


        </View>
	}
}