import React, { Component } from 'react';

import ExpoTHREE, { THREE } from 'expo-three'; // 2.2.2-alpha.1
import ExpoGraphics from 'expo-graphics'; // 0.0.3


import {  View,Animated,PanResponder,TouchableOpacity,Text,StyleSheet  } from 'react-native';
import { PinchGestureHandler, RotationGestureHandler,State,PanGestureHandler,TapGestureHandler } from 'react-native-gesture-handler';
import { Subheading,Paragraph,Button,Caption  } from 'react-native-paper';


import Globe from './Globe.js';
import CameraHandler from './CameraHandler.js';
import VariableObjects from './VariableObjects.js';

import DataService from './DataService.js';

import Util from './Util.js';


const styles = StyleSheet.create({
	textLabel:{
		position:'absolute',
		color: "white",
		marginLeft:-50,
		 textShadowColor: 'rgba(0, 0, 0, 1)',
		  textShadowOffset: {width: -1, height: 1},
		  textShadowRadius: 1,
		
		width:100,		
		textAlign:'center',
		lineHeight:13
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
	}
});

export default class ThreeScene extends Component{

	constructor(){
		super();
		this.doubleTap = React.createRef();
		
		this.state={
			textlabels :[],
			detail:{}
		}
		
		
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
	    
	    this.objects.render(this.cameraHandler.touch,this.camera);
	    
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
		
	//	console.log(this.objects)
//		this.setState({textlabels:this.objects.textlabels})
		this.data = new DataService(this.objects);
	
	};

	onResize = ({ width, height, scale }) => {
		this.camera.aspect = width / height;
	    this.camera.updateProjectionMatrix();
	    this.renderer.setPixelRatio(scale);
	    this.renderer.setSize(width, height);
  	};

  	onRender = delta => {
	  this.cameraHandler.render();
	    
	    const ret = this.objects.render(this.cameraHandler.touch,this.camera);	    
	    
	  //  console.log(this.state.textlabels)
	    this.setState({textlabels:ret.textlabels,detail:ret.detail})
	    this.renderer.render(this.scene, this.camera);
  	};
  
  	onGestureEvent =event => {
//	  console.log(event.nativeEvent)
	};
  
	onHandlerStateChange = event => {
	//	console.log(event)
	    if (event.nativeEvent.oldState === State.ACTIVE) {
	    	
	    }
	 };
	 
	 onSingleTap = (e) =>{
		 if(e.nativeEvent.state === State.ACTIVE){
			// this.cameraHandler.onSingleTap(e.nativeEvent);
		 }
			
	 }
	 
	 onDoubleTap = (e) =>{
		 if(e.nativeEvent.state === State.ACTIVE)
			 this.cameraHandler.onDoubleTap();
	 }
	 
	 setTextLabels = (textlabels)=>{
		 this.setState({textlabels:textlabels})
	 }
	 
	render(){
		const self = this;
		const detail = this.state.detail;
		
	    return(
	    	<TapGestureHandler
	    		onHandlerStateChange={this.onSingleTap}
	    		waitFor={this.doubleTap}>
	    		<TapGestureHandler
	    			ref={this.doubleTap}
	    		    onHandlerStateChange={this.onDoubleTap}
	    		    numberOfTaps={2}>
		    		<PinchGestureHandler
		    	      onGestureEvent={this.onZoomEvent}>
				    	<View {...this.panResponder.panHandlers} style={{ flex: 1 ,overflow:'hidden'}}>
					    	<ExpoGraphics.View
					        	style={{ flex: 1 }}
					            onContextCreate={this.onContextCreate}
					            onRender={this.onRender}
					            onResize={this.onResize}
					            arEnabled={false}
					    		ref={(container) => { this.container = container }}	>					    		
					    	</ExpoGraphics.View>
					    	{
					    		this.state.textlabels.map((label,i)=>{
					    			if(!label.added) return null;
					    			return 	<Text style={[styles.textLabel, 
					    						{top:label.top,left:label.left,marginTop:label.placement==='top'?-25:10}]} key={i}>{label.name}</Text>
					    		})
					    	}
					    	{detail.added?
					    	<View style={[styles.detail,{top:detail.top,left:detail.left,backgroundColor:detail.color}]}>
					    		<Subheading style={{color:'white'}}>{detail.name}</Subheading>
					    		{detail.population>0?
					    		<>
					    			<Paragraph style={{color:'white',fontWeight: "bold"}}>{detail.factionName}</Paragraph>
					    		
						    		<View style={{flexDirection:'row'}}>
						    			<Button icon="account-multiple" color="white" style={{marginTop:2,minWidth:16,width:16,height:16}} contentStyle={{marginLeft:0,marginRight:-15}}/>
						    			<Caption  style={{color:'white',marginLeft:5}}>{Util.number(detail.population)}</Caption>
						    		</View>
					    		</>
					    		:null
					    		}
					    	</View>
					    	:null
					    	}
				    	</View>
					  </PinchGestureHandler>
				 </TapGestureHandler>
			</TapGestureHandler>
	    )
	  }
}