import React from 'react';
import PropTypes from 'prop-types';

import { Text, View,StyleSheet,ScrollView } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { ToggleButton,Divider,List,IconButton,Colors,Button  } from 'react-native-paper';


const Drawer = createDrawerNavigator();

const drawerWidth = 300;


const styles = StyleSheet.create({
	topView: {
		justifyContent : 'center',
		alignItems : 'center',
		flexDirection:'row'

	},
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
	footer:{
		flexDirection:'row',
		backgroundColor:'black',
		height:'100%'
	},
	footerText:{
		color:'white',
		width:230,
		marginTop:10,
		marginBottom:10

	},
	box:{
		position: 'absolute',
		left: 0,
	   	bottom: 0,
	   	backgroundColor: 'rgba(0,0,0,0.2)',
	   	padding: 5
	},
	button:{
		fontSize:9
	}
});



function ResponsiveDrawer(props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [open, setOpen] = React.useState([])
  

  
  
  const handleDrawerToggle = (open) => {
    setMobileOpen(open);
  };
  
  const selectState = (election,state)=>{
	  props.selectState(election,state)
	  handleDrawerToggle(false);
  }
  const handleClick = (election,i)=>{
	  if(election.states.length>1){
		  open[i] = !open[i]
		  
		  setOpen(open=>[...open]);
		  
		  
	  }else{
		  
		  props.selectState(election,election.states[0])
		  handleDrawerToggle(false);
//		  props.selectElection(election);
		  
	  }
  }
  

	

  function DrawerContent({navigation}) {
	  return <>
	  		<View style={styles.topView} >
			  	<View>
				  	<Button compact={true} labelStyle={styles.button}>Ancient</Button>
				  	<Button compact={true} labelStyle={styles.button}>Classical</Button>
			  	</View>
			  	<View>
				  	<Button compact={true} labelStyle={styles.button}>Medieval</Button>
				  	<Button compact={true} labelStyle={styles.button}>Renaissance</Button>
			  	</View>
		    </View>
	        <Divider/>
	        <ScrollView>
		        <List.Section>
		        {
		        	Object.keys(props.era).map((key,i)=>{
		        		return <List.Accordion
				          title={key}
		        			titleStyle={styles.title}
					          left={props => <List.Icon {...props} icon="book-variant" />}
					          	key={i}
					          style={styles.accordion}
					        >
					    </List.Accordion>
		        	})
		        }
		        </List.Section>
	        </ScrollView>
	    </>
	}

	function HomeScreen({navigation}) {
		
	  return <>
	    {props.children}
	    <View style={styles.box}>
			<Button mode="outlined" onPress={()=>navigation.toggleDrawer()} compact={true} color="white" style={{borderColor:'white'}} labelStyle={{fontSize:9}}> 
		 		Scenario
		 	</Button>
		</View>		    

	  </>
	}
	
	
  
  const container = window !== undefined ? () => window().document.body : undefined;

  return (
  
  	<Drawer.Navigator drawerContent={() => <DrawerContent />}>
      <Drawer.Screen name="Home" component={HomeScreen} />
    </Drawer.Navigator>
   
     
  );
}

ResponsiveDrawer.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func,
};

export default ResponsiveDrawer;