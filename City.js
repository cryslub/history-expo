import { makeAutoObservable } from "mobx"
import { observable, computed, action } from 'mobx';

import UnitData from './UnitData.js'
import BuildingData from './BuildingData.js';
import mainStore from './MainContext.js'
import Util from './Util.js';

import buildings from "./json/building.json"
import unitProto from "./json/unit.json"
import resources from './json/resource.json';

import {CityAI} from './AI.js';
import {SubUnits} from './Common.js'

export default class City extends SubUnits{


    @observable buildings = {};
    @observable resources = {};
    @observable manpower = 0;
    @observable population=0;
    @observable happiness = 50;
    @observable foodConsumptionRate = 1;
    @observable rareResources = {};
    @observable trade = [];
    @observable governor = undefined;
    @observable chancellor = undefined;

    @observable heroes = [];



    consumedManpower = 0;
    happinessAccu = 0;
    distance = {};
    aStars = {}

    resourceConsume = {};
    effect = {};

	constructor(city,$scope) {

        super();

		this.scope = $scope;


		this.id = city.id;
		this.yn = city.yn;
		this.cityType = city.type;

		this.snapshot = city.snapshot;
		this.year = city.year;
		this.scenario = city.scenario;
		this.scenarioCity = city.scenarioCity;
        this.traits = city.traits;

		this.color = city.color;
		this.faction = city.faction;
		this.factionData = $scope.factions[city.faction];
		if(this.faction>0){
		    this.factionData.cities.push(this);
		}
		this.soldiers = city.soldiers;
		this.population = city.population;
		this.latitude = city.latitude;
		this.longitude = city.longitude;
		this.name = city.name;
		this.originalName = city.originalName;
		this.cityName = city.cityName;
		this.labelPosition = city.labelPosition;
		this.type = 'city';
		
		this.mans = Math.floor(this.population/10);
		this.garrison = this.soldiers;
		this.militia = this.garrison;
		this.destinies = [];
		this.recruiting = 0;
 		
		this.loyalty = (this.faction === 0)?0:70;
		this.silver = (this.faction === 0)?0:Math.floor(this.population/10);
		this.food = (this.faction === 0)?0:this.population*2;
		this.tax = 10;
		this.workers = 0;
		this.idle = 0;
		this.wall = 0;
		this.forces = [];
		this.sub = [];
		this.snapshotSub = city.snapshotSub;
 		//this.mustering = new Mustering(this);

		this.weapons = {};

		this.soldierClasses = {};
		this.nameImage = {};
 		
		this.ai = new CityAI(this);
		
        const arr = this.traits.split(',');
        arr.forEach(a=>{
            if(resources[a]){
                this.rareResources[a] = resources[a]
            }
        })


        if(this.snapshotSub != undefined){
            this.snapshotSub.heroes?.forEach(id=>{
                const hero = $scope.heroes[id];
                hero.assigned = undefined;

                const index = this.heroes.push(hero)
                if(this.snapshotSub.governor == id){
                    this.governor = this.heroes[index-1];
                    this.governor.assigned = 'governor'
                }
                if(this.snapshotSub.chancellor == id){
                    this.chancellor = this.heroes[index-1];
                    this.chancellor.assigned = 'chancellor'
                }


            })

            this.snapshotSub.buildings?.forEach(building=>{
                const b = this.initBuilding(building,1);

                b.setState('')
            })
        }



 		//this.makeBlockSize();
 		
 		//this.makeMaxBlockSize();
	}


    init(){

        this.addResidences();
        this.addFarmsAndFood();
        this.initBuilding("warehouse",1);
        const walls = Util.intDivide(this.population,10000)
        this.initBuilding("wall",walls);

        this.setManpower(Math.min(1000,this.getMaxManpower()))

//        this.resources.mace=100;
//        this.resources['copper arrow']=100;

    }

    initBuilding(key,quantity){
        const building =  new BuildingData(buildings[key],this,"building");
        this.buildings[key]=(building);
        building.onDone();
        building.quantity = quantity;
        building.completedQuantity = quantity;

        return building
    }

    addResidences(){

        const residences = Util.intDivide(this.population,1000);
        this.initBuilding("residence",residences);

    }

    addFarmsAndFood(){
         const annualFood = (this.population*365/100 );

            const farms = Util.intDivide(annualFood,3000)

         const farm = this.initBuilding("farm",farms);

            for(var i = 0;i<farms;i++){
                const farmer = new UnitData(unitProto.farmer,this,'unit');
                farmer.state=''
                 farmer.remain = 0;


                 farm.units.push(farmer);
            }



            this.resources.food=annualFood;

            const granaries = Util.intDivide(annualFood,5000);
            const building = this.initBuilding("granary",granaries);
            building.goods = annualFood;

            this.addManpower(-farms*unitProto.farmer.manpower);

            /*
            if(this.manpower <0){
                let libraries = Util.intDivide(-this.manpower,3000);

                 this.addManpower(-unitProto.scribe.manpower*libraries);
                 this.addManpower(libraries*3000);

                 if(this.manpower <0){
                    libraries++;
                    this.addManpower(-unitProto.scribe.manpower);
                    this.addManpower(3000)
                 }

                 const library = this.initBuilding("library",libraries);


                 for(var i = 0;i<libraries;i++){
                     const scribe = new UnitData(unitProto.scribe,this,'unit');
                     scribe.state=''
                      scribe.remain = 0;

                      library.units.push(scribe);
                 }


            }*/
    }

    setManpower(manpower){
        this.manpower = Math.min(this.getMaxManpower(),manpower)
    }

    addManpower(manpower){
        if(manpower<0) this.consumedManpower-=manpower;
        this.setManpower(this.manpower+manpower)
    }



     employ(unit,callback){
        if(this.manpower<unit.manpower) return;

        const city = this;
        const unitData = new UnitData(unit,this,'unit');
        city.addUnit(unitData)
        if(unit.manpower)
            city.addManpower(-unit.manpower);

        if(callback!=undefined){
             unitData.onDone = ()=>{
                unitData.setState('')
                callback(unitData)
            }
        }

        mainStore.jobs.push(unitData);


        const cost = unit.cost;
        if(cost){
            if(cost.type =='happiness'){
                let quantity = this.getHiringCost(unit);

                city.happiness-=quantity;
            }
        }
    }

    getHiringCost(unit){
        let quantity = unit.cost.quantity
        const governor = this.governor;
        const chancellor = this.chancellor;

        let bonus  = 0;
        if(governor){
            if(unit.category=='army'){
                bonus  = governor.valor/200;
            }else{
                bonus = governor.wisdom/200;
            }
        }
        if(chancellor){
            if(unit.category=='army'){
                bonus  += chancellor.valor/400;
            }else{
                bonus += chancellor.wisdom/400;
            }
        }

        if(unit.category=='army'){
            bonus += Util.isEmpty(this.effect['military happiness cost'])/100;
        }

        quantity *= (1-bonus);
        return quantity;
    }

    getConstructionDays(days){
        const bonus = Util.isEmpty(this.effect['construction speed'])/100
        return Math.floor(days * (1-bonus));
    }

    build(unit,building,need){

        const city = this;
        const cost = building.cost;
        if(cost){
            if(Array.isArray(unit.cost)){
                unit.cost.forEach(cost=>{
                    city.resources[cost.type] -= cost.quantity;
                })
            }else{
                city.resources[cost.type] -= cost.quantity;
            }
        }


        const unitData = new BuildingData(building,city,'building');
        unitData.units.push(unit);

        const b = city.addBuilding(unitData);


//        b.units.push(unit);


        mainStore.jobs.push(unitData);

        city.removeUnit(unit);

        const production = building.production
        if(production!=undefined){
            production.cost?.forEach(cost=>{
                Util.initMap(this.resourceConsume,cost.type,0)
                this.resourceConsume[cost.type] += cost.quantity/production.delay;
            })
        }

        return unitData;
    }


    addNeeds(key,quantity){
        this.ai.needs[key] = quantity;
    }

    addResource(key,quantity){

        quantity = Math.floor(quantity);
        if(this.resources[key] == undefined){
            this.resources[key] = 0;
        }
        if(resources[key] == undefined){
            console.log(key);
            return;
        }
        const storage = resources[key].storage;
        if(storage){
            const building = this.buildings[storage];
            if(building){
                const maxStorage = building.completedQuantity * building.data.storage.quantity;
                quantity = Math.min(Math.floor(quantity),maxStorage-this.resources[key]);
                this.resources[key]  +=quantity;

                if(this.resources[key]>=maxStorage){
                     this.addNeeds(storage,1)
                }
            }else{
                this.addNeeds(storage,1)
            }

        }else{
            this.resources[key] += Math.floor(quantity);
        }

        this.refreshResource();
        return quantity;
    }

    addTrade(key){
        this.trade.push(key)
        this.refreshTrade();
    }

    removeTrade(key){
        Util.arrayRemove(this.trade,key)
        this.refreshTrade();
    }


     @action
	refreshTrade(){
	    this.trade = this.trade.splice(0);
	}



    consumeResource(key,quantity){
        if(this.resources[key] == undefined ) return 0;
        const consume = Math.min(Math.floor(quantity),this.resources[key]);
        this.resources[key]  -=consume;
        const storage = resources[key].storage;

        return consume;
    }

    @action
    refreshResource(){
        this.resources = Object.assign({}, this.resources);
    }

    @action
    refreshHeroes(){
        this.heroes = this.heroes.splice(0);
    }

    @action
    setGovernor(hero){
        if( this.governor){
             this.governor.assigned = undefined;
        }
        this.governor = hero;
        this.governor.assigned = 'governor'
        this.refreshHeroes();
    }

    @action
    setChancellor(hero){
         if( this.chancellor){
             this.chancellor.assigned = undefined;
        }
        this.chancellor = hero;
        this.chancellor.assigned = 'chancellor'

        this.refreshHeroes();
    }

    @computed get maxHappiness(){
        let bonus = Util.isEmpty(this.effect['max happiness'],0);
         if(this.factionData?.capital){
            bonus += Util.isEmpty(this.factionData.capital.effect['faction max happiness'],0)
         }

        return 100 + bonus;
    }

	setUnits(units){
	    this.units = units;
	}

	addUnit(unit){

        this.units.push(unit);
        this.refreshUnits();
	}

    assign(unit,building){
        if(unit.type=='hero'){
            if(building.hero){
                building.hero.assigned = undefined;
            }
            const hero = unit.data
           building.setHero(hero);
            hero.assigned = building;
            this.refreshHeroes();
           //this.removeHero(unit.data)
        }else{
            unit.parent = building;
            building.units.push(unit);
            this.removeUnit(unit);
        }
    }

    addHero(hero){
        this.heroes.push(hero);
        if(this.governor == undefined) this.setGovernor(hero)
    }

    removeHero(hero){
        Util.arrayRemove(this.heroes,hero);
        this.refreshHeroes();
        if(this.governor?.id === hero.id){
            if(this.heroes.length>0){
                this.setGovernor(this.heroes[0]);
            }else{
                this.setGovernor(undefined);
            }
        }

    }


    addBuilding(building){
        const key = building.data.key;
        const b = this.buildings[key];
        if(!Util.initMap(this.buildings,key,building)){
            building.onDone = ()=>{
                b.completedQuantity++;
                b.subs.shift();
//                b.remain += (b.delay-b.remain)/b.quantity;

                if(b.type!='production'){
                    this.units = this.units.concat(b.units);
                    b.units = [];
                    this.units = this.units.concat(building.units);
                    building.units = [];

                }else{
                    b.units = b.units.concat(building.units);
                    building.units = [];

                    b.units.forEach((unit)=>{
                        if(b.data.worker != unit.data.type){
                              b.removeUnit(unit)
                              this.addUnit(unit)
                        }
                    })

                }
                b.addEffect();
            }
            building.parent = b;
            b.subs.push(building);
            b.setQuantity(b.quantity+1);
        }
        this.refreshBuildings();

        return this.buildings[key];
	}

    @action
    refreshBuildings(){
        this.buildings = Object.assign({}, this.buildings);
    }

    removeUnit(unit){
        Util.arrayRemove(this.units,unit)
        this.refreshUnits()
    }


    getHygiene(){
        let ret =Math.floor(Math.pow(80000-this.population,2)/100000000)+Util.isEmpty(this.effect['hygiene'])
        if(this.snapshotSub?.resource?.water){
            ret += this.snapshotSub?.resource?.water/10
        }
        return ret ;
    }

    getHappinessGrowth(){
        return Math.log10(this.foodConsumptionRate)/3
    }

    getHappinessGrowthText(){
        const growth = this.getHappinessGrowth()
        if(growth>0) return "+"+growth.toFixed(2);
        return growth.toFixed(2)
    }

    addFoodConsumptionRate(rate){
        this.foodConsumptionRate = Math.min(Math.max(this.foodConsumptionRate+rate,0.5),2);
    }

    getFoodConsumption(){
        const ret = Util.intDivide(this.population,100) * this.foodConsumptionRate;

        return Math.floor(ret);
    }

    getMaxManpower(){

        return Math.floor(this.population/3)-this.consumedManpower;
    }

    getDefense(){
        if(this.buildings.wall == undefined) return 0;
        return this.buildings.wall.completedQuantity;
    }

    getDefenseMax(){
        return Util.intDivide(this.population,500);
    }



    checkCollision(unit){

        var ray = new THREE.Ray( unit.object.position,this.object.position );
        var box = new THREE.Box3().setFromObject( this.object );
        return box.containsPoint(unit.object.position)
        //return ray.intersectsBox( box);
    }






	annualJob(){


	}

	dailyJob(diff){

        if(this.resources.food){
            const consume = this.getFoodConsumption()*diff;

            this.happinessAccu += this.getHappinessGrowth();

            this.consumeResource("food",consume);
            if(this.resources.food<=0) {
                this.addHappiness(-1)
            }
            this.refreshResource();
        }

        const governor = this.governor;
        if(governor){
            this.happinessAccu += governor.authority/200;
            if(this.effect['wisdom happiness']){
                this.happinessAccu += governor.wisdom/800;
            }
            if(this.effect['valor happiness']){
                this.happinessAccu += governor.valor/800;
            }
        }
        const chancellor = this.chancellor;
        if(chancellor){
            this.happinessAccu += chancellor.authority/400;
        }

        if(mainStore.selectedFaction.id!=this.factionData.id){
            this.ai.dailyJob(diff)
        }

        let foes = this.getFoes(this.factionData.id);
        if(foes.length>0){
            this.units.forEach(unit=>{
                unit.attack(undefined,foes)
            })
        }

	}

    getFoes = (factionId)=>{
        let foes = []
        this.destinies.forEach(destiny=>{
            destiny.road.units.forEach(unit=>{
                if(unit.city.factionData.id !=  factionId && unit.getTotalDamage()>0){
                    if(this.checkCollision(unit) ){
                         foes.push(unit)
                    }
                }
            })
        })


        return foes;
    }

    weeklyJob(diff){


        if(mainStore.selectedFaction.id!=this.factionData.id){
            this.ai.weeklyJob(diff)
        }
    }

	addHappiness(happiness){
	    this.happiness += happiness;
	    this.happiness = Math.min(Math.max(this.happiness,-100),this.maxHappiness)
	}

	monthlyJob(diff){
	    const population = this.population;
	    if(population>0){
            let growth = Math.floor((population*0.01*this.getGrowthRate())/12);
            if(growth <1) growth =1;

           // if(this.factionData.capital!=undefined){
//                if(this.factionData.id==0 ||this.factionData.capital.id==this.id ){
                    if(this.population<3000){
                         this.setManpower(this.getMaxManpower())
                    }
//                }
          //  }

            const residenceCoverage= this.buildings.residence.completedQuantity*1000;
            if(population+growth>residenceCoverage) growth = residenceCoverage - population;

            if(population+growth>80000) growth = 0



            this.population += growth;

             this.addHappiness((this.happinessAccu/30)+Util.isEmpty(this.effect['happiness']));
             this.happinessAccu = 0;

	    }

	    if(mainStore.selectedFaction.id!=this.factionData.id){
            this.ai.monthlyJob(diff)
        }
	}

	getGrowthRate(){
	    if(this.happiness<0){
	        return ((this.happiness)/10).toFixed(2);
	    }

        let bonus = 0;
        const hero = this.buildings.residence.hero;
        if(hero){
           bonus = hero.wisdom/10
        }

        bonus += Util.isEmpty(this.effect['population growth'])

	    const hygiene = this.getHygiene();
	    return (((this.happiness+bonus)*(hygiene/60))/10).toFixed(2);
	}

	checkRecruit(){
		
		var city = this;
		
		if(city === undefined) return true;
		
		if(city.food <=0){
			return true;
		}
		
		if(city.forces === undefined){
			return true;
		}
		
		var ret = false;
		city.forces.forEach(function(force){
			if(force.faction !== city.faction){
				ret = true;
			}
		});
		
		return ret || city.mans===0 || city.population<100;
		
	}

	getDistance(city){
        if(this.distance[city.id] == undefined){
            this.distance[city.id] = Util.getDistance(this.latitude,this.longitude,city.latitude,city.longitude)
        }
         return this.distance[city.id]
	}

    annex(faction){
        if(this.factionData.cities){
            Util.arrayRemove(this.factionData.cities,this);
            if(this.factionData.capital == this){
                this.factionData.moveCapital();
            }

            this.heroes.forEach(hero=>{
                hero.assigned = undefined
            })

            if(this.factionData.cities.length>0){
                this.factionData.capital.heroes = this.factionData.capital.heroes.concat(this.heroes)
                this.heroes = [];
            }

        }

        this.governor = undefined
        this.chancellor = undefined
        this.factionData = faction;
        this.factionData.cities.push(this);
        this.changeColor(faction.color)
    }

	 changeColor(color){

        this.object.material.color = new THREE.Color(color);

    }

    militaryJob(){
        const armyCount = this.getMilitaryUnits('armed');
        if(armyCount<this.population/100 && this.happiness>5){
            this.addNeeds('defense',0)
        }
        if(this.buildings.wall.quantity<this.getDefenseMax()){
           this.addNeeds('wall',0)
        }
        if(this.happiness>50){
            this.addNeeds('attack',0)
        }

        this.loopAllUnit(unit=>{
            if(unit.category=='army'){
                if(unit.getTotalDamage()==0){
                    let weapon;
                    if(unit.type=='militia')  weapon ='sling'
                    if(unit.type=='warrior')  weapon ='mace'

                    this.equipUnit(unit,'Main Hand',weapon);

                }
            }
        })

    }

    equipUnit(unit,key,weapon){
        if(unit.data.action.equip==undefined) return;
        let equip = unit.data.action.equip[key][0];

        let resource = true;
        Object.keys(equip.require).forEach(key=>{
            if(this.resources[key] == undefined || this.resources[key]<unit.data.manpower){
                this.addNeeds(key,300)
                resource = false;
            }else{

            }
        })

        if(resource){
            this.bringResource(equip.require,false)
            unit.equipments[key] = {data:equip,amount:1};
        }
    }


    loopAllUnit(callback){
        this.units.forEach(unit=>{
            if(unit.type=='group'){
                unit.units.forEach(u=>{
                    callback(u);
                })
            }else{
                callback(unit);
            }
        })
    }

    bringResource(require,eqd){
        Object.keys(require).forEach(key=>{
            let quantity = require[key];
            if(!eqd){
                quantity *= -1;
            }
            this.resources[key] += quantity;
         })
    }

    makeGroup(){
        const group = this.getUnit('group');
        if(group==undefined){
            this.employ(unitProto.group,(group)=>{
            });
        }else{

                const worker = group.getUnit('worker') ;
                if(worker == undefined){
                    this.addWorkerToGroup(group);
                }else{
                    if(worker.equipments['Livestock']==undefined){
                        this.equipUnit(worker,'Livestock','donkey1')
                    }else{
                        const quantity = Math.min(500,        group.capacity - group.carrying)
                        let consume = this.consumeResource('food',quantity)
                        group.addResource('food', consume);
                    }
                }


                 if(group.units.length<10){
                    this.units.forEach(unit=>{
                        if(unit.type=='warrior' && unit.getTotalDamage()>0){
                            group.addGroup(unit);
                        }
                    })
                }

                if(group.getUnit('warrior')!=undefined && group.survivableDays>30){
                    return group.getMilitaryUnits('armed')
                }


        }


        return 0;
    }

    addWorkerToGroup(group){
        const worker =this.getUnit('worker');
        if(worker==undefined){
            this.employ(unitProto.worker,worker=>{
                group.addGroup(worker)
            });
        }else{
            group.addGroup(worker)
        }
    }

    checkBuildingAvailability(building){
        const key = building.key;
        const req = building.require;
        if(req){
            if(this.rareResources[req]==undefined) return false;
        }

        const rare = building.rare;
        if(rare){
            if(this.snapshotSub?.resource != undefined){
                if(this.snapshotSub?.resource[rare]==undefined && this.buildings[key]?.quantity>0) return false;
            }else{
                if(this.buildings[key]?.quantity>0) return false;
            }
        }



        const extension = building.extension;
        if(extension){
            if(this.buildings[extension]==undefined) return false;
            if(this.buildings[key]?.quantity>=this.buildings[extension].quantity) return false;
        }

        if(req || rare ){
            const k = req?req:rare
           if(this.buildings[key]?.quantity>0){
                if(this.snapshotSub?.resource == undefined) return false;
                if(this.buildings[key]?.quantity>=this.snapshotSub?.resource[k]) return false;
            }
        }

        return true;
    }

    checkEnemy(){
        let ret = false;
        this.destinies.forEach(destiny=>{
            destiny.road.units.forEach(unit=>{
                if(unit.getTotalDamage()>0 && unit.city.factionData.id != this.factionData.id){
                    ret = true;
                    return false;
                }
            })
        })
        return ret;
    }

    getAdjacentCities(checked){
        if(checked ==undefined){
            checked =[]
        }else{
            checked.push(this)
        }

        let cities = [];

        this.destinies.forEach(destiny=>{
            const city = destiny.city;

            if(city.population==0 && !checked.includes(city)){
                cities = cities.concat(city.getAdjacentCities(checked));
            }else if( city.population>0 ){
                cities.push(city);
            }
        })

        return cities;
    }

    getCoreData(){

        return {
            id:this.id,
            faction:this.factionData?.id,
            manpower:this.manpower,
            consumedManpower:this.consumedManpower,
            population:this.population,
            happiness:this.happiness,
            happinessAccu:this.happinessAccu,
            foodConsumptionRate:this.foodConsumptionRate,
            governor:this.governor?.id,
            chancellor:this.chancellor?.id,
            heroes:this.heroes.map(hero=> {return hero.id}),
            resources:this.resources,
            trade :this.trade,
            effect:this.effect,
            units:this.units.map(unit=>{return unit.getCoreData()}),
            buildings:Object.keys(this.buildings).map(key=>{return this.buildings[key].getCoreData()})
        }
    }

    parseCoreData(saved,data){
        this.factionData = data.factions[saved.faction]
        if(this.factionData){
            this.factionData.cities?.push(this);
            this.changeColor(this.factionData.color)
        }

        this.manpower = saved.manpower
        this.consumedManpower = saved.consumedManpower
        this.population = saved.population
        this.happiness = saved.happiness
        this.happinessAccu = saved.happinessAccu
        this.foodConsumptionRate = saved.foodConsumptionRate
        this.governor = data.heroes[saved.governor]
        this.chancellor = data.heroes[saved.chancellor]

        this.heroes = saved.heroes.map(hero=>{
            return data.heroes[hero]
        })

        this.resources = saved.resources
        this.trade = saved.trade
        this.effect = saved.effect

        this.units = [];

        saved.units.forEach(unit=>{
            const u = new UnitData()
            u.parseCoreData(unit,data)
            this.units.push(u)
        })

        this.buildings = {};

        saved.buildings.forEach(building=>{
            const b = new BuildingData()
            b.parseCoreData(building,data)
            this.buildings[building.key] = b
        })
    }
}
