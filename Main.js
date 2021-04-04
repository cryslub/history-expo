import React, { Component } from 'react';

import { View ,Text} from 'react-native';
import { PanGestureHandler, RotationGestureHandler,State } from 'react-native-gesture-handler';
import { DefaultTheme, Provider as PaperProvider,Title,Caption,Paragraph,Headline } from 'react-native-paper';
import { NavigationContainer} from '@react-navigation/native';
import { createStackNavigator,HeaderBackButton } from '@react-navigation/stack';
import DataService from './DataService.js';
import {Interface} from './Interface.js';
import Scenario from './Scenario.js';
import FactionList from './FactionList.js';
import {Deployed} from './Deployed.js';

import {Manage} from './Manage.js';
import {Info} from './Info.js';
import {HeroInfo} from './HeroInfo.js';
import {HeroList} from './HeroList.js';
import {SelectChancellor} from './SelectChancellor.js';

import {Employ} from './Employ.js';
import Build from './Build.js';
import Assign from './Assign.js';
import Equip from './Equip.js';
import {ChangeEquip} from './ChangeEquip.js';
import Exchange from './Exchange.js';

import {Trade} from './Trade.js';
import {Group} from './Group.js';
import {SelectUnit} from './SelectUnit.js';


import {Building} from './Building.js';



import cityStore from './CityContext.js';
import { Provider } from 'mobx-react';
import mainStore from './MainContext.js';

const Stack = createStackNavigator();

const theme = {
  ...DefaultTheme,
  dark :true,
  colors: {
    ...DefaultTheme.colors,
    primary: '#3498db',
    accent: '#f1c40f',
    background : '#363b3d',
    surface :'rgba(65, 78, 82,0.75)',
    card :"#212526",
    text :'#ffffff',
    border :'#575757'
  }
}

export default class Main extends Component{

	constructor(){
		super();
		this.scene = React.createRef();

	     this.state = {
              selectedCity:{}
         };
		    
	}
	
	componentDidMount(){
		
		
	}
	
	
	
	render(){
		return  <PaperProvider  theme={theme}>
                <NavigationContainer theme={theme}>
                    <Stack.Navigator initialRouteName="Home">
                        <Stack.Screen name="Home" component={Interface} options={{ headerStyle: {height: 0},title:''}} onLoad={this.onLoad}/>
                        <Stack.Screen name="Scenario" component={Scenario} options={{ title:'Select Scenario'}}/>
                        <Stack.Screen name="FactionList" component={FactionList} options={{ title:'Select Faction'}}/>
                        <Stack.Screen name="Deployed" component={Deployed} options={{ title:'Deployed Units'}}/>

                        <Stack.Screen name="Manage" component={Manage}
                                options={({ route }) => ({
                                    headerTitle: props =>
                                        <View style={{flexDirection:'row'}}>
                                            <Paragraph style={{position:'relative',top:5,fontSize:18}}> {mainStore.data.cities[route.params.city].name} </Paragraph>
                                            <Title style={{fontSize:route.params.city.snapshotSub?.fontSize}}> {mainStore.data.cities[route.params.city].originalName}</Title>
                                        </View>}
                                )}
                         />
                        <Stack.Screen name="Info" component={Info}
                                options={({ route }) => ({
                                    headerTitle: props =>
                                        <View style={{flexDirection:'row'}}>
                                            <Paragraph style={{fontSize:18}}> {route.params.city.name} </Paragraph>
                                            <Caption style={{position: 'relative',top: 2}}> {route.params.city.originalName}</Caption>
                                        </View>}
                                )}
                        />
                         <Stack.Screen name="HeroInfo" component={HeroInfo}
                                options={({ route }) => ({
                                    headerTitle: props =>
                                        <View style={{flexDirection:'row'}}>
                                            <Paragraph style={{position:'relative',top:5,fontSize:18}}> {route.params.hero.name} </Paragraph>
                                            <Title > {route.params.hero.originalName}</Title>
                                        </View>}
                                )}
                         />
                         <Stack.Screen name="HeroList" component={HeroList} options={({ route }) => ({ title: "Select Governor" })}/>
                         <Stack.Screen name="SelectChancellor" component={SelectChancellor} options={({ route }) => ({ title: "Select Chancellor" })}/>

                        <Stack.Screen name="Employ" component={Employ} options={{ title:'Add Unit'}}/>
                        <Stack.Screen name="Build" component={Build} options={{ title:'Build'}}/>
                        <Stack.Screen name="Assign" component={Assign} options={{ title:'Assign'}}/>
                        <Stack.Screen name="Equip" component={Equip}
                            options={({ navigation, route }) => ({
                                 title:'Inventory',
                                headerLeft: (props) => (
                                    <HeaderBackButton
                                      {...props}
                                      onPress={() => {
                                        mainStore.resume();
                                        navigation.goBack()
                                      }}
                                    />
                                  )})
                            }  />
                        <Stack.Screen name="ChangeEquip" component={ChangeEquip} options={{ title:'Change Equipment'}}/>
                        <Stack.Screen name="Exchange" component={Exchange} options={{ title:'Exchange'}}/>
                        <Stack.Screen name="BuildingDetail" component={Building}
                            options={({ route }) => ({
                                headerTitle: props =>
                                    <View style={{flexDirection:'row'}}>
                                        <Paragraph style={{position:'relative',top:5,fontSize:18}}> {route.params.building.name} </Paragraph>
                                        <Title style={{fontSize:route.params.building.fontSize}}> {route.params.building.originalName}</Title>
                                    </View>}
                            )}
                        />
                        <Stack.Screen name="Trade" component={Trade}
                                options={({ navigation, route }) => ({
                                     title:'Trade',
                                    headerLeft: (props) => (
                                        <HeaderBackButton
                                          {...props}
                                          onPress={() => {
                                            mainStore.resume();
                                            navigation.goBack()
                                          }}
                                        />
                                      )})
                                }
                        />
                        <Stack.Screen name="Group" component={Group}
                            options={({ navigation, route }) => ({
                                 title:'Group',
                                headerLeft: (props) => (
                                    <HeaderBackButton
                                      {...props}
                                      onPress={() => {
                                        mainStore.resume();
                                        navigation.goBack()
                                      }}
                                    />
                                  )})
                            }
                        />
                        <Stack.Screen name="SelectUnit" component={SelectUnit} options={{ title:'Select Unit'}} />

                     </Stack.Navigator>
                </NavigationContainer>
            </PaperProvider>
	}
	
}