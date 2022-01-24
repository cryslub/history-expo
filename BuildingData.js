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

        this.resourceShortage = false

    }

    addJob(){

        if(this.data.production != undefined){

            this.onDone = this.productionDone
        }
    }

    addResource = (key, quantity)=>{

        this.city.addResource(key,quantity)

    }

    getProductionQuantity = (key,quantity,bonus)=>{
        const maxEffort = this.getMaxEffort();

        quantity = ((quantity*this.completedQuantity)*(this.effort/maxEffort));
        bonus += Util.isEmpty(this.city.effect[key+' production'])/100
        quantity *= (1+bonus+this.bonusEffort);

        return quantity
    }

    productionDone = ()=>{

        const city = this.city

         const production = this.getProduction();
        if(this.state == 'deploy'){
            if(this.onBuild != undefined){
                this.onBuild();
            }
            this.units.forEach(unit=>{
                unit.mission = ''
            })
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
            let bonus = 0
            if(this.data.key == 'farm'){
                if(this.city.buildings.irrigation){
                    const irrigation = this.city.buildings.irrigation

                    if(irrigation.hero){
                        const hero = irrigation.hero;
                        bonus += hero.authority/200
                    }

                }
            }
            let quantity = this.getProductionQuantity(this.data.key,production.quantity,bonus)

            if(production.result!='happiness' && production.result!='manpower'){
                let remain = 0
                if(Array.isArray(production.result)){
                    production.result.forEach(result=>{
                        const q = this.getProductionQuantity(this.data.key,result.quantity,0)
                        this.addResource(result.key,q)
                    })
                }else{
                    this.addResource(production.result,quantity)
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
                                let amount = (c.quantity*this.completedQuantity)*this.effort/maxEffort
                                if(maxEffort ==0)  amount = 0
                                this.resources[c.type] -= amount;

                                if(c.type=='beer'||c.type=='pottery'||c.type=='cloth'){
                                    Util.initMap(city.exoticResourceBuffer,c.type,0)
                                    city.exoticResourceBuffer[c.type] += amount

                                }
                            }
                        })
                    }
                }
                city.addHappiness((quantity*consumedCount)/(city.population/1000));


            }else{
                const cost = production.cost;
                if(cost){
                    cost.forEach(c=>{
                        this.resources[c.type] = Util.positiveSub(this.resources[c.type],(c.quantity*this.completedQuantity));
                    })
                }
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

          //  const unit = this.units.find(unit=>unit.mission=='building')
          //  if(unit==undefined) check = false

        }
        if(this.state == 'produce'){
            if(this.data.key!='farm' && (this.units.length==0 || this.city.resources.food==0)){
                check = false;
            }else{
                if(!this.checkResource()) check = false;
            }
        }

        if(check){
            let bonus = this.city.effect['construction speed']
            if(bonus==undefined) bonus = 0
            if(this.hero){
                bonus += this.hero.wisdom/5
            }

            let progress =0.25*(1+bonus/100)*mainStore.speed
            if(this.data.build){
                const workers = Math.min(this.units.filter(unit=>unit.type=='worker').length,this.data.build.worker)
                if(workers>0){
                    progress += 0.25*(1+bonus/100)*(1+Math.log(mainStore.speed*workers))
                }
            }

            this.setRemain(this.remain-progress);

        }

         if(diff>0 && this.state == 'produce'){
            if(this.checkResource()){
               this.effort += Math.min(this.units.length,this.completedQuantity)*diff;
               if(this.hero){
                    this.bonusEffort += (this.hero.wisdom/(200*this.delay))*diff
               }
               let bonus = this.getBonus();
               this.bonusEffort += (bonus / (100*this.completedQuantity*this.delay)) * diff
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
               this.removeHero()
               if(this.city){
                    const city = this.city;
                    this.units.forEach(unit=>{
                        unit.mission = ''
                    })
                    city.units =  city.units.concat(this.units);
                    this.units = [];
                    this.addEffect();

                }
         }
    }

    removeHero = ()=>{
        if(this.hero){
            this.hero.assigned = undefined;
        }
        this.setHero(undefined);
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

         if(this.city.name=='키쉬' && this.data.key =='library'){
            var a = 0
        }

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
        this.resourceShortage = !ret
        return ret;
    }

    getResultQuantity(quantity){
        if(quantity == undefined) quantity = this.getProduction().quantity
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
             selectedProduction:this.selectedProduction,
             subs:this.subs.map(sub=>{
                return sub.getCoreData()
             })
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
        saved.subs.forEach(sub=>{
          const b = new BuildingData(mainStore.data.buildings[sub.key],this.city)
          b.parseCoreData(sub,data)

            this.city.setBuildingOnDone(b,this)
            mainStore.jobs.push(b);
        })

        if(this.state=='produce'){
            const production = this.getProduction();
            this.delay = production.delay
        }
    }
}