import React, { Component } from 'react';

import { Animated } from 'react-native';
import { PanGestureHandler, RotationGestureHandler,State } from 'react-native-gesture-handler';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import DataService from './DataService.js';
import Interface from './Interface.js';
import Scenario from './Scenario.js';




const Stack = createStackNavigator();


export default class Main extends Component{

	constructor(){
		super();
		this.scene = React.createRef();
	
		    
	}
	
	componentDidMount(){
		
		
	}
	
	
	
	render(){
		return <PaperProvider>
  			<NavigationContainer>
		  		<Stack.Navigator initialRouteName="Home">
		  		    <Stack.Screen name="Home" component={Interface} options={{ headerStyle: {height: 0},title:''}} onLoad={this.onLoad}/>
		  		    <Stack.Screen name="Scenario" component={Scenario} options={{ title:'Select Scenario'}}/>
		  		 </Stack.Navigator>
			</NavigationContainer>
		</PaperProvider>
	}
	
}