import { observable, computed, action } from 'mobx';
import * as THREE from 'three';


import mainStore from './MainContext.js';
import Util from './Util.js';
import UnitData from './UnitData.js';


const maxWidth = mainStore.unitSize;

export default class BuildingData extends UnitData{


    source = [];

    constructor(unit,city,category) {
        super(unit,city,category)

        this.addJob(city)

    }

    addJob(city){

        if(this.data.production != undefined){

            this.onDone= ()=>{
                 const production = this.getProduction();
                if(this.state == 'deploy'){
                    if(this.onBuild != undefined){
                        this.onBuild();
                    }
                    this.completedQuantity++;
                    this.units.forEach((unit)=>{
                        if(this.data.worker != unit.data.type){
                              this.removeUnit(unit)
                              city.addUnit(unit)
                        }
                    })
                }
                if(this.state == 'produce'){
                    const maxEffort = this.getMaxEffort();

                    let  quantity = ((production.quantity*this.completedQuantity)*(this.effort/maxEffort));
                    const bonus = Util.isEmpty(this.city.effect[this.data.key+' production'])/100
                    quantity *= (1+bonus+this.bonusEffort);

                    if(production.result!='happiness' && production.result!='manpower'){
                        if(Array.isArray(production.result)){
                            production.result.forEach(result=>{
                                city.addResource(result.key,result.quantity)
                            })
                        }else{
                            quantity = city.addResource(production.result,quantity)
                        }
                    }




                    if(production.result=='happiness'){
                        let consumedCount = 0;
                        if(quantity>0){
                            const cost = production.cost;
                            if(cost){
                                cost.forEach(c=>{
                                    const consume = (c.quantity*this.completedQuantity)*this.effort/maxEffort;
                                    if(this.resources[c.type] >= consume){
                                        consumedCount++;
                                        this.resources[c.type] -= (c.quantity*this.completedQuantity)*this.effort/maxEffort;
                                    }
                                })
                            }
                        }
                        city.addHappiness((quantity*consumedCount)/(city.population/1000));
                    }

                    if(production.result=='manpower'){
                        city.setManpower(city.manpower+quantity)
                    }

                    this.effort = 0 ;
                    this.bonusEffort = 0;

                }

                this.setState('produce')
                this.initProgress();
                mainStore.jobs.push(this);
            }
        }
    }

    dailyJob = (diff)=>{


    }


    onJob = (diff)=>{


        if(this.data.key=='brewery'){
            //console.log(this.state)
        }
        let check = true;
        if(this.state == 'deploy'){

            if( this.units.length==0 )
                check = false;

        }
        if(this.state == 'produce'){
            if(this.data.key!='farm' && this.units.length==0){
                check = false;
            }else{
                if(!this.checkResource()) check = false;
            }
        }

        if(check)
            this.setRemain(this.remain-0.25*mainStore.speed);


         if(diff>0 && this.state == 'produce'){
            if(this.checkResource()){
               this.effort += Math.min(this.units.length,this.completedQuantity)*diff;
               if(this.hero){
                    this.bonusEffort += (this.hero.wisdom/(200*this.delay))*diff
               }
            }

        }
    }

    onDone = ()=>{
         if(this.state == 'deploy'){
               this.completedQuantity++;
               this.setState('')
               if(this.city){
                    this.city.units =  this.city.units.concat(this.units);
                    this.units = [];
                }
         }
    }


    checkResource = ()=>{
        let ret = true;
        let isOptional = false;
        let resourceCount = 0;

        const production = this.getProduction();

        if(production){

            if(production.cost){

                production.cost.forEach(cost=>{
                    Util.initMap(this.resources,cost.type,0);
                    const resource = this.resources[cost.type];
                    const requiredQuantity = cost.quantity*this.completedQuantity;
                    isOptional = cost.optional;
                    if(resource < requiredQuantity){
                        const quantity = this.city.consumeResource(cost.type,requiredQuantity);
                        this.resources[cost.type]+=quantity;

                        if(quantity < requiredQuantity ) {
                            this.city.addNeeds(cost.type,this)

                            if(!cost.optional){

                                ret = false;
                                return false;
                            }
                        }else{
                           resourceCount++
                        }
                    }else{
                         resourceCount++
                    }

                })
            }
        }
        if(isOptional){
            return resourceCount>0
        }
        return ret;
    }

    getResultQuantity(quantity){
        let ret = quantity*this.completedQuantity
        if(this.hero){
            ret *= (1+this.hero.wisdom/200)
        }
        return ret
    }
}