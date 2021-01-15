import React from 'react';
import { observer} from "mobx-react"
import {  View,StyleSheet ,ScrollView,Text,TouchableOpacity,Dimensions   } from 'react-native';
import { Button ,Dialog,Modal,Portal ,Paragraph,List,IconButton,Caption,Subheading,Title,Divider ,Surface,Menu,ProgressBar,ToggleButton  } from 'react-native-paper';
import { FlatGrid } from 'react-native-super-grid';


import Util from './Util.js';
import Icon from './Icon.js';
import Resource from './Resource.js';

import mainStore from './MainContext.js';

import resources from './json/resource.json';


const Unit = (props) =>{

    const unit = props.unit;

    return <Surface style={{marginBottom:4}}>
           <View style={{flexDirection:'row',justifyContent:'space-between'}} key={props.index}>
               <View style={{flexDirection:'row',height:40,display:'flex',justifyContent:'center'}}>
                   <Icon  icon={unit.icon} contentStyle={{position:'relative',top:8,marginLeft:20,height:40}}/>
                   <Text style={{position:'relative',top:11}}>{unit.name}</Text>
               </View>
               <View style={{flexDirection:'row'}}>
                    <Button  style={{minWidth:40,width:40,marginRight:2,paddingTop:3}} icon="account-minus" color="grey" onPress={()=>props.unassign(unit)}/>
                    <Button  style={{minWidth:40,width:40,marginRight:2,paddingTop:3}} icon="account-remove" color="grey" onPress={()=>props.disband(unit)}/>

               </View>

           </View>
       </Surface>
}

export  const  Building =  (observer((props) => {

    const {city, building } = props.route.params;

    const production = building.getProduction();
    const storage = building.data.storage;

    const action = (unit,onAction)=>{

        return <>
            <>
                <Menu.Item onPress={() => {}} title="Unassign"/>
                <Menu.Item onPress={() =>disband(unit)} title="Disband"/>
            </>
        </>
    }

    const dismiss = (unit)=>{
        building.removeUnit(unit)
        if(building.type=='trade'){
            if(building.units.length<city.trade.length){
               city.trade.pop();
               city.refreshTrade();
            }
        }
    }

    const unassign = (unit)=>{
        dismiss(unit)
        city.units.push(unit);
    }

    const disband = (unit)=>{
        dismiss(unit)
        city.manpower+=unit.data.manpower;
    }

    const select = (value)=>{
        if(building.data.production[value]!=undefined){
            building.setSelectedProduction(value);
            building.initProgress();
        }
    }

    const delay = production?.delay;

    return <ScrollView style={{padding:10,paddingBottom:30}}>
        <Caption>{building.data.description}</Caption>
        {storage?<>
            {storage.type=='resource'?
             <Paragraph>Resource storage capacity {Util.number(storage.quantity*building.completedQuantity)} </Paragraph>
             :<View style={{flexDirection:'row'}}>
                <Paragraph>Can hold {storage.type}</Paragraph>
                <Resource icon={resources[storage.type].icon} />
                <Paragraph>{Util.number(storage.quantity*building.completedQuantity)}</Paragraph>
             </View>
             }
        </>:null
        }
        {production?<>

           {Array.isArray(building.data.production)?
               <ToggleButton.Row onValueChange={value => select(value)} value={building.selectedProduction} >
                  {
                    building.data.production.map((p,index)=>{
                        return   <ToggleButton icon={resources[p.result].icon} value={index} disabled={building.state=='deploy'}/>
                    })
                  }
               </ToggleButton.Row>
           :null}

           {production.cost?<>
               <Paragraph>Production consumes</Paragraph>
               {
                   production.cost.map((cost,index)=>{
                       return <View style={{flexDirection:'row'}}>
                       {cost.optional==true&&index!=0?<Paragraph>or </Paragraph>:null}
                        <Paragraph>{cost.type}  </Paragraph>
                        <Resource icon={resources[cost.type].icon} />
                        <Paragraph>{Util.number(cost.quantity)}</Paragraph>
                      </View>
                   })
               }
           </>:null
           }
           <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            <Paragraph style={{marginRight:5}}>Working Progress</Paragraph>
            <Caption >{Math.floor(building.remain)} days to complete</Caption>
          </View>
          <ProgressBar progress={(building.delay-building.remain)/building.delay}  />
           <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            <Paragraph style={{marginRight:5}}>Dedicated efforts</Paragraph>
            <Caption >{building.effort}/{building.getMaxEffort()}</Caption>
          </View>
          <ProgressBar progress={building.effort/building.getMaxEffort()}  />
           {production.result=='happiness'?
            <View style={{flexDirection:'row'}}>
                <Paragraph>Increase happiness </Paragraph>
                <Resource icon={resources[production.result].icon}/>
                <Paragraph>{((production.quantity*building.completedQuantity)/(city.population/1000)).toFixed(3)}/{production.delay} days</Paragraph>
            </View>
           :<View style={{flexDirection:'row'}}>
                 <Paragraph>{production.result} </Paragraph>
                 <Resource icon={resources[production.result].icon}/>
                 <Paragraph>{Util.number(production.quantity*building.completedQuantity)}  will be produced with max effort</Paragraph>
            </View>
            }
         </>
        :null}
        {building.state!='deploy'&&(building.type=='production'||building.type=='trade')?<>
            <Divider/>
          {building.units.length>0?<Caption>Assigned Units
            {building.units.length}/{building.quantity}
           </Caption>:null}
            {
                building.units.map((unit,index)=>{
                    return <Unit unit={unit} index={index} disband={disband} unassign={unassign}/>
                })
            }
           </>:null}

        <View style={{height:20}}>
        </View>
    </ScrollView>
}));