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
                this.heroes.push($scope.heroes[id])
            })
            this.governor = this.snapshotSub.governor?$scope.heroes[this.snapshotSub.governor]:undefined;
            this.chancellor = this.snapshotSub.chancellor?$scope.heroes[this.snapshotSub.chancellor]:undefined;

            this.snapshotSub.buildings?.forEach(building=>{
                const b = this.initBuilding(building,1);
                const effect = buildings[building].effect;
                if(effect){
                    Object.keys(effect).forEach(key=>{
                        Util.initMap(this.effect,key,0)
                        this.effect[key]+= effect[key];
                    })
                }
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

        this.resources.mace=100;
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

	initCity(){
		var self = this;
		if(this.faction ===0){
 			self.buildings.residence.amount =  Math.floor((this.population/1000)+(this.population%1000===0?0:1));
 			self.buildings.granary.amount =  1;
 			self.buildings.silver.amount = 1;		 
 		}else{
 			self.buildings.residence.amount =  Math.floor((this.population/1000)+(this.population%1000===0?0:1));
 			self.buildings.granary.amount =  Math.floor((this.food/1000)+(this.food%1000===0?0:1));
 			self.buildings.silver.amount = Math.floor((this.silver/1000)+(this.silver%1000===0?0:1));	 		
 		}
	}

     employ(unit,callback){
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
        this.governor = hero;
    }

    @action
    setChancellor(hero){
        this.chancellor = hero;
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
           building.setHero(unit.data);
           this.removeHero(unit.data)
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

    disband(unit){
        if(unit.type=='group'){
            this.units = this.units.concat(unit.units);
            if(unit.hero!=undefined){
                this.addHero(unit.hero)
            }
        }
        this.removeUnit(unit);
        if(unit.data.manpower!=undefined){
            this.manpower+=unit.data.manpower;
            this.consumedManpower -=unit.data.manpower
        }
    }

    getHygiene(){
        return Math.floor(Math.pow(80000-this.population,2)/100000000)+Util.isEmpty(this.effect['hygiene']);
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

	makeBlockSize(){
		var size = 0;
		
		
		this.totalBuildingSize =  size;
	}
	
	makeMaxBlockSize(){
		this.maxBuildingSize =  Math.floor(Math.sqrt(this.population)*2);
		// 		return Math.pow(Math.floor(Math.sqrt(city.population)/10),2) + 10;
	}


	
	addMusterSilver(amount){
		var add = Math.min(this.silver,amount);
		this.mustering.silver+= add;		
		
		this.calculateMuster();
	}
	subMusterSilver(amount){
		var sub = Math.min(this.mustering.silver,amount);
		this.mustering.silver-= sub;		
		
		this.calculateMuster();

	}
	addMusterFood(amount){
		var add = Math.min(this.food,amount);
		this.mustering.food+= add;

		this.makeMusterFoodDays();
	}
	subMusterFood(amount){
		var sub = Math.min(this.mustering.food,amount);
		this.mustering.food-= sub;		

		this.makeMusterFoodDays();
	}
	
	makeMusterFood(){
	
		
		
		this.mustering.food = Math.min(this.food,this.getMusterSoldiers() *10/ 10);
		this.mustering.days = this.mustering.food*10 / this.getMusterSoldiers();
		
		
	}
	
	checkMuster(){
		
		if(this.mustering.food<=0) return true;
				
		return this.getMusterSoldiers() === 0;
	}
	
	getMusterSoldiers(){
		var amount = 0;
		return amount;
	}
	
	calculateMuster(){
		var self = this;
		
		this.mustering.capacity = 0;
		
		
		this.mustering.food = Math.min(this.food,self.mustering.capacity - self.mustering.silver);
		this.mustering.days = this.mustering.food*10 / this.getMusterSoldiers();
		
	}
	
	assignClass(type,stat){
		
		var soldierClass = this.scope.soldierClasses[type];
		
		if(stat === 'organize'){
			var add = Math.min(this.militia,soldierClass.unit);
			this.soldierClasses[type].garrison += add;
			this.militia -= add;
			
			if(type==='worker'){ 
				this.workers += add;
				this.idle += add;
			}
			
		}else{
			
			var garrison = this.soldierClasses[type].garrison;
			if(type==='worker'){
				garrison = this.idle;
			}
			
			this.mustering.assignClass(type,garrison);

		}
	}

	unassignClass(type,stat){
		
		var soldierClass = this.scope.soldierClasses[type];

		if(stat === 'organize'){
			var sub = Math.min(this.soldierClasses[type].garrison,soldierClass.unit);

			if(type==='worker'){ 
				sub = Math.min(sub,this.idle);				
				this.workers -= sub;
				this.idle -= sub;

			}
			
			this.soldierClasses[type].garrison -= sub;
			this.militia +=sub;

			
		}else{
			
			this.mustering.unassignClass(type);

			
		}
	}

	make(building,type){
		
		var self = this;
		
		var unit = this.scope.weapons[type].unit;
		this.weapons[type].making += unit;
		if(this.scope.weapons[type].category === 'weapon'){
			this.usedArmoury += unit * this.scope.weapons[type].space;
		}
		if(this.scope.weapons[type].category === 'livestock'){
			this.usedStable += unit * this.scope.weapons[type].space;
		}
		
		this.silver -= this.scope.weapons[type].cost * unit;
		
		var job =  {
			fn:function(){
				self.weapons[type].amount += unit;
				self.weapons[type].making -= unit;							
				building.makeJobs.shift();
				if(building.makeJobs.length >0){			
					self.scope.jobs.push(building.makeJobs[0]);
				}
			},
			exec:function(){
				this.delay -= building.workers;
				this.delay++;
			},
			delay:this.scope.weapons[type].delay
		};

		building.makeJobs.push(job);
		
		if(building.makeJobs.length === 1){			
			return job;
		}else{
			return undefined;
		}
		
	}

	calculateBuildingBonus(){
		
		this.makeBlockSize();
		this.armoury = this.getOptions('armoury');
		this.stable = this.getOptions('stable');

		this.usedArmoury = 0;
		this.usedStable = 0;


				
	}
	
	getOptions(option){
		
		var ret = 0;

		
		return ret;
	}


	checkMake(building,item){
		var ret = false;
		var weapon = this.scope.weapons[item];
		if(weapon.category === 'weapon'){
			ret= this.usedArmoury+weapon.unit*weapon.space<=this.armoury;					
		}
		if(weapon.category === 'livestock'){
			ret= this.usedStable+weapon.unit*weapon.space<=this.stable;
		}
		
		return !(building.workers!==0 && ret && this.silver >= weapon.unit * weapon.cost);

	}
		
	muster(mustered){
		
		
		var force = {
			faction:this.faction,
			longitude : this.longitude,
			latitude : this.latitude,
			type :'force',
			soldiers : 0,
			name :this.name+' Force',
			origin : this,
			position: this,
			morale:this.loyalty,
			soldierClasses : {},
			silver : this.mustering.silver,
			food : this.mustering.food,
			heroes:{}
		}
		
		

		
		
		this.forces.push(force);

		
		return force;
	}
	
	initMustering(){
 		
		
	}

	getAnnualFood(){
	    return Math.floor(Util.initDivide(this.population,100)*365);
	}

	annualFoodEarning(){
		
		var city = this;
		var ret = 0;

		var add = city.getOptions('irrigationBonus');
		var foodBonus = city.getOptions('foodBonus');
		var irrigation = city.getOptions('irrigation');

		ret += Math.floor(city.population*city.tax*(0.1+foodBonus*0.001));
		ret += irrigation;
		
		if(city.buildings.irrigation !== undefined)
			ret += city.buildings.irrigation.amount*add;
		
		return ret;

	}
	
	annualSilverEarning(){

		var city = this;

		var ret = 0;
		
		var silverBonus = city.getOptions('silverBonus');										
		var silver = city.getOptions('silver');
		
		ret += Math.floor(city.population*city.tax*(0.005+silverBonus*0.00005));
		ret += silver;
		
		return ret;
		
	}
	
	annualJob(){
		var city = this;
		
		var granary = city.getOptions('granary');
		var deposite = city.getOptions('deposite');

		var foodEarning = city.annualFoodEarning();
		city.food += foodEarning;

		
		var silverEarning = city.annualSilverEarning();
		
		city.silver += silverEarning;
		
		
		if(city.food > granary){
			city.food = granary;
		}
		
		if(city.silver > deposite){
			city.silver = deposite;
		}					
		
		if(city.silver<0){
			city.silver = 0
			city.loyalty -=20;
			if(city.loyalty <0){
				city.loyalty = 0;
			}
		}
	
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
            this.happinessAccu += governor.authority/100;
            if(this.effect['wisdom happiness']){
                this.happinessAccu += governor.wisdom/400;
            }
            if(this.effect['valor happiness']){
                this.happinessAccu += governor.valor/400;
            }
        }
        const chancellor = this.chancellor;
        if(chancellor){
            this.happinessAccu += chancellor.authority/200;
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
        mainStore.units.forEach(unit=>{
            if(unit.city.factionData.id !=  factionId && unit.category=='army'){
                if(this.checkCollision(unit) ){
                     foes.push(unit)
                }
            }
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

            if(this.factionData.capital!=undefined){
//                if(this.factionData.id==0 ||this.factionData.capital.id==this.id ){
                    if(this.population<3000){
                     this.setManpower(this.manpower+growth/3)
                    }
//                }
            }

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
        Util.arrayRemove(this.factionData.cities,this);
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

                    this.equipUnit(unit,weapon);

                }
            }
        })

    }

    equipUnit(unit,weapon){
        let equip;
        unit.data.action.equip.forEach(e=>{
            if(e.key==weapon){
                equip = e;
            }
        })

        let resource = true;
        Object.keys(equip.require).forEach(key=>{
            if(this.resources[key] == undefined || this.resources[key]<unit.data.manpower){
                this.addNeeds(key,1)
                resource = false;
            }else{

            }
        })

        if(resource){
            this.bringResource(equip.require,false)
            unit.equipments[weapon] = {data:equip,amount:1};
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
            const worker = group.getUnit(worker) ;
            if(worker == undefined){
                this.addWorkerToGroup(group);
            }else{
                if(worker.equipments['donkey1']==undefined){
                    this.equipUnit(worker,'donkey1')
                }else{
                    const quantity = Math.min(500,        unit.capacity - unit.carrying())
                    let consume = this.consumeResource('food',quantity)
                    unit.addResource('food', consume);
                }
            }

            this.units.forEach(unit=>{
                if(unit.type=='warrior' && unit.getTotalDamage()>0){
                    group.addGroup(unit);
                }
            })

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

    deploy(target){
        const group = this.getUnit('group');
        const result = Util.aStar(group,target);

        mainStore.addUnit(group);
        group.startMove(result.path,target.object.position);
    }

}
