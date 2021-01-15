import React, { useContext } from 'react';


import {  View,StyleSheet ,ScrollView } from 'react-native';


import { Button ,Dialog,Modal,Portal ,Paragraph,List,RadioButton,Subheading  } from 'react-native-paper';

import ThemeDialog from './ThemeDialog';
import ConfirmDialog from './ConfirmDialog';

import ResponsiveDrawer from './ResponsiveDrawer.js';
import ThreeScene from './ThreeScene';
import DataService from './DataService.js';
import Detail from './Detail.js';
import timer from './Timer.js';
import Util from './Util.js';
import {Progress} from './Common.js';

import mainStore from './MainContext.js'
import { observer} from "mobx-react"

import format from 'date-fns/format'
import endOfMonth from 'date-fns/endOfMonth'
import getDate from 'date-fns/getDate'




const styles = StyleSheet.create({
	box:{
		position: 'absolute',
		left: 0,
	   	bottom: 0,
	   	backgroundColor: 'rgba(0,0,0,0.2)',
	   	padding: 5,
	   	flexDirection:'row'
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
	   	padding: 5,
	   	paddingTop:20,
	   	color:'white',
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
        mainStore.stage ='game';
        mainStore.resume();
    }

    return  <View style={styles.top}>
             {mainStore.stage=='start'?<Paragraph style={{color:'white'}}> Choose your faction</Paragraph>:null}
             {mainStore.stage=='choose'?<View style={{flexDirection:'row'}}>
                <Paragraph style={{color:'white',marginRight:3}}> Select destination</Paragraph>
                 <Button mode="outlined" onPress={()=>cancel()}
                    compact={true} color="white" style={styles.button} labelStyle={{fontSize:9}}>
                    Cancel
                </Button>
              </View>:null}
             {mainStore.stage=='game'?<View style={{flexDirection:'row'}}>
                <Progress width={width}
                    style={{backgroundColor: "white",opacity:0.5,left:0,height:4,top:24,position:'absolute',zIndex:1 }}/>


                 <Paragraph style={{color:'white',width:95}}> {format(mainStore.date,'LLL yyyy GG')}</Paragraph>
                 <View style={{flexDirection:'row',marginLeft:5}}>
                    {mainStore.speed==0?
                     <Button mode="contained"  icon="pause"
                        compact={true} color="white" style={styles.speed} contentStyle={{top:0}}>
                    </Button>
                    :<Button mode="outlined"  icon="pause"  onPress={()=>mainStore.setSpeed(0)}
                         compact={true} color="white" style={styles.speed} contentStyle={{top:0}}>
                     </Button>
                    }
                    {mainStore.speed==1?
                     <Button mode="contained"  icon="play"
                        compact={true} color="white" style={styles.speed} contentStyle={{top:0}}>
                    </Button>
                    :<Button mode="outlined"  icon="play"  onPress={()=>mainStore.setSpeed(1)}
                         compact={true} color="white" style={styles.speed} contentStyle={{top:0}}>
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
             :null}
        </View>
}))

let data = {era:{},region:{}};

export  const Interface = (props) =>{
	const [era, setEra] = React.useState({});
	const [theme, setTheme] = React.useState('natural');
	const [showThemeDialog, setShowThemeDialog] = React.useState(false);
	const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
	const [gameData, setGameData] = React.useState({});


    const scene = React.createRef();
	const confirm = React.createRef();


    mainStore.scene = scene;

	const selectScenario = (scenario) => {
	   data.selectScenario(scenario);
	}

  const onSelectFaction = (faction) =>{
    const capital = faction.capital;
    scene.current.moveCameraTo(capital.latitude,capital.longitude);
  }

  const onSelectUnit = (unit) =>{
    const pos = mainStore.objects.vertexReverse(unit.object.position)
    scene.current.moveCameraTo(pos.lat,pos.lon);
  }

  const zoom = (delta) =>{
	  scene.current.zoom(delta);
  }
  
  const changeTheme = (theme) => {
	  setTheme(theme );
	  scene.current.changeTheme(theme)
  }



  const closeThemeDialog = ()=>{
    setShowThemeDialog( false )
  }

    const closeConfirmDialog = ()=>{
      setShowConfirmDialog(false )
    }

    const openConfirmDialog = (title,text,onOK)=>{
        confirm.current.open(title,text,onOK);
    }



    const gameStart = (faction)=>{
        mainStore.setStage('game');
        let year = data.selectedScenario?.year;
        if(year <0) year++;
        mainStore.setDate(new Date(year,0,1))
        mainStore.setSelectedFaction(faction);

        data.init();

        setGameData({faction:faction});

        setInterval(()=>timer(data),200)
    }

    const chooseFaction = (faction)=>{
        openConfirmDialog('Choosing Faction',
            <Paragraph>The game will start with this faction - {faction.name} </Paragraph>,
            ()=>gameStart(faction)
        );
    }

    const makeScores = (start,end)=>{
        const scores = [];

        return scores;
    }


    const go = (target)=>{


        const unit = mainStore.movingUnit;

        if(unit.currentRoad==undefined && unit.currentLocation ==target) return;

        const result = Util.aStar(unit,target);

        openConfirmDialog('Moving',
            <Paragraph>This will take {Util.intDivide((result.length/1000),unit.speed)} days</Paragraph>,
            ()=>move(target,result.path)
        );
    }

    const moveUnit = (unit)=>{
        mainStore.move(unit,'move');
        scene.current.detailOff()
    }

    const move = (target,path)=>{
         scene.current.detailOff()
        const unit = mainStore.movingUnit;

        if(unit.state==''){
            mainStore.addUnit(unit);
        }

        const currentRoad = target.currentRoad;
        if(currentRoad!=undefined){
            const destinies = currentRoad.destinies;
            if(destinies[0].city.id==path[path.length-1].id){
                path.push(destinies[1].city)
            }else{
                path.push(destinies[0].city)
            }
        }
        unit.startMove(path,currentRoad==undefined?undefined:target.object.position);


          mainStore.stage ='game';
          mainStore.resume();
    }

    const trade = (unit)=>{
        mainStore.pause();
         props.navigation.navigate('Trade', {city:unit.currentLocation,unit:unit});
    }

    const exchange = (unit)=>{
        mainStore.pause();
        props.navigation.navigate('Exchange', {unit:unit});
    }

    const inventory = (unit)=>{
        mainStore.pause();
         props.navigation.navigate('Equip', {unit:unit});
    }
    const group = (unit)=>{
        mainStore.pause();
         props.navigation.navigate('Group', {unit:unit});
    }

    const enter = (unit)=>{
        unit.enter();

    }

    const manage = (city,faction)=>{

        props.navigation.navigate('Manage', {city:city,faction:faction});
    }

    const info = (city,faction)=>{

        props.navigation.navigate('Info', {city:city,faction:faction});
    }

    const onLoad = async (objects) =>{
      data = new DataService(objects);
      data.load();
    }

    const onFaction = ()=>{
        props.navigation.navigate('FactionList', {region: data.region,onSelect:onSelectFaction})
    }

     const onUnit = ()=>{
        props.navigation.navigate('Deployed', {onSelect:onSelectUnit})
    }

    return  <>

        <ThreeScene  ref={scene}  onLoad={onLoad} interface={{gameData,chooseFaction,manage,info,go,moveUnit,trade,enter,inventory,group,exchange}}/>

        <Top/>


        <View style={styles.box}>
			{false?<Button mode="outlined"  onPress={()=>props.navigation.navigate('Scenario', {era: data.era,onSelect:onSelect})}
				compact={true} color="white" style={{borderColor:'white',marginRight:3}} labelStyle={{fontSize:9}}> 
		 		Scenario
		 	</Button>:null}
			<Button mode="outlined"  icon="bookmark"  onPress={onFaction}
				compact={true} color="white" style={{borderColor:'white',marginRight:3}} labelStyle={{fontSize:9}}>

		 	</Button>
		 	{mainStore.selectedFaction.id!=undefined?
                <Button mode="outlined"  icon="account"  onPress={onUnit}
                    compact={true} color="white" style={{borderColor:'white',marginRight:3}} labelStyle={{fontSize:9}}>
                </Button>
		 	:null}
			{false?<Button mode="outlined"  onPress={() =>  setShowThemeDialog( true) }
				compact={true} color="white" style={{borderColor:'white'}} labelStyle={{fontSize:9}}> 
		 		Theme
		 	</Button>:null}
		 </View>	
		
		<View style={styles.right}>
			<Button mode="outlined"  onPress={()=>zoom(40)}
				compact={true} color="white" style={{borderColor:'white',marginBottom:3}} labelStyle={{fontSize:9}}> 
		 		++
		 	</Button>

	 		<Button mode="outlined"  onPress={()=>zoom(4)}
				compact={true} color="white" style={{borderColor:'white',marginBottom:3}} labelStyle={{fontSize:9}}> 
		 		+
		 	</Button>
			<Button mode="outlined"  onPress={()=>zoom(-8)}
				compact={true} color="white" style={{borderColor:'white',marginBottom:3}} labelStyle={{fontSize:9}}> 
		 		-
		 	</Button>
		 	<Button mode="outlined"  onPress={()=>zoom(-80)}
				compact={true} color="white" style={{borderColor:'white'}} labelStyle={{fontSize:9}}> 
		 		--
		 	</Button>
		</View>	
		
		<Portal>
            <ThemeDialog showThemeDialog={showThemeDialog} closeThemeDialog={closeThemeDialog} theme={theme} changeTheme={changeTheme}/>
            <ConfirmDialog ref={confirm}/>

	      </Portal>
      
	</>

}