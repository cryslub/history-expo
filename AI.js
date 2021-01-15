import buildings from "./json/building.json"
import unitProto from "./json/unit.json"

import Util from './Util.js';

import getDayOfYear from 'date-fns/getDayOfYear'
import mainStore from './MainContext.js'

export class CityAI{

    needs = {};
    needSource = {};

    constructor(city) {
        this.city = city;
    }

    dailyJob(diff){

    }

    weeklyJob(diff){
        this.checkNeeds();
    }

    checkNeeds(){
        Object.keys(this.needs).forEach(key=>{
            const need = this.needs[key];
            if(need!=undefined){
                this.needs[key] = undefined;

                let building = key;
                if(key=='sling') building ='ranged';
                if(key=='mace') building ='melee';

                if(this.city.buildings[building] != undefined){
                    const production  =buildings[building]?.production;
                    if(production!=undefined){
                        const p = production;
                        if(Array.isArray(production)){
                            production.forEach(pro=>{
                                if(pro.result==key){
                                    p = pro;
                                }
                            });
                        }
                        if(this.city.resourceConsume[key]==undefined || this.city.resourceConsume[key]<=(this.city.buildings[building]?.quantity*p.quantity)/p.delay){
                            return;
                        }
                    }
                }


                switch(key){
                    case 'mud':
                        this.orderUnitToBuild('worker',buildings.mud,need)
                    break;
                    case 'clay':
                        this.orderUnitToBuild('worker',buildings.clay,need)
                    break;
                    case 'brick':
                        this.orderUnitToBuild('artisan',buildings.brick,need)
                    break;
                    case 'pottery':
                        this.orderUnitToBuild('artisan',buildings.pottery,need)
                    break;
                    case 'copper':
                        this.orderUnitToBuild('worker',buildings.copper,need)
                    break;
                    case 'wood':
                        this.orderUnitToBuild('worker',buildings.wood,need)
                    break;
                    case 'cloth':
                        this.orderUnitToBuild('artisan',buildings.cloth,need)
                    break;
                    case 'wool':
                        this.orderUnitToBuild('worker',buildings.wool,need)
                    break;
                    case 'livestock':
                        this.orderUnitToBuild('worker',buildings.livestock,need)
                    break;
                    case 'beer':
                        this.orderUnitToBuild('artisan',buildings.beer)
                    break;
                    case 'sling':
                        this.orderUnitToBuild('artisan',buildings.ranged)
                    break;
                    case 'mace':
                        this.orderUnitToBuild('artisan',buildings.melee)
                    break;
                    case 'warehouse':
                        this.orderUnitToBuild('worker',buildings.warehouse)
                    break;
                    case 'armoury':
                        this.orderUnitToBuild('worker',buildings.armoury)
                    break;
                    case 'wall':
                        this.orderUnitToBuild('worker',buildings.wall)
                    break;
                    case 'manpower':
                        this.checkResidence();
                    break;
                    case 'happiness':
                        this.checkHappinessBuildings();
                    break;
                    case 'defense':
                        this.checkDefense();
                    break;
                    case 'attack':
                        this.checkAttack();
                    break;
                }

                return false;
            }
        })
    }

    removeNeedSource(key){
        this.needSource[key] = undefined;
    }

    monthlyJob(diff){
        this.checkManpower();
        if(this.city.happiness<50){
            this.checkHappinessBuildings();

    //        this.addNeed({type:'happiness',quantity:1});
        }

       // this.checkFood();
        this.checkRareResource();

        this.checkWorkers();
    }

    checkWorkers(){
        Object.keys(this.city.buildings).forEach(key=>{
            const building = this.city.buildings[key];
            if(building.data.production !=undefined){
                if(building.completedQuantity >building.units.length){
                    const type = buildings[key].worker
                    this.city.employ(unitProto[type],(unit)=>{
                        this.city.assign(unit,building)
                    });
                }
            }
        })
    }

    checkManpower(){
        this.checkResidence();
    }

    checkResidence(){
        if(this.city.population>=((this.city.buildings.residence.completedQuantity*buildings.residence.storage.quantity)-450)){
            this.orderUnitToBuild('worker',buildings.residence)
        }
    }

    checkHappinessBuildings(){
        const market= this.city.buildings.market;
        if((market==undefined || market.quantity < this.city.population/10000) && this.city.population>1500){
            this.orderUnitToBuild('worker',buildings.market)
        }

        const tavern= this.city.buildings.tavern;
        if((tavern==undefined || tavern.quantity < this.city.population/10000) && this.city.population>5000){
            this.orderUnitToBuild('artisan',buildings.tavern)
        }

        const rate = this.city.foodConsumptionRate;
        if(rate<2){
            this.foodConsumptionRateGoal = 2
            if(rate ==0.5) this.foodConsumptionRateGoal = 1
            const ret = Util.intDivide(this.city.population,100) * this.foodConsumptionRateGoal;

            if(this.city.manpower>200 || rate==0.5){
                this.checkFarms(ret)
            }else{
                this.checkGranary();
            }
        }

        const array = [2,1.5,1,0.5];
        array.some(rate=>{
            const ret = Math.floor(Util.intDivide(this.city.population,100) * rate);

            let extra = this.city.resourceConsume?.food;
            extra = extra==undefined?0:extra;

            if(this.city.resources.food>(ret+extra)*(366-getDayOfYear(mainStore.date))){
                this.city.foodConsumptionRate = rate;
                return true;
            }
            return false;
        })


    }

    checkGranary(){
        const farm = this.city.buildings.farm;
        const granary = this.city.buildings.granary;

        if(granary.quantity*buildings.granary.storage.quantity<farm.quantity*buildings.farm.production.quantity){

            this.orderUnitToBuild('worker',buildings.granary)

        }
    }

    checkFarms(consumption){
        let ret = true;
        const farm = this.city.buildings.farm;
        let extra = this.city.resourceConsume?.food;
        extra = extra==undefined?0:extra;

        if(farm.completedQuantity*buildings.farm.production.quantity<=(consumption+extra)*365){
            this.city.employ(unitProto.farmer,(unit)=>{
                this.city.build(unit,buildings.farm)
            });
            ret = false;
        }

        this.checkGranary();

        return ret;
    }

    checkFood(){

        this.checkFarms(this.city.getFoodConsumption())


    }

    checkRareResource(){
        const arr = ['copper','wood']
        if(this.city.population>1000){

            arr.forEach(key=>{
                if(this.city.rareResources[key] !=undefined){
                    if(this.city.buildings[key]==undefined){
                        this.addNeed({type:key,quantity:1})
                    }
                    if(this.city.resources[key]!=undefined&&!this.city.trade.includes(key)){
                        this.city.addTrade(key)
                    }
                    return
                }
            })
        }

    }


    orderUnitToBuild(type,building,need){
        const b = this.city.buildings[building.key];
        if(b!=undefined){
            if(b.completedQuantity!=b.quantity || b.subs.length>0) return;
        }

        if(this.checkResourceForBuild(building)){

            let worker = this.getIdle(type);
            if(worker){
                this.build(worker,building,need)

            }else{
                if(this.city.manpower >= unitProto[type].manpower){
                    this.city.employ(unitProto[type],(unit)=>{
                        this.build(unit,building,need)

                    });

                }else{

                }
            }

        }else{
            this.addNeed(building.cost);
        }

    }

    build(worker,building,need){
        const b = this.city.build(worker,building)

    }

    addNeed(cost){
        if(Array.isArray(cost)){
            cost.forEach(c=>{
                this.needs[c.type] = c.quantity;
            })
        }else{
            this.needs[cost.type] = cost.quantity;
        }
    }

    checkResourceForBuild(building){
        let ret = true;
        const cost = building.cost;
        if(cost == undefined) return true;
        if(Array.isArray(cost)){
            cost.forEach(c=>{
                if(!this.checkResource(c)){
                    ret = false;
                    return false;
                }
            })
        }else{
            if(!this.checkResource(cost)){
                return false;
            }
        }

        return ret;
    }

    checkResource(cost){
        if(this.city.resources[cost.type]==undefined || this.city.resources[cost.type]<cost.quantity){
            return false;
        }
        return true;
    }

    getIdle(type){
        let ret = undefined;
        this.city.units.forEach(unit=>{
            if(unit.type==type){
                ret = unit;
                return false;
            }
        })

        return ret;
    }

    checkDefense(){
        const type = 'militia'
        const weapon = 'sling';

        this.checkArmy(type,weapon)

    }

    checkAttack(){
        const type = 'warrior'
        const weapon = 'mace';

        this.checkArmy(type,weapon)

    }

    checkArmy(type,weapon){
        if(this.city.getMilitaryUnits('unarmed')>0){

        }else{
             this.city.employ(unitProto[type]);
        }
    }
}

export class FactionAI{

    constructor(faction) {
        this.faction = faction;
    }

    dailyJob(diff){

        const cities = [];
        mainStore.units.forEach(unit=>{
            if(unit.getTotalDamage()>0){

                this.faction.cities.forEach(city=>{
                    if(unit.object.position.distanceTo(city.object.position)<10){
                        cities.push(city);
                    }
                });
            }
        })

        if(cities.length>0){
            const c = cities[0]
            this.faction.cities.forEach(city=>{
                const army = city.makeGroup();
                if(army>0 && city.id != c.id){
                    city.deploy(c);
                }
            });
        }
    }

    weeklyJob(diff){

    }

    monthlyJob(diff){

        const armedCity = []
        let min = 0;
        this.faction.cities.forEach(city=>{
            city.militaryJob();

            if(city.getMilitaryUnits('armed')>0){
                const unit = city.getUnit('warrior')
                if(unit!=undefined){
                    armedCity.push(city);
                }
            }

            city.destinies.forEach(destiny=>{
                const c = destiny.city;
                if(c.factionData.id !=this.faction.id && c.population>0){
                    if(c.getMilitaryUnits('armed') <=min){
                        this.target = c
                        min = c.getMilitaryUnits('armed')
                    }
                }
            })

        })

        if(this.target!=undefined){
            let sum =0;
            const readyCity = [];
            armedCity.forEach(city=>{
                const army = city.makeGroup();
                if(army>0){
                    readyCity.push(city);
                    sum+=army
                }
            })
            if(sum > this.target.getMilitaryUnits('armed')*1.5){
                readyCity.forEach(city=>{
                    city.deploy(this.target)
                });
            }
        }
    }

}