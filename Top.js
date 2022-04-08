import React, { useContext } from 'react';
import i18n from 'i18n-js';

import { View,StyleSheet } from 'react-native';

import { Button ,Dialog,Modal,Portal ,Paragraph,List,RadioButton,Subheading  } from 'react-native-paper';

import { observer} from "mobx-react"
import {Progress} from './Common.js';

import format from 'date-fns/format'
import endOfMonth from 'date-fns/endOfMonth'
import getDate from 'date-fns/getDate'


import mainStore from './MainContext.js'

const styles = StyleSheet.create({
	box:{
		position: 'absolute',
		left: 0,
	   	bottom: 0,
	   	backgroundColor: 'rgba(0,0,0,0.2)',
	   	padding: 5,
	   	flexDirection:'row'
	},
	menuContainer:{
        position: 'absolute',
        top: 0,
        width:'100%',
        height:'100%'
    },
	menu:{
         marginLeft: '25%',
          width: '50%',
          height:'100%',
          padding: 10,
        backgroundColor: 'rgba(0,0,0,0.3)',
        display: 'flex',
         justifyContent: 'center'
    },
    menuButton:{
        borderColor:'white',
        margin:3,
        position:'relative'
    },
	right:{
		position: 'absolute',
		right: 0,
	   	top: '50%',
	   	backgroundColor: 'rgba(0,0,0,0.2)',
	   	padding: 5
	},
    top:{
        position: 'absolute',
        top: 0,
	   	backgroundColor: 'rgba(0,0,0,0.2)',
	   	paddingTop:20,
	   	paddingBottom:5,
	   	width:'100%'
    },
    speed:{
        borderColor:'white',
        marginLeft:5,
        width:30,
        height:30
    },
    button:{
        borderColor:'white',
        marginRight:3
    }

});

const Top =  (observer((props) => {


    const day = getDate(mainStore.date)-1;
    const max = getDate(endOfMonth(mainStore.date))-1;
    const width = day*93/max;

    const cancel = ()=>{
        mainStore.setStage('game');
        mainStore.resume();
    }

    const menu = ()=>{
        mainStore.setStage( 'main');
        mainStore.pause();
    }

    const dateString = ()=>{
        if(i18n.locale=='en'){
            return format(mainStore.date,'LLL yyyy GG')
        }else if(i18n.locale=='ko-KR'){
            return format(mainStore.date,'GG yyyy년 M월')
        }
    }


    return  <>
        {mainStore.stage!="main"&&mainStore.stage!="load"?
        <View style={styles.top}>
             {mainStore.stage=='start'?<Paragraph style={{color:'white',padding:3}}>  {i18n.t("ui.top.choose your faction")}</Paragraph>:null}
             {mainStore.stage=='choose'?<View style={{flexDirection:'row'}}>
                <Paragraph style={{color:'white',marginRight:3}}>  {i18n.t("ui.top.select destination")}</Paragraph>
                 <Button mode="outlined" onPress={()=>cancel()}
                    compact={true} color="white" style={styles.button} labelStyle={{fontSize:9}}>
                    {i18n.t("ui.button.cancel")}
                </Button>
              </View>:null}
             {mainStore.stage=='game'?<View style={{flexDirection:'row',alignItems:'center',display:'flex'}}>
                {props.menu!=false?
                <Button   icon="menu"  onPress={()=>menu()}  compact={true} color="white"  style={styles.speed}   contentStyle={{height:'98%'}} labelStyle={{fontSize:20}}>
                </Button>:null}
                <View style={{flexDirection:'row'}}>
                    <Progress width={width}
                        style={{backgroundColor: "white",opacity:0.5,left:3,height:4,top:24,position:'absolute',zIndex:1 }}/>


                     <Paragraph style={{color:'white',width:110}}> {dateString()}</Paragraph>
                     <View style={{flexDirection:'row',marginLeft:5}}>
                        {mainStore.speed==0?
                         <Button mode="contained"  icon="pause"
                            compact={true} color="white" style={styles.speed} contentStyle={{height:'100%'}}>
                        </Button>
                        :<Button mode="outlined"  icon="pause"  onPress={()=>mainStore.setSpeed(0)}
                             compact={true} color="white" style={styles.speed} contentStyle={{height:'100%'}}>
                         </Button>
                        }
                        {mainStore.speed==1?
                         <Button mode="contained"  icon="play"
                            compact={true} color="white" style={styles.speed} contentStyle={{height:'100%'}}>
                        </Button>
                        :<Button mode="outlined"  icon="play"  onPress={()=>mainStore.setSpeed(1)}
                             compact={true} color="white" style={styles.speed} contentStyle={{height:'100%'}}>
                         </Button>
                        }
                        {mainStore.speed==2?
                         <Button mode="contained"
                            compact={true} color="white" style={styles.speed}  labelStyle={{fontSize:8,margin:0,marginTop:10,padding:0}}>
                            X2
                        </Button>
                        :<Button mode="outlined"   onPress={()=>mainStore.setSpeed(2)}
                             compact={true} color="white" style={styles.speed}  labelStyle={{fontSize:8,margin:0,marginTop:10,padding:0}}>
                             X2
                         </Button>
                         }
                        {mainStore.speed==4?
                         <Button mode="contained"
                            compact={true} color="white" style={styles.speed}  labelStyle={{fontSize:8,margin:3,marginTop:10}}>
                            X4
                        </Button>
                        :<Button mode="outlined"   onPress={()=>mainStore.setSpeed(4)}
                             compact={true} color="white" style={styles.speed}  labelStyle={{fontSize:8,margin:3,marginTop:10}}>
                             X4
                         </Button>
                        }
                     </View>
                 </View>
                </View>
             :null}
        </View>
        :null}
     </>
}))


export default Top