import React, { Component } from 'react';

import { Animated } from 'react-native';
import { PanGestureHandler, RotationGestureHandler,State } from 'react-native-gesture-handler';


import ThreeScene from './ThreeScene';

import DataService from './DataService.js';

export default class Main extends Component{

	constructor(){
		super();
		this.scene = React.createRef();
	
		    
	}
	
	componentDidMount(){
		//const data = new DataService(this.scene);
		
	}
	
	render(){
		return <ThreeScene  ref={this.scene}/>
        
	}
	
}