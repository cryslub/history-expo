import React, { Component } from 'react';

import ExpoTHREE, { THREE } from 'expo-three'; // 2.2.2-alpha.1
import ExpoGraphics from 'expo-graphics'; // 0.0.3
import OrbitControls from './OrbitControlsView.js'

import {  View,Animated,PanResponder,TouchableOpacity,Text,StyleSheet  } from 'react-native';
import PinchZoomResponder from 'react-native-pinch-zoom-responder'
import { PinchGestureHandler, RotationGestureHandler,State,PanGestureHandler,TapGestureHandler } from 'react-native-gesture-handler';
import { Subheading,Paragraph,Button,Caption  } from 'react-native-paper';


import Globe from './Globe.js';
import CameraHandler from './CameraHandler.js';
import VariableObjects from './VariableObjects.js';
import Detail from './Detail.js';
import Icon from './Icon.js';


import mainStore from './MainContext.js'

import Util from './Util.js';


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
	}
});

export default class CityScene extends Component{

	constructor(){
		super();
		this.doubleTap = React.createRef();
		this.controls = React.createRef();

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


	detail = (label)=>{
	    let multiSelected = false;
	    if(label.city.sort=='unit'){
	        const nearByUnits = label.city.nearByUnits


	        if(nearByUnits.length>0){
	            multiSelected = true
                const list = nearByUnits.concat([label.city])
                mainStore.setSelectionList( list)

                this.props.interface.openSelectDialog()
	        }
	    }

	    if(!multiSelected)
    		this.objects.detail(label.city)
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

		  this.cameraHandler.handlePanResponderGrant(event.nativeEvent)
		  this.objects.onMouseover(this.cameraHandler.touch,this.camera);

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
	    camera.position.set( 1000, 1000, 1000 );
		camera.lookAt( 0, 0, 0 );
		this.setState({camera:camera})

		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color( 0xf0f0f0 );

        // roll-over helpers

        const rollOverGeo = new THREE.BoxGeometry( 50, 50, 50 );
        const rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 1, transparent: true } );
        const rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );

        var geo = new THREE.EdgesGeometry( rollOverMesh.geometry );
        var mat = new THREE.LineBasicMaterial( { color: 0x111111, linewidth: 1 } );
        var wireframe = new THREE.LineSegments( geo, mat );
        wireframe.renderOrder = 1; // make sure wireframes are rendered 2nd
        rollOverMesh.add( wireframe );


        this.scene.add( rollOverMesh );

        // cubes

    //    const cubeGeo = new THREE.BoxGeometry( 50, 50, 50 );
     //   const cubeMaterial = new THREE.MeshLambertMaterial( { color: 0xfeb74c, map: new THREE.TextureLoader().load( 'textures/square-outline-textured.png' ) } );

        // grid

        const gridHelper = new THREE.GridHelper( 1000, 20 );
        this.scene.add( gridHelper );

        //

        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();

        const geometry = new THREE.PlaneGeometry( 1000, 1000 );
        geometry.rotateX( - Math.PI / 2 );

        const plane = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { visible: false } ) );
        this.scene.add( plane );

        //objects.push( plane );

        // lights

        const ambientLight = new THREE.AmbientLight( 0x606060 );
        this.scene.add( ambientLight );

        const directionalLight = new THREE.DirectionalLight( 0xffffff );
        directionalLight.position.set( 1, 0.75, 0.5 ).normalize();
        this.scene.add( directionalLight );

//        controls.touches = { TWO: THREE.TOUCH.ROTATE, ONE: THREE.TOUCH.DOLLY_PAN };
	};

	onResize = ({ width, height, scale }) => {
		this.camera.aspect = width / height;
	    this.camera.updateProjectionMatrix();
	    this.renderer.setPixelRatio(scale);
	    this.renderer.setSize(width, height);
  	};

  	onRender = delta => {

  	  //  let changed = this.cameraHandler.render();

     //   const ret = this.objects.render(this.cameraHandler.touch,this.camera,this.width,this.height );

       // this.setState({textlabels:ret.textlabels,detail:ret.detail})

	  //  if(changed ||  this.rendered!=true){
	       // console.log("render")
            this.renderer.render(this.scene, this.state.camera);
            this.rendered = true
	  //  }
  	};
  
	 
	 zoom = (delta) =>{		 
		 this.cameraHandler.zoom(delta);
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
     }

	render(){
		const self = this;
		const detail = this.state.detail;
		
	    return(
	    	<View style={{ flex: 1 ,overflow:'hidden'}}  onLayout={ this.onLayout}>
	    	     <OrbitControls
                    style={{flex: 1}}
                    camera={this.state.camera}
                    ref={this.controls}>
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

		    			const style = {top:label.top,left:label.left,marginTop:label.placement==='top'?-25:0};
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
                        if(label.city.resources.food==undefined||label.city.resources.food<=0){
                            icons.push("barley")
                        }


		    			return 	<TouchableOpacity key={i}
		    				style={[styles.textLabel,style]}
		    				onPress={()=>this.detail(label)}>
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
		    				    : <View style={[{backgroundColor:label.textColor,padding:0}]}>
		    				        <Text  style={styles.text}>{label.name}</Text>
		    				     </View>
		    					}

		    			</TouchableOpacity >
		    		})
		    	}
		    	{detail.added?
		    	<Detail detail={detail}  scene={this} interface={this.props.interface}/>
		    	:null
		    	}
	    	</View>
	    )
	  }
}