import React, { Component } from 'react';
import {  View,StyleSheet ,ScrollView } from 'react-native';
import { Button ,Dialog,Modal,Portal ,Paragraph,List,IconButton } from 'react-native-paper';


const styles = StyleSheet.create({

	title:{
		fontSize:15,
	},
	electionTitle:{
		fontSize:15,
		padding:0,
		margin:0,
		position:'relative',
		left: -7
	},
	accordion:{
		margin:0,
		padding:0
	},
	election:{
		margin:0,
		paddingTop:4,
		paddingBottom:4,
	},
	sub:{
		marginLeft:15
	},
	subTitle:{
		fontSize:13,
		padding:0,
		margin:0,
		position:'relative',
		left:-5
	},
	subIcon:{
		width:15,
		height:15
	},
});




export default class Scenario extends Component {

	
	select = (scenario) =>{
		const { onSelect } = this.props.route.params;

		onSelect(scenario);

		this.props.navigation.navigate('Home')
	}
	
	render(){
		
		const { era } = this.props.route.params;
		return <ScrollView contentContainerStyle={{ paddingHorizontal: 24 }}>
	        <List.Section>
	        {
	        	Object.keys(era).map((key,i)=>{
	        		
	        		const e = era[key];
	        		return <List.Accordion
			          title={key.toUpperCase()}
	        			titleStyle={styles.title}
				          left={props => <List.Icon {...props} icon="book-variant" />}
				          	key={i}
				          style={styles.accordion}
				        >
				    {
				    	e.map((scenario,j) =>{					    		
				    		return <List.Item title={scenario.name} key={j} left={props => <IconButton {...props} icon="map" size={20}/>} 
				    			style={styles.sub} titleStyle={styles.subTitle} onPress={()=>this.select(scenario)}/>
				    	})					
				    }
				    </List.Accordion>
	        	})
	        }
	        </List.Section>
	     </ScrollView>
	}
	
}