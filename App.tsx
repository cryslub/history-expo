import ExpoGraphics from 'expo-graphics'; // 0.0.3
import ExpoTHREE, { THREE } from 'expo-three'; // 2.2.2-alpha.1
import React from 'react';
import { View, TextInput, KeyboardAvoidingView ,Text} from 'react-native';
import 'three';


import Main from './Main';

import TextMesh from './TextMesh';

export default class App extends React.Component {

	constructor(){
		super();
		this.scene = React.createRef();
	}
	
	
  render() {
    return ( 
    	<Main  ref={this.scene}/>       
    );
  }

}

