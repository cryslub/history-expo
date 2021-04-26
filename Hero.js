import React, { Component } from 'react';

import {  View,StyleSheet ,ScrollView,Text,TouchableOpacity,Animated  } from 'react-native';
import { Button ,Dialog,Modal,Portal ,Paragraph,List,IconButton,Caption,Subheading,Title,Divider ,Surface,Menu,TextInput,Badge } from 'react-native-paper';

import Icon from './Icon.js';
import Util from './Util.js';

import { observer} from "mobx-react"


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

export const Progress = (props)=>{
     const width = props.width
     const style = props.style
     style.width = width;
     return <Animated.View
         style={[StyleSheet.absoluteFill], style}
      >
      </Animated.View>
}



@observer
export default class Hero extends Component {


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
        this.setState({visible:true})
    }

    icon = (data)=>{

        return   <Icon icon="star"  color="gold"/>
    }

    info = (data)=>{
        this.props.navigation.navigate('HeroInfo', {hero:this.props.data});
        this.onAction();
    }

    assign = (data)=>{
        this.props.assign(this.props.data)
        this.onAction();
    }

    remove = (data)=>{
        this.props.remove(this.props.data)
        this.onAction();
    }

	render(){

        const data = this.props.data;
        const type = this.props.type;
        const removable = this.props.removable;


        if(data==undefined) return null;
        const selected = data.selected;

        let width = data.remain*mainStore.unitSize/data.delay;
        if(data.delay == 0) width=0
        const color = data.color==undefined?'grey':data.color

		return <View style={{opacity:this.props.disabled?0.5:1}}>
		    <Portal>
		    <Dialog visible={this.state.visible} onDismiss={()=>this.setState({visible:false})}>
              <Dialog.Content>
                 <Menu.Item  onPress={() => this.info()} title={i18n.t("ui.action.info")}/>
                 {removable?<Menu.Item  onPress={() => this.remove()} title={i18n.t("ui.action.remove")}/>
                 :null
                 }
                 {type=='group'?null:<Menu.Item  onPress={() => this.assign()} title={i18n.t("ui.action.assign")}/>}
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

                   <View style={{height:40,display:'flex'}}>
                       <Paragraph style={{fontSize:12,textAlign:'center',lineHeight:13}}>{data.name}</Paragraph>
                   </View>
                   <View style={{flexDirection:'row'}}>
                       <Badge style={{marginRight:1,backgroundColor:'#ff1f13'}}>{data.valor}</Badge>
                       <Badge style={{marginRight:1,backgroundColor:'#2780E3'}}>{data.wisdom}</Badge>
                       <Badge style={{marginRight:1,backgroundColor:'#FF7518',color:'white'}}>{data.authority}</Badge>
                   </View>
                </Surface>

              </TouchableOpacity>


        </View>
	}
}