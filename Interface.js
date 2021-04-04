import React, { useContext } from 'react';


import {  View,StyleSheet ,ScrollView,Platform } from 'react-native';


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

import * as FileSystem from 'expo-file-system';


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
        mainStore.stage ='game';
        mainStore.resume();
    }

    const menu = ()=>{
        mainStore.stage ='main';
        mainStore.pause();
    }

    return  <>
        {mainStore.stage!="main"?
        <View style={styles.top}>
             {mainStore.stage=='start'?<Paragraph style={{color:'white',padding:3}}> Choose your faction</Paragraph>:null}
             {mainStore.stage=='choose'?<View style={{flexDirection:'row'}}>
                <Paragraph style={{color:'white',marginRight:3}}> Select destination</Paragraph>
                 <Button mode="outlined" onPress={()=>cancel()}
                    compact={true} color="white" style={styles.button} labelStyle={{fontSize:9}}>
                    Cancel
                </Button>
              </View>:null}
             {mainStore.stage=='game'?<View style={{flexDirection:'row',alignItems:'center',display:'flex'}}>
                <Button   icon="menu"  onPress={()=>menu()}  compact={true} color="white"  style={styles.speed}   contentStyle={{height:'98%'}} labelStyle={{fontSize:20}}>
                </Button>
                <View style={{flexDirection:'row'}}>
                    <Progress width={width}
                        style={{backgroundColor: "white",opacity:0.5,left:3,height:4,top:24,position:'absolute',zIndex:1 }}/>


                     <Paragraph style={{color:'white',width:95}}> {format(mainStore.date,'LLL yyyy GG')}</Paragraph>
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

const Menu =  (observer((props) => {

    const resume = ()=>{
        mainStore.stage = 'game'
        mainStore.resume();
    }

    const newGame = ()=>{
        mainStore.stage = 'start'
        if(mainStore.gameStarted){
            mainStore.data.load();
            mainStore.setSelectedFaction({});
        }
    }

    const save = ()=>{
        let json =  JSON.stringify(getCoreData())
        if (Platform.OS === 'web') {
            download(json,"historia-save.json",'application/json')
        }else{
            FileSystem.writeAsStringAsync("file://historia-save.json",json)
        }
    }

     const load = ()=>{
         if (Platform.OS === 'web') {
            openFile()
        }else{
             FileSystem.readAsStringAsync("file://historia-save.json")
             .then((json ) => {
                 parseSaved(json)
              })
        }
     }

    const parseSaved = (contents)=>{
          const saved = JSON.parse(contents)
            mainStore.parseCoreData(saved.main,mainStore.data)

            saved.cities.forEach(city=>{
                mainStore.data.cities[city.id].parseCoreData(city,mainStore.data)
            })

            props.initGame()
    }

    const openFile = (func) =>{
        const readFile = function(e) {
            var file = e.target.files[0];
            if (!file) {
                return;
            }
            var reader = new FileReader();
            reader.onload = function(e) {
                var contents = e.target.result;
                fileInput.func(contents)
                document.body.removeChild(fileInput)
            }
            reader.readAsText(file)
        }
        const fileInput = document.createElement("input")
        fileInput.type='file'
        fileInput.style.display='none'
        fileInput.onchange=readFile
        fileInput.accept="application/json"
        fileInput.func= (contents)=>{
            parseSaved(contents)
        }

        document.body.appendChild(fileInput)
        clickElem(fileInput)

    }

    const clickElem = (elem)=> {
    	// Thx user1601638 on Stack Overflow (6/6/2018 - https://stackoverflow.com/questions/13405129/javascript-create-and-save-file )
    	var eventMouse = document.createEvent("MouseEvents")
    	eventMouse.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    	elem.dispatchEvent(eventMouse)
    }

    const download = (data, filename, type) => {
       var file = new Blob([data], {type: type});
         if (window.navigator.msSaveOrOpenBlob) // IE10+
             window.navigator.msSaveOrOpenBlob(file, filename);
         else { // Others
             var a = document.createElement("a"),
                     url = URL.createObjectURL(file);
             a.href = url;
             a.download = filename;
             document.body.appendChild(a);
             a.click();
             setTimeout(function() {
                 document.body.removeChild(a);
                 window.URL.revokeObjectURL(url);
             }, 0);
         }
    }

    const getCoreData = ()=>{
        return {
            cities : Object.keys(mainStore.data.cities).map(key=>{
                return mainStore.data.cities[key].getCoreData()
            }),
            main:mainStore.getCoreData()
        }
    }

    return <>
         {mainStore.stage=='main'?
         <View style={styles.menuContainer} >
             <View style={styles.menu} >
                {mainStore.gameStarted?<Button mode="outlined" onPress={()=>save()}
                    compact={true} color="white" style={styles.menuButton}>
                    Save
                </Button>:null}
                <Button mode="outlined" onPress={()=>load()}
                    compact={true} color="white" style={styles.menuButton}>
                    Load
                </Button>

                <Button mode="outlined" onPress={()=>newGame()}
                    compact={true} color="white" style={styles.menuButton}>
                    New Game
                </Button>
                {mainStore.gameStarted?<Button mode="outlined" onPress={()=>resume()}
                    compact={true} color="white" style={styles.menuButton}>
                    Resume
                </Button>:null}

             </View>
         </View>:null}
    </>
}))

const Side =  (observer((props) => {

    const onFaction = ()=>{
        props.navigation.navigate('FactionList', {region: mainStore.data.region,onSelect:props.onSelectFaction})
    }

     const onUnit = ()=>{
        props.navigation.navigate('Deployed', {onSelect:props.onSelectUnit})
    }


    return <>
        {mainStore.stage!='main'?<>
            <View style={styles.box}>
                {false?<Button mode="outlined"  onPress={()=>props.navigation.navigate('Scenario', {era: mainStore.data.era,onSelect:props.onSelect})}
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
                <Button mode="outlined"  onPress={()=>props.zoom(40)}
                    compact={true} color="white" style={{borderColor:'white',marginBottom:3}} labelStyle={{fontSize:9}}>
                    ++
                </Button>

                <Button mode="outlined"  onPress={()=>props.zoom(4)}
                    compact={true} color="white" style={{borderColor:'white',marginBottom:3}} labelStyle={{fontSize:9}}>
                    +
                </Button>
                <Button mode="outlined"  onPress={()=>props.zoom(-8)}
                    compact={true} color="white" style={{borderColor:'white',marginBottom:3}} labelStyle={{fontSize:9}}>
                    -
                </Button>
                <Button mode="outlined"  onPress={()=>props.zoom(-80)}
                    compact={true} color="white" style={{borderColor:'white'}} labelStyle={{fontSize:9}}>
                    --
                </Button>
            </View>
         </>:null}
    </>
}))


export  const Interface = (props) =>{
	const [era, setEra] = React.useState({});
	const [theme, setTheme] = React.useState('natural');
	const [showThemeDialog, setShowThemeDialog] = React.useState(false);
	const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);


    const scene = React.createRef();
	const confirm = React.createRef();


    mainStore.scene = scene;

    setInterval(()=>timer(mainStore.data),200)


	const selectScenario = (scenario) => {
	   mainStore.data.selectScenario(scenario);
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
        let year = mainStore.data.selectedScenario?.year;
        if(year <0) year++;
        mainStore.setDate(new Date(year,0,1))
        mainStore.setSelectedFaction(faction);

        mainStore.data.init();

        initGame()

    }

    const initGame = ()=>{
        mainStore.setStage('game');

        mainStore.gameStarted = true

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
            ()=>move(target,result)
        );
    }

    const moveUnit = (unit)=>{
        mainStore.move(unit,'move');
        scene.current.detailOff()
    }

    const move = (target,result)=>{
        const path = result.path
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
        unit.startMove(path,result.end,currentRoad==undefined?undefined:target);


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

        props.navigation.navigate('Manage', {city:city.id,faction:faction});
    }

    const info = (city,faction)=>{

        props.navigation.navigate('Info', {city:city,faction:faction});
    }

    const onLoad = async (objects) =>{
      mainStore.data = new DataService(objects);
      mainStore.data.load();
    }


    return  <>

        <ThreeScene  ref={scene}  onLoad={onLoad} interface={{chooseFaction,manage,info,go,moveUnit,trade,enter,inventory,group,exchange}}/>

        <Top/>


        <Side onSelectFaction={onSelectFaction} onSelectUnit={onSelectUnit} zoom={zoom} navigation={props.navigation}/>
		<Menu initGame={initGame}/>

		<Portal>
            <ThemeDialog showThemeDialog={showThemeDialog} closeThemeDialog={closeThemeDialog} theme={theme} changeTheme={changeTheme}/>
            <ConfirmDialog ref={confirm}/>

	      </Portal>
      
	</>

}