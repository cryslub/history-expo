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

        if(city)
            this.addJob()

    }

    addJob(){

        if(this.data.production != undefined){

            this.onDone = this.productionDone
        }
    }

    productionDone = ()=>{

        const city = this.city

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
            this.addEffect();
        }
        if(this.state == 'produce'){
            const maxEffort = this.getMaxEffort();

            let  quantity = ((production.quantity*this.completedQuantity)*(this.effort/maxEffort));
            const bonus = Util.isEmpty(this.city.effect[this.data.key+' production'])/100
            if(this.data.key == 'farm'){
                if(this.city.buildings.irrigation){
                    const irrigation = this.city.buildings.irrigation

                    if(irrigation.hero){
                        const hero = irrigation.hero;
                        bonus += hero.authority/200
                    }

                }
            }
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
               let bonus = this.getBonus();
               this.bonusEffort += (bonus / (100*this.completedQuantity)) * diff
            }

        }
    }

    getBonus = ()=>{
       let bonus = 0;
       this.units.forEach(unit=>{
            bonus += unit.getEffect('production result');
       })
       bonus += Util.isEmpty(this.city.effect[this.data.key+' bonus'])
        return bonus
    }

    onDone = ()=>{
         if(this.state == 'deploy'){
               this.completedQuantity++;
               this.setState('')
               if(this.city){
                    const city = this.city;
                    city.units =  city.units.concat(this.units);
                    this.units = [];
                    this.addEffect();

                }
         }
    }

    addEffect = ()=>{
        if(this.data.effect){
            const city = this.city;
            Object.keys(this.data.effect).forEach(key=>{
                Util.initMap(city.effect,key,0)
                city.effect[key]+=this.data.effect[key]
            })
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
        if(this.completedQuantity ==0 ) return 0;

        let ret = quantity*this.completedQuantity
        let bonus = 0;

        if(this.hero){
            bonus = this.hero.wisdom/200;
        }


        if(this.data.key == 'farm'){
            if(this.city.buildings.irrigation?.hero){
                const hero = this.city.buildings.irrigation?.hero;
                bonus += hero.authority/200
            }
        }

         let sum =  this.getBonus();

        return ret * (1+bonus+sum/(100*this.completedQuantity))
    }

    getCoreData(){

        const parent = super.getCoreData()
        const  data = {
             completedQuantity:this.completedQuantity,
             quantity:this.quantity,
             key:this.data.key,
             effort:this.effort,
             bonusEffort:this.bonusEffort,
             selectedProduction:this.selectedProduction
        }

        return {...parent,...data}
    }

    parseCoreData(saved,data){
        super.parseCoreData(saved,data)

        this.completedQuantity = saved.completedQuantity
        this.quantity = saved.quantity
        this.effort = this.effort
        this.bonusEffort = this.bonusEffort
        this.selectedProduction = this.selectedProduction

        this.addJob()
    }
}