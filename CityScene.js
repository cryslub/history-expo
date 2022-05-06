import React, { Component } from 'react';

import ExpoTHREE, { THREE } from 'expo-three'; // 2.2.2-alpha.1
import ExpoGraphics from 'expo-graphics'; // 0.0.3
import OrbitControls from './OrbitControlsView.js'

import {  View,Animated,PanResponder,TouchableOpacity,Text,StyleSheet  } from 'react-native';
import { createStackNavigator,HeaderBackButton } from '@react-navigation/stack';
import PinchZoomResponder from 'react-native-pinch-zoom-responder'
import { PinchGestureHandler, RotationGestureHandler,State,PanGestureHandler,TapGestureHandler } from 'react-native-gesture-handler';
import { Subheading,Paragraph,Button,Caption  } from 'react-native-paper';

import { observer} from "mobx-react"


import Globe from './Globe.js';
import CameraHandler from './CameraHandler.js';
import VariableObjects from './VariableObjects.js';
import Detail from './BuildingDetail.js';
import Icon from './Icon.js';
import Top from './Top.js'

import mainStore from './MainContext.js'

import Util from './Util.js';
import Label from './Label.js'

const styles = StyleSheet.create({
	text:{
		color: "white",
		 textShadowColor: 'rgba(0, 0, 0, 0.7)',
          textShadowOffset: {width: -1, height: 1},
          textShadowRadius: 1,

        lineHeight:13,
        textAlign:'center',
        padding:5,
        borderRadius:5
	},
	textLabel:{
		position:'absolute'
	},
	right:{
        position: 'absolute',
        right: 0,
        top: '50%',
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 5
    },
    box:{
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 5,
        flexDirection:'row'
    },
});



const Side =  (observer((props) => {

    const onInfo = ()=>{
          props.navigation.navigate('Manage', {city:props.city });
    }

    return <>
        {mainStore.stage!='main'&&mainStore.stage!="load"?<>

            {mainStore.stage=='build'?null:
                <View style={styles.box}>

                    <Button mode="outlined"  icon="text-box"  onPress={onInfo}
                        compact={true} color="white" style={{borderColor:'white',marginRight:3}} labelStyle={{fontSize:12}}>
                    </Button>

                 </View>
            }
            <View style={styles.right}>

                <Button mode="outlined"  onPress={()=>props.zoom(-1)}
                    compact={true} color="white" style={{borderColor:'white',marginBottom:3}} labelStyle={{fontSize:9}}>
                    +
                </Button>
                <Button mode="outlined"  onPress={()=>props.zoom(1)}
                    compact={true} color="white" style={{borderColor:'white',marginBottom:3}} labelStyle={{fontSize:9}}>
                    -
                </Button>

            </View>
         </>:null}
    </>
}))

export default class CityScene extends Component{


	constructor(){
		super();
		this.doubleTap = React.createRef();
		this.controls = React.createRef();
		this.objects = [];
		this.objectMap = {};
		this.pointer = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.detailHtml= {}

		this.state={
			textlabels :[],
			detail:{},
			 zoom: null,
             minZoom: null,
             layoutKnown: false,
             isZooming: false,
             isMoving: false,
             initialDistance: null,
             initialX: null,
             initalY: null,
             offsetTop: 0,
             offsetLeft: 0,
             initialTop: 0,
             initialLeft: 0,
             initialTopWithoutZoom: 0,
             initialLeftWithoutZoom: 0,
             initialZoom: 1,
             top: 0,
             left: 0,
             camera:null
		}
		
		
		this.panResponder = PanResponder.create({
			onStartShouldSetPanResponder: this.handleStartShouldSetPanResponder,
		    onPanResponderGrant: this.handlePanResponderGrant,
		    onPanResponderMove: this.handlePanResponderMove,
		    onPanResponderRelease: this.handlePanResponderEnd,
		    onPanResponderTerminate: this.handlePanResponderEnd,
		});



	}


    componentDidMount = ()=>{

        const navigation = this.props.navigation

        navigation.setOptions({
            headerLeft: (props) => (
                <HeaderBackButton
                  {...props}
                  onPress={() => {
                    mainStore.resume();
                    mainStore.setStage('game')
                    this.cancelBuild()
                    navigation.goBack()
                  }}
                />
              )
        })
    }

	detail = (label)=>{

	    this.makeDetailHtml(label.city)

	}


    makeDetailHtml(building){

        if(mainStore.stage=='build') return;

		if(building === undefined){
	        this.detailHtml.added = false;

			return;
		}else{
			 this.detailHtml = new  Label(building)

		}

//		  this.detailHtml.element.className ="text-detail";
		this.detailHtml.name = building.name;
		this.detailHtml.added = true;
        this.detailHtml.building = building

		this.detailHtml.color = building.color;

//		  this.detailHtml.setHTML(html);
		this.detailHtml.setParent(building.object);

	  }

	detailOff = ()=>{
	    const detail = this.state.detail;
	    detail.added = false;
	    this.setState({detail:detail})
	}

	// Should we become active when the user presses down on the square?
	  handleStartShouldSetPanResponder = () => {
	    return true;
	  };

	  // We were granted responder status! Let's update the UI
	  handlePanResponderGrant = (e, gestureState) => {
		  const event = this._transformEvent({ ...e, gestureState });
//            console.log(event)

          this.pointer.set( ( event.locationX /event.target.clientWidth ) * 2 - 1, - ( event.locationY / event.target.clientHeight ) * 2 + 1 );
          this.raycaster.setFromCamera( this.pointer, this.state.camera );
          const intersects = this.raycaster.intersectObjects( this.objects, false );

          if ( intersects.length > 0 ) {
                const intersect = intersects[ 0 ];

                if(mainStore.stage=='build'){
                    if ( intersect.object == this.plane ) {

                        const onBuild = mainStore.onBuild
                        const rollOverMesh = onBuild.object

                        rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
                        rollOverMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 );

                        const size = onBuild.size
                         rollOverMesh.position.x -=  size.width%2*25;
                        rollOverMesh.position.z -=  size.length%2*25;

                        rollOverMesh.position.y = 15
                    }
                }else{
                    if ( intersect.object !== this.plane ) {


                        const building = this.objectMap[intersect.object.id]

                        this.makeDetailHtml(building)

                    }else{
                         this.makeDetailHtml()
                   }
               }
          }else{
                this.makeDetailHtml()
          }



	  };

	  // Every time the touch/mouse moves
	  handlePanResponderMove = (e, gestureState) => {
	    // Keep track of how far we've moved in total (dx and dy)
	     const touches = e.nativeEvent.touches;

        if (touches.length >= 2) {
            // We have a pinch-to-zoom movement
            // Track locationX/locationY to know by how much the user moved their fingers
             let touch1 = touches[0];
            let touch2 = touches[1];

          //  console.log(touches[0].pageX+","+ touches[0].pageY+","+
                  //                      touches[1].pageX+","+ touches[1].pageY)
            if(touches[0] != undefined && touches[1] != undefined)
                this.processPinch(touches[0].pageX, touches[0].pageY,
                    touches[1].pageX, touches[1].pageY);

        } else {
            // We have a regular scroll movement

            if (!this.state.isZooming) {
                const event = this._transformEvent({ ...e, gestureState });
            //  console.log(event)
                this.cameraHandler.handlePanResponderMove(event.nativeEvent)
		    }

        }

	  };

	  // When the touch/mouse is lifted
	  handlePanResponderEnd = (e, gestureState) => {
	    
		  const event = this._transformEvent({ ...e, gestureState });
//		  console.log(event)
		    this.cameraHandler.handlePanResponderEnd(event.nativeEvent)
            this.setState({
                isZooming: false
            });
	  };

     calcDistance(x1, y1, x2, y2) {
        let dx = Math.abs(x1 - x2)
        let dy = Math.abs(y1 - y2)
        return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    }


	  processPinch(x1, y1, x2, y2) {
          let distance = this.calcDistance(x1, y1, x2, y2);
           // console.log(distance)
          if (!this.state.isZooming) {
           // console.log("initialDistance - " + distance)
              this.setState({
                  isZooming: true,
                  initialDistance: distance
              });

          } else {
              let touchZoom = distance / this.state.initialDistance;

//              console.log(touchZoom)

              this.zoom(Math.log(touchZoom)*5)

          }
      }

	  _transformEvent = event => {
		    event.preventDefault = event.preventDefault || (() => {});
		    event.stopPropagation = event.stopPropagation || (() => {});
		    return event;
		  };
		  

	  changeTheme = (theme) => {
		 this.globe.changeTheme(theme)
		 this.objects.changeTheme(theme);
		 this.objects.addLines(this.objects.lines)
	  }

	 addUnit = (lat,lon,color,unit) =>{
	    this.objects.addUnit(lat,lon,color,unit)
	 }

    addUnitWithPosition = (pos,color,unit) =>{
	    this.objects.addUnitWithPosition(pos,color,unit)
	 }

	onContextCreate = async ({ gl, arSession, width, height, scale }) => {

	    this.renderer = new ExpoTHREE.Renderer({ gl });
        this.renderer.setPixelRatio(scale);
        this.renderer.setSize(width, height);
        this.renderer.setClearColor(0x000000, 1.0);

        const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
	    camera.position.set( 800, 1500, 1000 );
		camera.lookAt( 0, 0, 0 );
		this.setState({camera:camera})

		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color( 0x414141 );

        // roll-over helpers

     /*   const rollOverGeo = new THREE.BoxGeometry( 50, 50, 50 );
        const rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 1, transparent: true } );
        const rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );

        var geo = new THREE.EdgesGeometry( rollOverMesh.geometry );
        var mat = new THREE.LineBasicMaterial( { color: 0x111111, linewidth: 1 } );
        var wireframe = new THREE.LineSegments( geo, mat );
        wireframe.renderOrder = 1; // make sure wireframes are rendered 2nd
        rollOverMesh.add( wireframe );


        this.scene.add( rollOverMesh );
*/
        // cubes

    //    const cubeGeo = new THREE.BoxGeometry( 50, 50, 50 );
     //   const cubeMaterial = new THREE.MeshLambertMaterial( { color: 0xfeb74c, map: new THREE.TextureLoader().load( 'textures/square-outline-textured.png' ) } );

        // grid

        const gridHelper = new THREE.GridHelper( 2000, 40 );
//        this.scene.add( gridHelper );

        //

        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();

        const geometry = new THREE.BoxGeometry( 2000,30, 2000 );


        this.plane = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color:0xFFE99E } ) );
        this.plane.position.y= -16;

        var geo = new THREE.EdgesGeometry( this.plane.geometry );
        var mat = new THREE.LineBasicMaterial( { color: 0x111111, linewidth: 1, opacity: 1 } );
        var wireframe = new THREE.LineSegments( geo, mat );
        wireframe.renderOrder = 1; // make sure wireframes are rendered 2nd
        this.plane.add( wireframe );

        this.scene.add( this.plane );

        this.objects.push( this.plane );

        // lights

        const ambientLight = new THREE.AmbientLight( 0x606060 );
        this.scene.add( ambientLight );

        const directionalLight = new THREE.DirectionalLight( 0xffffff );
        directionalLight.position.set( 1, 0.75, 0.5 ).normalize();
        this.scene.add( directionalLight );

//        controls.touches = { TWO: THREE.TOUCH.ROTATE, ONE: THREE.TOUCH.DOLLY_PAN };
        this.addBuildings()

     //   console.log('on context create')
	};

    addBuildings = ()=>{
    	const city = mainStore.data.cities[this.props.city]

        city.buildingArray.forEach(building=>{
            this.addBuilding(building)
        })
    }

    addBuilding = (building,onBuild)=>{

        const props = building.props?building.props:{x:0,y:0}
        const size = building.size

        if(size == undefined) return

        const width = 50*size.width
        const length =  50*size.length
        const rollOverGeo = new THREE.BoxGeometry( width, 30, length );
        const rollOverMaterial = new THREE.MeshBasicMaterial( { color:building.color, opacity: onBuild==true?0.5:1, transparent: true } );
        const rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );


        rollOverMesh.position.x =  (50*props.x-size.width%2*25);
        rollOverMesh.position.z =  (50*props.y-size.length%2*25);
        rollOverMesh.position.y = 15;

//        rollOverMesh.position.y = -50;

        var geo = new THREE.EdgesGeometry( rollOverMesh.geometry );
        var mat = new THREE.LineBasicMaterial( { color: 0x111111, linewidth: 1, opacity: onBuild==true?0.5:1 } );
        var wireframe = new THREE.LineSegments( geo, mat );
        wireframe.renderOrder = 1; // make sure wireframes are rendered 2nd
        rollOverMesh.add( wireframe );


        this.scene.add( rollOverMesh );

        this.objects.push(rollOverMesh)
        this.objectMap[rollOverMesh.id] = building

        building.object = rollOverMesh

        if(onBuild==true){
        }else{
            const label = new Label(building,'building');
            label.setParent(rollOverMesh)
            label.added = true


            this.state.textlabels.push(label)
        }
    }

    addRollover = (building)=>{
        this.addBuilding(building,true)
    }

	onResize = ({ width, height, scale }) => {
	    if(this.camera == undefined) return

		this.camera.aspect = width / height;
	    this.camera.updateProjectionMatrix();
	    this.renderer.setPixelRatio(scale);
	    this.renderer.setSize(width, height);
  	};

  	onRender = delta => {

  	  //  let changed = this.cameraHandler.render();

     //   const ret = this.objects.render(this.cameraHandler.touch,this.camera,this.width,this.height );

      // this.setState({textlabels:ret.textlabels,detail:ret.detail})
      this.state.textlabels.forEach(label=>{
        label.updatePosition(true,this.state.camera,this.width,this.height);
      })



        if(this.detailHtml.added){
			 this.detailHtml.updatePosition(true,this.state.camera,this.width,this.height);

		}
		 this.setState({detail:this.detailHtml})
	  //  if(changed ||  this.rendered!=true){
	       // console.log("render")
            this.renderer.render(this.scene, this.state.camera);
            this.rendered = true
	  //  }
  	};
  
	 
	 zoom = (delta) =>{		 
		 //this.cameraHandler.zoom(delta);
	//	 console.log(this.controls)
		 const controls = this.controls.current
		 controls.zoom(delta)
	 }
	 
	 moveCameraTo = (lat,long,distance)=>{
     		this.cameraHandler.moveCameraTo(lat,long,distance);
      }

    remove = (unit)=>{
        this.rendered = false
        const array = this.state.textlabels;
        for (var i = array.length - 1; i > -1; i--) {
            if(array[i].city == unit){
                 array.splice(i, 1);
            }
        }
        this.objects.remove(unit.object)
    }

     onLayout = (event)=>{
         var {x, y, width, height} = event.nativeEvent.layout;
         this.width = width
         this.height = height

        if(mainStore.stage=='build'){
            this.addRollover(mainStore.onBuild)
        }
//         console.log('onlayout')
     }

    cancelBuild = ()=>{
        mainStore.setStage('game');
        mainStore.resume();

        const object = mainStore.onBuild.object
        if(object){
            this.scene.remove(object)

            Util.arrayRemove(this.objects,object)

            mainStore.onBuild.object = undefined
        }
    }


    build = ()=>{



        if(this.checkOccupation()) return


        const onBuild = mainStore.onBuild

        const props = this.getPosition()

         const city = mainStore.selectedCity;

        const building = city.build(mainStore.buildingUnit,onBuild,props);

        this.addBuilding(building)

        this.cancelBuild()

    }

    getPosition = ()=>{
        const onBuild = mainStore.onBuild
        const position = onBuild.object.position
        const size = onBuild.size
        const x = (position.x + size.width%2*25) /50
        const y = (position.z + size.length%2*25) /50

        console.log(x+","+y)

        return {x,y}

    }

    checkOccupation = ()=>{

        const onBuild = mainStore.onBuild

        const props = this.getPosition()

         const city = mainStore.selectedCity;

        return city.isOccupied(onBuild,props)
    }

	render(){
		const self = this;
		const detail = this.state.detail;

        const city = this.props.city;

     //   console.log("render")

	    return(
	        <>
                <View  style={{ flex: 1 ,overflow:'hidden'}}  onLayout={ this.onLayout}>
                     <OrbitControls
                        style={{flex: 1}}
                        camera={this.state.camera}
                        ref={this.controls}
                        onPanResponderGrant={this.handlePanResponderGrant}>

                        <ExpoGraphics.View
                            style={{ flex: 1 }}
                            onContextCreate={this.onContextCreate}
                            onRender={this.onRender}
                            onResize={this.onResize}
                            arEnabled={false}
                            ref={(container) => { this.container = container }}	>
                        </ExpoGraphics.View>
                    </OrbitControls>
                    {
                        this.state.textlabels.map((label,i)=>{
                            if(!label.added) return null;

                            const style = {top:label.top,left:label.left-15,marginTop:-25};
                            if(label.type=='unit'){
                                style.marginTop=5;
                                if(label.city.currentLocation.labelPosition!='top'){
                                    style.marginTop=-28;
                                }

                                //style.marginLeft='-10%';
                            }

                            const icons = [];
                            if(label.city.state=='fighting'){
                                icons.push("sword-cross")
                            }
                            if(label.city.moral<=0){
                                icons.push("heart")
                            }


                            return 	<View key={i}
                                style={[styles.textLabel,style]}
                               >
                                    {label.type=='unit'?<>
                                        <View  style={{flexDirection:'row'}}>
                                        {
                                            icons.map((icon,index)=>{
                                                return  <View key={index} style={[{padding:0}]}>
                                                   <Button icon={icon} color="#fc8b8b" style={[styles.text,{paddingRight:0,marginTop:2,marginLeft:-22-(index*14),minWidth:24,width:24,height:22}]} contentStyle={{marginLeft:6,marginRight:-10}}/>
                                                </View>
                                            })
                                        }
                                         <View style={[{backgroundColor:label.textColor,padding:0,flexDirection:'row'}]}>
                                             <Button icon={label.city.getIcon()} color="white" style={[styles.text,{marginTop:2,minWidth:28,width:28,height:28}]} contentStyle={{marginLeft:6,marginRight:-10}}/>
                                             {label.city.getMilitaryUnits('armed')>0?<Text  style={[styles.text,{paddingLeft:0,margin:'auto'}]}>{Math.floor(label.city.getMilitaryUnits('armed'))}</Text>:null}
                                          </View>
                                         </View>
                                     </>
                                    : <View style={[{padding:0}]}>
                                         <Button icon={label.city.icon} color="white" style={[styles.text,{marginTop:2,minWidth:28,width:28,height:28,opacity:label.city.state=='deploy'?0.5:1}]} contentStyle={{marginLeft:6,marginRight:-10}}
                                          onPress={()=>this.detail(label)}/>
                                     </View>
                                    }

                            </View >
                        })
                    }
                    {detail.added?
                    <Detail detail={detail}  scene={this} interface={this.props.interface} navigation={this.props.navigation}/>
                    :null
                    }
                </View>
                <Top menu={false} cancelBuild={this.cancelBuild} build={this.build}/>
                <Side zoom={this.zoom}  navigation={this.props.navigation} city={city} />

	    	</>
	    )
	  }
}