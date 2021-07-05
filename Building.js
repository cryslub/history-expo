import React from 'react';
import { observer} from "mobx-react"
import {  View,StyleSheet ,ScrollView,Text,TouchableOpacity,Dimensions   } from 'react-native';
import { Button ,Dialog,Modal,Portal ,Paragraph,List,IconButton,Caption,Subheading,Title,Divider ,Surface,Menu,ProgressBar,ToggleButton  } from 'react-native-paper';
import { FlatGrid } from 'react-native-super-grid';


import Util from './Util.js';
import Icon from './Icon.js';
import ResourceIcon from './ResourceIcon.js';
import ResourceRow from './ResourceRow.js';


import mainStore from './MainContext.js';
import Hero from './Hero.js';

import i18n from 'i18n-js';

const Unit = (props) =>{

    const unit = props.unit;

    return <Surface style={{marginBottom:4}}>
           <View style={{flexDirection:'row',justifyContent:'space-between'}} key={props.index}>
               <View style={{flexDirection:'row',height:40,display:'flex',justifyContent:'center'}}>
                   <Icon  icon={unit.icon} contentStyle={{position:'relative',top:8,marginLeft:20,height:40}}/>
                   <Paragraph style={{position:'relative',top:11}}>{unit.name}</Paragraph>
               </View>
               <View style={{flexDirection:'row'}}>
                    <Button  style={{minWidth:40,width:40,marginRight:2,paddingTop:3}} icon="hammer" color="grey" onPress={()=>props.equip(unit)}/>
                    {unit.mission=='building'?null:
                    <>
                        <Button  style={{minWidth:40,width:40,marginRight:2,paddingTop:3}} icon="account-minus" color="grey" onPress={()=>props.unassign(unit)}/>
                        <Button  style={{minWidth:40,width:40,marginRight:2,paddingTop:3}} icon="account-remove" color="grey" onPress={()=>props.disband(unit)}/>
                    </>
                    }
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

    const equip = (unit)=>{
         mainStore.pause();
        mainStore.selectedUnit = unit
         props.navigation.navigate('Equip');
    }

    const select = (value)=>{
        if(building.data.production[value]!=undefined){
            building.setSelectedProduction(value);
            building.initProgress();
        }
    }

    const delay = production?.delay;


    const removeHero = ()=>{
       // city.addHero(building.hero);

        building.removeHero()
    }

    const getMaxAssigned = ()=>{
        let ret =  building.quantity

        if(building.data.build!=undefined && building.state=='deploy'){
            ret += building.data.build?.worker
        }

        return ret
    }

    return <ScrollView style={{padding:10,paddingBottom:30}}>
        <Caption>{building.data.description}</Caption>
        {building.hero!=undefined?<>
            <Caption>{i18n.t("ui.build.leader")}</Caption>
            <Hero data={building.hero}  {...props} type='group' remove={removeHero} removable={true}/>
        </>:null
        }

        {storage?<>
            {storage.type=='resource'?
             <Paragraph>{i18n.t("ui.build.resource storage capacity")} {Util.number(storage.quantity*building.completedQuantity)} </Paragraph>
             :<ResourceRow prefix={i18n.t("ui.build.can hold")} resource={storage.type} suffix={Util.number(storage.quantity*building.completedQuantity)}/>
             }
        </>:null
        }
        {production?<>

           {Array.isArray(building.data.production)?
               <ToggleButton.Row onValueChange={value => select(value)} value={building.selectedProduction} >
                  {
                    building.data.production.map((p,index)=>{
                        return   <ToggleButton key={index} icon={mainStore.data.resources[p.result].icon} value={index} disabled={building.state=='deploy'}/>
                    })
                  }
               </ToggleButton.Row>
           :null}

           {production.cost?<>
               <Paragraph>{i18n.t("ui.build.production consumes")}</Paragraph>
               {
                   production.cost.map((cost,index)=>{
                       return <ResourceRow prefix={cost.optional==true&&index!=0?<Paragraph>{i18n.t("ui.build.or")} </Paragraph>:null} resource={cost.type} suffix={Util.number(cost.quantity*building.completedQuantity)}/>

                   })
               }
           </>:null
           }
         </>:null
         }

        {production||building.state=='deploy'?<>
           <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            <Paragraph style={{marginRight:5}}>{i18n.t("ui.build.working progress")}</Paragraph>
            <Caption >{Math.floor(building.remain)} {i18n.t("ui.build.days to complete")}</Caption>
          </View>
          <ProgressBar progress={(building.delay-building.remain)/building.delay}  />
         </>:null
         }

         {production?<>
            {building.state=='deploy'?null
           :<>
               <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                <Paragraph style={{marginRight:5}}>{i18n.t("ui.build.dedicated efforts")}</Paragraph>
                <Caption >{building.effort}/{building.getMaxEffort()}</Caption>
              </View>
              <ProgressBar progress={building.effort/building.getMaxEffort()}  />
               {production.result=='happiness'?
                    <View style={{flexDirection:'row'}}>
                        <Paragraph>{i18n.t("ui.build.increase happiness")} </Paragraph>
                        <ResourceIcon icon={mainStore.data.resources[production.result].icon}/>
                        <Paragraph>{(building.getResultQuantity(production.quantity)/(city.population/1000)).toFixed(3)}/{production.delay} {i18n.t("ui.build.days")}</Paragraph>
                    </View>
                   :<>
                   {
                       Array.isArray(production.result)?<>
                       <View style={{flexDirection:'row'}}>
                       {
                        production.result.map(result=>{
                            return <>
                                 <Paragraph>{result.key} </Paragraph>
                                 <ResourceIcon icon={mainStore.data.resources[result.key].icon}/>
                                 <Paragraph>{Util.number(building.getResultQuantity(result.quantity))} </Paragraph>
                            </>
                        })
                       }
                       </View>
                       <View style={{flexDirection:'row'}}>
                           <Paragraph> {i18n.t("ui.build.will be produced with max effort")}</Paragraph>
                       </View>
                       </>
                       :<ResourceRow resource={production.result} suffix={Util.number(building.getResultQuantity(production.quantity)) + i18n.t("ui.build.will be produced with max effort")}/>

                   }
                    </>
                }
            </>
            }
         </>
        :null}

          <Divider/>
          {building.units.length>0?
            <Caption>{i18n.t("ui.build.assigned units")}
                {building.units.length}/{getMaxAssigned()}
            </Caption>:null
           }
           {building.state=='deploy'&&building.data.build!=undefined?
           <Caption>{i18n.t("ui.build.assigning workers to this building project will boost the speed")}</Caption>
           :null
           }
            {
                building.units.map((unit,index)=>{
                    return <Unit key={index} unit={unit} index={index} disband={disband} unassign={unassign} equip={equip}/>
                })
            }



        <View style={{height:20}}>
        </View>
    </ScrollView>
}));