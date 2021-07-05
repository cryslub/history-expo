
import Util from './Util.js';

import getDayOfYear from 'date-fns/getDayOfYear'
import mainStore from './MainContext.js'

export class CityAI{

    needs = {};
    needSource = {};
    buildings = mainStore.data.buildings

    constructor(city) {
        this.city = city;
        this.manpowerShortage = false
    }

    dailyJob(diff){

    }

    weeklyJob(diff){
        this.checkNeeds();

        this.adjustFoodConsumptionRate()

    }

    getExtraFoodConsumption(){
        let extra = this.city.resourceConsume?.food;
        extra = extra==undefined?0:extra;
        extra += this.city.wage

        return extra

    }

    adjustFoodConsumptionRate(){

        const extra = this.getExtraFoodConsumption()
        const city = this.city
        if(this.city.name=='아다나'){
            const a = 0
        }

         const array = [2,1.5,1,0.5];
        array.some(rate=>{
            const ret = Math.floor(Util.intDivide(city.population,100) * rate);


            if(city.resources.food>(ret+extra)*(366-getDayOfYear(mainStore.date))*1.05){
                city.foodConsumptionRate = rate;
                return true;
            }
            if(rate == 0.5){
                city.foodConsumptionRate = rate;
                return true;
            }
            return false;
        })
    }

    checkNeeds(){
        Object.keys(this.needs).forEach(key=>{

            const need = this.needs[key];
            if(need!=undefined){
                const city = this.city;
                this.needs[key] = undefined;

                let building = key;
                if(key=='sling') building ='ranged';
                if(key=='mace') building ='melee';
                if(key=='club') building ='melee';

                if(key=="stone tool") building ='toolsmith';

                if(city.civilization){
                    const civ = city.civilization.key
                    if(civ == 'egypt'){
                        if(key=='cloth'){
                            building = 'egyptian cloth'
                        }
                        if(key=='polished stone'){
                            building = 'egyptian polished stone'
                        }
                    }
                    if(civ == 'kish'){
                        if(key=='livestock'){
                            building = 'kishite livestock'
                        }
                        if(key=='wool'){
                            building = 'kishite wool'
                        }
                    }
                }

                if(this.city.buildings[building] != undefined){
                    const production  =mainStore.data.buildings[building]?.production;
                    if(production!=undefined){
                        let p = production;
                        if(Array.isArray(production)){
                            production.forEach(pro=>{
                                if(pro.result==key){
                                    p = pro;
                                }
                            });
                        }

                        if(key=='livestock'){
                            let a = 0;
                        }
                        if(this.city.resourceConsume[key]==undefined&&need<300){
                            return;
                        }
                        if( (this.city.resourceConsume[key]<=(this.city.buildings[building]?.quantity*p.quantity)/p.delay)&&(typeof need != 'number' || need<300)){
                            return;
                        }

                        this.city.buildings[building].units.forEach(unit=>{
                            city.equipUnit(unit,'main hand','stone tool')
                        })
                    }
                }

                 let limit = 100
                  if(city.civilization){
                     if(city.civilization.key =='egypt'){
                        limit = 200
                     }
                  }

                  if(city.name=='키쉬'){
                      var a = 0
                  }

                if(this.city.manpower<=limit){
                    if(key =='tablet'||key =='papyrus'||key =='papyrus sedge'||key =='mud'||key =='wood'){

                    }else return

                }else{
                    if(this.foodShortage){
                        if(key =='clay'||key =='pottery'||key =='mud'||key =='brick'){
                        }else
                            return
                    }
                }


                switch(key){
                    case 'mud':
                        this.orderUnitToBuild('worker',this.buildings.mud,need)
                    break;
                    case 'clay':
                        this.orderUnitToBuild('worker',this.buildings.clay,need)
                    break;
                    case 'brick':
                        this.orderUnitToBuild('artisan',this.buildings.brick,need)
                    break;
                    case 'pottery':
                        this.orderUnitToBuild('artisan',this.buildings.pottery,need)
                    break;
                    case 'copper':
                        this.orderUnitToBuild('worker',this.buildings.copper,need)
                    break;
                    case 'wood':
                        this.orderUnitToBuild('worker',this.buildings.wood,need)
                    break;
                    case 'stone':
                        this.orderUnitToBuild('worker',this.buildings.stone)
                    break;
                    case 'polished stone':
                        this.orderUnitToBuild('artisan',this.buildings[building])
                    break;
                    case 'cloth':
                        this.orderUnitToBuild('artisan',this.buildings[building],need)
                    break;
                    case 'wool':
                        this.orderUnitToBuild('worker',this.buildings[building],need)
                    break;
                    case 'livestock':
                        this.orderUnitToBuild('worker',this.buildings[building],need)
                    break;
                    case 'beer':
                        this.orderUnitToBuild('artisan',this.buildings.beer)
                    break;
                    case 'tablet':
                        if(city.name=='키쉬'){
                            var a = 0
                        }
                        this.orderUnitToBuild('artisan',this.buildings.tablet)
                    break;
                    case 'papyrus':
                        this.orderUnitToBuild('artisan',this.buildings.papyrus)
                    break;
                    case 'papyrus sedge':
                        this.orderUnitToBuild('farmer',this.buildings['papyrus sedge'])
                    break;
                    case 'flax':
                        this.orderUnitToBuild('farmer',this.buildings['flax'])
                    break;

                    case 'sling':
                    {
                        if(city.buildings[building]==undefined){
                           // console.log(city.name+" " +building + " " + city.buildings[building])
                            this.orderUnitToBuild('artisan',this.buildings.ranged)
                        }
                    break;
                    }

                    case "stone tool":
                        this.orderUnitToBuild('artisan',this.buildings.toolsmith)
                    break;

                    case 'mace':
                        this.orderUnitToBuild('artisan',this.buildings.melee)
                    break;
                    case 'club':
                        this.orderUnitToBuild('artisan',this.buildings.melee)
                    break;

                    case 'warehouse':
                        this.orderUnitToBuild('worker',this.buildings.warehouse)
                    break;
                    case 'armoury':
                         if(this.city.buildings.armoury==undefined || this.city.buildings.armoury.quantity<2)
                            this.orderUnitToBuild('worker',this.buildings.armoury)
                    break;
                    case 'wall':
                        this.orderUnitToBuild('worker',this.buildings.wall)
                    break;
                    case 'manpower':
//                        this.checkManpower();
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
        this.manpowerShortage = this.checkManpower();
        if(this.city.happiness<50){
            this.checkHappinessBuildings();

    //        this.addNeed({type:'happiness',quantity:1});
        }

        this.checkFood();
        this.checkRareResource();

        this.checkWorkers();
    }

    checkWorkers(){
        Object.keys(this.city.buildings).forEach(key=>{
            const building = this.city.buildings[key];
            if(building.data.production !=undefined){
                if(building.completedQuantity >building.units.length){
                    const type = this.buildings[key].worker
                    if(type!=''){
                        this.city.employ(mainStore.data.units[type],(unit)=>{
                            this.city.assign(unit,building)
                        });
                    }
                }
            }
        })
    }

    checkManpower(){
        const city = this.city
        if(city.manpower <  1000){


            let building = 'library'

            if(city.civilization){
                const civ = city.civilization.key
                if(civ =='egypt'){
                    building = 'egyptian library'
                }

                if(civ =='sumer'){
                    building = 'sumerian library'
                }

            }

            if((city.buildings[building] || city.population<2500) && city.getMaxManpower()<800){
                return this.checkResidence();
            }else{
                if(city.buildings[building] !=undefined){
                    let p = city.buildings[building].data.production
                    if(city.buildings[building].quantity * p.quantity < Util.intDivide(city.getMaxManpower(),100) ){
                        //if(building =='sumerian library'){
                            //console.log(city.buildings[building].quantity * p.quantity +","+ city.getMaxManpower()/50 )
                        //}
                        this.orderUnitToBuild('artisan',this.buildings[building])
                        return true
                    }
                }else{
//                    console.log(building)
                    this.orderUnitToBuild('artisan',this.buildings[building])
                    return true
                }

            }
        }
        return false
    }

    checkResidence(){
        if(this.city.population>=((this.city.buildings.residence.completedQuantity*this.buildings.residence.storage.quantity)-450) ){
            this.orderUnitToBuild('worker',this.buildings.residence)
            return true
        }else{
            return false
        }
    }

    checkHappinessBuildings(){
         const city = this.city
        if(this.city.manpower>400){
            const market= this.city.buildings.market;
            if((market==undefined || market.quantity < this.city.population/10000) && this.city.population>1500){
                this.orderUnitToBuild('worker',this.buildings.market)
            }

            const tavern= this.city.buildings.tavern;
            if((tavern==undefined || tavern.quantity < this.city.population/10000) && this.city.population>5000){
                this.orderUnitToBuild('artisan',this.buildings.tavern)
            }
        }

        let extra = this.city.resourceConsume?.food;
        extra = extra==undefined?0:extra;
        extra += this.city.wage


        const rate = this.city.foodConsumptionRate;
        if(rate<2){
            this.foodConsumptionRateGoal = 2
            if(rate ==0.5) this.foodConsumptionRateGoal = 1
            const ret = Util.intDivide(this.city.population,100) * this.foodConsumptionRateGoal;

            if(this.city.manpower>200 || rate==0.5){
                this.checkFarms(ret+this.city.wage)
            }else{
                this.checkGranary();
            }

            this.city.buildings.farm.units.forEach(unit=>{
                city.equipUnit(unit,'main hand','stone tool')
            })
        }




    }

    checkGranary(){
        const farm = this.city.buildings.farm;
        const granary = this.city.buildings.granary;

        if(granary.quantity*granary.data.storage.quantity<farm.getResultQuantity()){

            this.orderUnitToBuild('worker',this.buildings.granary)
           //  this.foodShortage = true
             return false
        }

        return true
    }


    checkFarms(consumption){
        const city = this.city;
        let ret = true;
        const farm = this.city.buildings.farm;
        let extra = this.city.resourceConsume?.food;
        extra = extra==undefined?0:extra;
        extra += this.city.wage

        if(farm.getResultQuantity(this.buildings.farm.production.quantity)<=(consumption+extra)*365*1.05){

            if(this.checkGranary()){
                if(!this.manpowerShortage){
                    if(city.checkBuildingAvailability(this.buildings.irrigation) && city.manpower>200){
                        this.orderUnitToBuild('worker',this.buildings.irrigation)
                    }

                    this.city.employ(mainStore.data.units.farmer,(unit)=>{
                        this.city.build(unit,this.buildings.farm)
                    });
                }
            }

            ret = false;
        }



        return ret;
    }

    checkFood(){


        if(this.checkFarms(this.city.getFoodConsumption())==false){
            this.foodShortage = true
        }else{
            this.foodShortage = false
        }



    }

    checkRareResource(){
        const arr = ['copper','tin','silver']
        if(this.city.population>1000 && this.city.manpower>300){

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
        const city = this.city;
        const b = this.city.buildings[building.key];
        if(b!=undefined){
            if(b.completedQuantity!=b.quantity || b.subs.length>0) return;
        }

        if(!city.checkBuildingAvailability(building)){
            return false;
        }

        if(this.checkResourceForBuild(building)){

            let worker = this.getIdle(type);
            if(worker){
                this.build(worker,building,need)

            }else{
                if(this.city.manpower >= mainStore.data.units[type].manpower){
                    this.city.employ(mainStore.data.units[type],(unit)=>{
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
                Util.initMap(this.needs,c.type,0)
                this.needs[c.type] += c.quantity;
            })
        }else{
            Util.initMap(this.needs,cost.type,0)
            this.needs[cost.type] += cost.quantity;
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
        if(this.city.manpower<=400) return;
        if(this.city.getMilitaryUnits('unarmed')>0){

        }else{
             this.city.employ(mainStore.data.units[type]);
        }
    }

    makeGroup(){
        const city = this.city;
        if(this.militaryGroup == undefined){
            this.militaryGroup = city.getUnit('group')
            if(this.militaryGroup == undefined){
                city.employ(mainStore.data.units.group,(group)=>{
                    group.aiType= 'army'
                    this.militaryGroup = group;
                });
            }
        }else{
            city.units.forEach(unit=>{
                if(unit.type=='group' && unit.aiType=='army' && unit!=this.militaryGroup){
                    unit.disband();
                }
            })

            const group = this.militaryGroup
            const worker = group.getUnit('worker') ;
            if(worker == undefined){
                city.addWorkerToGroup(group);
            }else{
                if(worker.equipments['livestock']==undefined){
                    city.equipUnit(worker,'livestock','donkey')
                }else{
                    const quantity = Math.min(500,        group.capacity - group.carrying)
                    let consume = city.consumeResource('food',quantity)
                    group.addResource('food', consume);
                }
            }


             if(group.units.length<10){
                city.units.forEach(unit=>{
                    if(unit.type=='warrior' && unit.getTotalDamage()>0){
                        group.addGroup(unit);
                    }
                })
            }

        }


        return 0;
    }

    deploy(target){
        const group = this.militaryGroup;
        if(group == undefined) return;
        const result = Util.aStar(group,target);

        mainStore.addUnit(group);
        group.startMove(result.path,target);
        this.militaryGroup = undefined;
      //  console.log(target.name)
    }
}

export class FactionAI{

    constructor(faction) {
        this.faction = faction;
    }

    dailyJob(diff){

        const cities = [];

        this.faction.cities.forEach(city=>{
            if(city.checkEnemy()) cities.push(city);
        });

        if(cities.length>0){
            const c = cities[0]
            this.faction.cities.forEach(city=>{
                if(c!=city){
                    city.ai.makeGroup();
                    if(city.ai.militaryGroup){
                         const group = city.ai.militaryGroup
                        if(group.getUnit('warrior')!=undefined && group.survivableDays>30){
                            const army = group.getMilitaryUnits('armed')
                            if(army>0 && city.id != c.id){
                                city.ai.deploy(c);
                            }

                        }
                    }
                }

            });
        }

        mainStore.units.forEach(unit=>{

            if(unit.city.factionData.id == this.faction.id){
                if(unit.state == 'waiting'){
                    if(unit.currentLocation == unit.city && unit.currentRoad==undefined){
                        unit.enter();
                    }else{
                        if(!unit.currentLocation.checkEnemy() || unit.currentRoad!=undefined){
                             const result = Util.aStar(unit,unit.city);
                             unit.startMove(result.path,unit.city);
                        }
                    }
                }
            }
        })
    }



    weeklyJob(diff){

    }

    monthlyJob(diff){

        const armedCity = []
        let min ;
        let target;
        let cities = [];
        this.faction.cities.forEach(city=>{

            city.militaryJob();

            if(city.getMilitaryUnits('armed')>0){
                const unit = city.getUnit('warrior')
                if(unit!=undefined){
                    armedCity.push(city);
                }
            }

            cities = cities.concat(city.getAdjacentCities());
        })

        cities.forEach(city=>{
            if(city.factionData.id !=this.faction.id){
                if(city.getMilitaryUnits('armed') <=min || min==undefined){
                    target = city
                    min = city.getMilitaryUnits('armed')
                }
            }
        })


        if(target!=undefined){

            let sum =0;
            const readyCity = [];
            armedCity.forEach(city=>{
                city.ai.makeGroup();
                if(city.ai.militaryGroup){
                    const group = city.ai.militaryGroup
                     const army = group.getMilitaryUnits('armed')
                     const result = Util.aStar(group,target)
                    if(army>0 && group.survivableDays> (Util.intDivide((result.length/1000),group.speed))*2 +30 ) {
                        readyCity.push(city);
                        sum+=army
                    }
                }
            })
            if(sum > target.getMilitaryUnits('armed')*1.5){
                readyCity.forEach(city=>{
                    city.ai.deploy(target)
                });
            }
        }
    }

}