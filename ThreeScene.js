import React, { Component } from 'react';

import ExpoTHREE, { THREE } from 'expo-three'; // 2.2.2-alpha.1
import ExpoGraphics from 'expo-graphics'; // 0.0.3

import {  View,Animated,PanResponder,TouchableHighlight  } from 'react-native';
import { PinchGestureHandler, RotationGestureHandler,State } from 'react-native-gesture-handler';


import Globe from './Globe.js';
import CameraHandler from './CameraHandler.js';
import VariableObjects from './VariableObjects.js';



export default class ThreeScene extends Component{

	
  
	componentWillMount() {
		this.panResponder = PanResponder.create({
			onStartShouldSetPanResponder: this.handleStartShouldSetPanResponder,
		    onPanResponderGrant: this.handlePanResponderGrant,
		    onPanResponderMove: this.handlePanResponderMove,
		    onPanResponderRelease: this.handlePanResponderEnd,
		    onPanResponderTerminate: this.handlePanResponderEnd,
		});
	}
	// Should we become active when the user presses down on the square?
	  handleStartShouldSetPanResponder = () => {
	    return true;
	  };

	  // We were granted responder status! Let's update the UI
	  handlePanResponderGrant = (e, gestureState) => {
		  const event = this._transformEvent({ ...e, gestureState });
//		  console.log(event)
		  this.cameraHandler.handlePanResponderGrant(event.nativeEvent)
	  };

	  // Every time the touch/mouse moves
	  handlePanResponderMove = (e, gestureState) => {
	    // Keep track of how far we've moved in total (dx and dy)
		  const event = this._transformEvent({ ...e, gestureState });
		//  console.log(event)
		  this.cameraHandler.handlePanResponderMove(event.nativeEvent)

	  };

	  // When the touch/mouse is lifted
	  handlePanResponderEnd = (e, gestureState) => {
	    
		  const event = this._transformEvent({ ...e, gestureState });
//		  console.log(event)
		    this.cameraHandler.handlePanResponderEnd(event.nativeEvent)
	  };
	  
	  _transformEvent = event => {
		    event.preventDefault = event.preventDefault || (() => {});
		    event.stopPropagation = event.stopPropagation || (() => {});
		    return event;
		  };
		  
		  
	  onZoomEvent = (e) =>{
		  const event = this._transformEvent({ ...e });
		  		 
		  this.cameraHandler.onZoomEvent(event.nativeEvent);
		//  console.log(event);
	  }

	onWindowResize = ( event ) => {
	  this.camera.aspect = window.innerWidth / window.innerHeight;
	    this.camera.updateProjectionMatrix();

	    this.renderer.setSize( window.innerWidth, window.innerHeight );
	}
  	
	componentWillUnmount(){
	//    this.stop()
	 //   this.container.removeChild(this.renderer.domElement)
	  }
	  
	start = () => {
	    if (!this.frameId) {
	      this.frameId = requestAnimationFrame(this.animate)
	    }
	  }
	  
	stop = () => {
	    cancelAnimationFrame(this.frameId)
	  }
	  
	animate = () => {
	  // this.cube.rotation.x += 0.01
	   //this.cube.rotation.y += 0.01
	   this.renderScene()
	   this.frameId = window.requestAnimationFrame(this.animate)
	 }
	 
	renderScene = () => {
		//this.zoom(this.curZoomSpeed);
		this.cameraHandler.render();
	    
	    this.objects.render(this.cameraHandler.mouse,this.camera);
	    
	    this.renderer.render(this.scene, this.camera);
	    	   
	}

	onContextCreate = async ({ gl, arSession, width, height, scale }) => {
		
		this.renderer = new ExpoTHREE.Renderer({ gl });
	    this.renderer.setPixelRatio(scale);
	    this.renderer.setSize(width, height);
	    this.renderer.setClearColor(0x000000, 1.0);
	
	    this.loaded = false;
	    
	    
	    //ADD SCENE
	    this.scene = new THREE.Scene()
	    //ADD CAMERA
	    this.camera = new THREE.PerspectiveCamera(30, width / height, 1, 10000);
	    
	    this.globe = new Globe(this.scene);
	    this.globe.init();
	    this.mesh = this.globe.mesh;
	
		this.cameraHandler = new CameraHandler(this.container,this.camera,this.mesh);
		this.objects = new VariableObjects(this.scene,this.mesh,this.globe,this.container);
	
	};

	onResize = ({ width, height, scale }) => {
		this.camera.aspect = width / height;
	    this.camera.updateProjectionMatrix();
	    this.renderer.setPixelRatio(scale);
	    this.renderer.setSize(width, height);
  	};

  	onRender = delta => {
	  this.cameraHandler.render();
	    
	  //  this.objects.render(this.cameraHandler.mouse,this.camera);	    
	    this.renderer.render(this.scene, this.camera);
  	};
  
  	onGestureEvent =event => {
	  console.log(event.nativeEvent)
	};
  
	onHandlerStateChange = event => {
		console.log(event)
	    if (event.nativeEvent.oldState === State.ACTIVE) {
	    	
	    }
	 };
	  
	render(){
	    return(
	    	
	    		<PinchGestureHandler
	    	      onGestureEvent={this.onZoomEvent}
		    		>
	    		<TouchableHighlight   style={{ flex: 1 }}
		    	onPress={() => {
		            this.backCount++
		            if (this.backCount == 2) {
		                clearTimeout(this.backTimer)
		                console.warn("Clicked twice")
		            } else {
		                this.backTimer = setTimeout(() => {
		                	this.backCount = 0
		                }, 3000)
		            }
	
		        }}>
			    	<View {...this.panResponder.panHandlers} style={{ flex: 1 }}>
				    	<ExpoGraphics.View
				              style={{ flex: 1 }}
				              onContextCreate={this.onContextCreate}
				              onRender={this.onRender}
				              onResize={this.onResize}
				              arEnabled={false}
				    			ref={(container) => { this.container = container }}
						    	
				            />
				    </View>
				   </TouchableHighlight>
				   </PinchGestureHandler>
	    )
	  }
}