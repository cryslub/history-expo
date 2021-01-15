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
		marginLeft:12
	},
	faction:{
    	marginLeft:30
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




export default class FactionList extends Component {

	
	select = (faction) =>{
		const { onSelect } = this.props.route.params;

		onSelect(faction);

		this.props.navigation.navigate('Home')
	}
	
	render(){
		
		const { region } = this.props.route.params;
		return <ScrollView contentContainerStyle={{ paddingHorizontal: 24 }}>
	        <List.Section>
	        {
	        	Object.keys(region).map((key,i)=>{
	        		
	        		const e = region[key];
	        		return <List.Accordion
			          title={key.toUpperCase()}
	        			titleStyle={styles.title}
				          left={props => <List.Icon {...props} icon="earth" />}
				          	key={i}
				          style={styles.accordion}
				        >
				    {
				        Object.keys(e).map((k,j)=>{
				            const area = e[k];
				    		return <List.Accordion
                                  title={k}
                                    titleStyle={styles.title}
                                      left={props => <List.Icon {...props} icon="map" />}
                                        key={i}
                                      style={styles.sub}
                                    >
                            {
                                area.map(faction=>{
                                    return  <List.Item title={faction.name} key={j} left={props => <IconButton {...props} icon="bookmark" size={20} color={faction.color}/>}
                                           	style={styles.faction} titleStyle={styles.subTitle} onPress={()=>this.select(faction)}/>
                                })
                            }
                            </List.Accordion>

				    	})					
				    }
				    </List.Accordion>
	        	})
	        }
	        </List.Section>
	     </ScrollView>
	}
	
}