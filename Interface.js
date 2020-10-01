import React, { Component } from 'react';
import {  View,StyleSheet ,ScrollView } from 'react-native';


import { Button ,Dialog,Modal,Portal ,Paragraph,List,RadioButton,Subheading  } from 'react-native-paper';


import ResponsiveDrawer from './ResponsiveDrawer.js';
import ThreeScene from './ThreeScene';
import DataService from './DataService.js';

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
	}

});



export default class Interface extends Component {
	
	
	constructor(){
		super();
		 this.state = {
		      show: false,
		      era:{},
		      theme:'natural',
		      showThemeDialog:false
		    };
		
		 this.data = {era:{}};
		 
		 this.scene = React.createRef();
	}
	
	
	componentDidMount() {
        this.props.navigation.setParams({ onSlect: this.onSlect }); //initialize your function
    }
	
	handleClose = () => this.setState({show:false});
	handleShow = () => this.setState({show:true});	
	selectScenario = (scenario) => {
	   this.props.data.selectScenario(scenario);
	   this.handleClose();
	}
	
  onLoad = async (objects) =>{
	  this.data = new DataService(objects);
	  this.data.load();
  } 
  
  onSelect = (scenario) =>{
	  this.data.selectScenario(scenario)
  }
  
  zoom = (delta) =>{
	  this.scene.current.zoom(delta);
  }
  
  changeTheme = (theme) => {
	  this.setState({ theme: theme }); 
	  this.scene.current.changeTheme(theme)
  }
  
  render() {
    return  <>
	    
	    
    	<ThreeScene  ref={this.scene} onLoad={this.onLoad} />
        <View style={styles.box}>
			<Button mode="outlined"  onPress={()=>this.props.navigation.navigate('Scenario', {era: this.data.era,onSelect:this.onSelect})} 
				compact={true} color="white" style={{borderColor:'white',marginRight:3}} labelStyle={{fontSize:9}}> 
		 		Scenario
		 	</Button>
			<Button mode="outlined"  onPress={() => { this.setState({ showThemeDialog: true }) }} 
				compact={true} color="white" style={{borderColor:'white'}} labelStyle={{fontSize:9}}> 
		 		Theme
		 	</Button>

		 </View>	
		
		<View style={styles.right}>
			<Button mode="outlined"  onPress={()=>this.zoom(100)} 
				compact={true} color="white" style={{borderColor:'white',marginBottom:3}} labelStyle={{fontSize:9}}> 
		 		++
		 	</Button>

	 		<Button mode="outlined"  onPress={()=>this.zoom(20)} 
				compact={true} color="white" style={{borderColor:'white',marginBottom:3}} labelStyle={{fontSize:9}}> 
		 		+
		 	</Button>
			<Button mode="outlined"  onPress={()=>this.zoom(-20)} 
				compact={true} color="white" style={{borderColor:'white',marginBottom:3}} labelStyle={{fontSize:9}}> 
		 		-
		 	</Button>
		 	<Button mode="outlined"  onPress={()=>this.zoom(-100)} 
				compact={true} color="white" style={{borderColor:'white'}} labelStyle={{fontSize:9}}> 
		 		--
		 	</Button>
		</View>	
		
		<Portal>
	        <Dialog
	           visible={this.state.showThemeDialog}
	           onDismiss={() => this.setState({ showThemeDialog: false })}>
	          <Dialog.Title>Themes</Dialog.Title>
	          <Dialog.Content>
	          	<View style={{flexDirection:'row',justifyContent:'space-between'}}>
	          		<Subheading >Natural</Subheading >
	          		<RadioButton
			          value="natural"
			          status={this.state.theme === 'natural' ? 'checked' : 'unchecked'}
			          onPress={() => { this.changeTheme('natural') }}
			        />
		        </View>
	          	<View style={{flexDirection:'row',justifyContent:'space-between'}}>
	          		<Subheading >Simple</Subheading >

	          		<RadioButton
			          value="simple"
			          status={this.state.theme === 'simple' ? 'checked' : 'unchecked'}
			          onPress={() => { this.changeTheme( 'simple' ) }}
			        />
		         </View>
	          </Dialog.Content>
	          <Dialog.Actions>
	            <Button onPress={() => this.setState({ showThemeDialog: false })}>Done</Button>
	          </Dialog.Actions>
	        </Dialog>
	      </Portal>
      
	</>

   
  }
}