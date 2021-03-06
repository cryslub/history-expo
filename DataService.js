import i18n from 'i18n-js';

import City from './City.js';
import Faction from './Faction.js';

import Util from './Util.js';

//import DataBase from './DataBase.js';

import scenarios from "./json/scenario.json"
import factions from "./json/faction.json"
import roads from "./json/road.json"
import scenarioRoads from "./json/scenarioRoad.json"
import scenarioCities from "./json/scenarioCity.json"
import cities from "./json/city.json"
import snapshots from "./json/snapshot.json"
import snapshotSubs from "./json/snapshotSub.json"
import heroes from "./json/hero.json"
import buildings from "./json/building.json"
import resources from "./json/resource.json"
import units from "./json/unit.json"
import civilizations from "./json/civilization.json"

export default class DataService{

	constructor(objects){
	
		var self = this;
	
		self.host = "http://cryslub.cafe24app.com/history/";
		//self.host = "";

		self.globe = objects;
		
		self.cities ={};
		self.showUnuse = false;
		self.factions = {0:{name:i18n.t("ui.common.none"),id:0}};
		self.heroes = {};

		self.activeFactions = {};
		self.region = {};
	
		 
		 self.objectMap = {};
		 self.objects =[];
		 
		 self.citiesArray = Object.values(self.cities);
		 self.cityMap = {};
		 self.snapshotMap = {};
		 self.roadMap = {};
		 self.era = {ancient:[],classical:[],medieval:[],renaissance:[]};
		 
	
		 self.lineCoord = [];
	 
		self.data = [];
		self.civilizations = {}
	//	self.database = new DataBase();
		
	}
	
	load =  (callback)=>{
		
		const self = this;
		
	
		self.getFaction();
		self.getHero();
		self.initBuildings()
		self.initResources()
		self.initUnits()
		self.initCivilizations()

		self.selectScenario(scenarios[0]);			
		self.makeEra();
		

	}
	
	initBuildings(){
    	this.buildings = buildings

        Object.keys(this.buildings).forEach(key=>{
           const building = this.buildings[key]
           building.name = i18n.t('building.'+key+'.name')
           building.description = i18n.t('building.'+key+'.description')
        })
	}


	initResources(){
        this.resources = resources

        Object.keys(this.resources).forEach(key=>{
           const resource = this.resources[key]
           resource.name = i18n.t('resource.'+key+'.name')
        })
    }

    initUnits(){
        this.units = units

        Object.keys(this.units).forEach(key=>{
           const unit = this.units[key]
           unit.name = i18n.t('unit.'+key+'.name')
           unit.description = i18n.t('unit.'+key+'.description')

           if(unit.action?.equip){
                Object.keys(unit.action?.equip).forEach((k)=>{
                     const path = "unit."+key+".equip."+k

                    const part = unit.action.equip[k]
                    part.forEach((e,index)=>{
                        e.name = i18n.t(path+"."+index+".name")
                        e.description = i18n.t(path+"."+index+".description")
                    })

                })
            }
        })
    }

    initCivilizations(){
       this.civilizations = civilizations

        Object.keys(this.civilizations).forEach(key=>{
           const civilization = this.civilizations[key]
           civilization.name = i18n.t('civilization.'+key+'.name')
         //  unit.description = i18n.t('unit.'+key+'.description')

        })
    }

	 makeEra(callback){
		 var self = this;
		 	 
		scenarios.forEach(function(scenario){
			//console.log(scenario)
	    		if(scenario.yn){
		    		var era = "";
		    		if(scenario.year <=-500){
		    			era ="ancient";
		    		}else if(scenario.year > -500 && scenario.year <= 500){
		    			era ="classical";		    			
		    		}else if(scenario.year > 500 && scenario.year <= 1400){
		    			era ="medieval";		    			
		    		}else if(scenario.year > 1400){
		    			era ="renaissance";		    			
		    		}
		    		
	    			self.era[era].push(scenario);
	    		//	console.log(scenario.name)
	    		}

	    	})
		
		   
			
		}



		getRoadLength(line){
            var self = this;
            let ret = 0;

            if(line.waypoint !== "" && line.waypoint !== null){
                var waypoint = JSON.parse(line.waypoint);
               for(var i = 0;i<waypoint.length;i++){
                  if(i === 0){
                        ret += Util.getDistance(
                         self.cities[line.start].latitude,
                         self.cities[line.start].longitude,
                         waypoint[0][1],
                         waypoint[0][0],
                     )
                  }else{
                        ret += Util.getDistance(
                           waypoint[i-1][1],
                           waypoint[i-1][0],
                           waypoint[i][1],
                           waypoint[i][0],
                       )
                  }
              }
              ret += Util.getDistance(
                 waypoint[waypoint.length-1][1],
                 waypoint[waypoint.length-1][0],
                  self.cities[line.end].latitude,
                  self.cities[line.end].longitude,
                )

            }else{
                ret = Util.getDistance(
                      self.cities[line.start].latitude,
                      self.cities[line.start].longitude,
                      self.cities[line.end].latitude,
                      self.cities[line.end].longitude,
                  )
            }

            return  ret;

		}

		getRoad (scenario){
			var self = this;
			
			
				
		
		    	self.roadMap = {};
		    	
		    	scenarioRoads[scenario].forEach(id=>{ 
		    		if(roads[id] != undefined)
		    			self.roadMap[id] = roads[id];
			 	});
				
				
				self.lineCoord = [];
				Object.entries(self.roadMap).forEach(([key, line]) => {
					
					
					if(self.cities[line.start] !== undefined && self.cities[line.end] !== undefined){

// line.type ='road';
							line.destinies = [{road:line,city:self.cities[line.start]},{road:line,city:self.cities[line.end]}];
							line.units = [];

							const length =self.getRoadLength(line);
							let cost = length;
							if(line.type=='mountain'){cost = length*(3/2)}
							self.cities[line.start].destinies.push({road:line,city:self.cities[line.end],length:length,cost:cost});
							self.cities[line.end].destinies.push({road:line,city:self.cities[line.start],length:length,cost:cost});

						//	self.lineCoord.push({start:self.cities[line.start],end:self.cities[line.end],waypoint:line.waypoint,type:line.type});
					}
			 	});
				
				//self.roads = self.globe.addLines(self.lineCoord);

				//var interval = setInterval(function(){
				//	if(self.globe.loaded){
//						self.closeLoading();					
				//		 clearInterval(interval);
				//	}
			//	}, 1000);
			
		}
		
		
	redrawRoads(){
	    const self = this;
	    self.lineCoord = [];
        Object.entries(self.roadMap).forEach(([key, line]) => {

            if(self.cities[line.start] !== undefined && self.cities[line.end] !== undefined){
                if(self.cities[line.start].explored && self.cities[line.end].explored)
                    self.lineCoord.push({start:self.cities[line.start],end:self.cities[line.end],waypoint:line.waypoint,type:line.type});
            }
        });

        self.roads = self.globe.addLines(self.lineCoord);
	}
		
		
		
	async getFaction(){
		var self = this;
		
    	factions.forEach(faction => {
			self.factions[faction.id] = new Faction(faction);
			self.factions[faction.id].name = i18n.t('faction.'+faction.id+'.name')
			self.factions[faction.id].region = i18n.t('faction.'+faction.id+'.region')
			self.factions[faction.id].area = i18n.t('faction.'+faction.id+'.area')

	 	});
		
		
	}

	async getHero(){
		var self = this;

    	heroes.forEach(hero => {
    	    hero.name = i18n.t('hero.'+hero.id+'.name')
			self.heroes[hero.id] = hero;
	 	});


	}


    selectScenario (scenario){
        var self = this;

        self.selectedScenario=scenario;
     //   console.log(self.selectedScenario)

        self.cities = {};

        self.cityMap = {};
        self.snapshotMap = {};
        self.cities = {};
        self.selectedFaction = 0;



//			self.startLoading();


        self.data = [];
        self.activeFactions = {};
        self.region = {};



        scenarioCities[scenario.id].forEach(id=>{
            var city = {};
             Object.assign(city, cities[id]);
            //if(id==266){
             //   console.log("here")
          //  }
            var lastSnapshot = undefined;
            for(const snapshot of snapshots[id]){

                if(scenario.year>=snapshot.year){

                    city.population = snapshot.population;
                    city.name = i18n.t('city.'+city.id+'.name')
                    if(snapshot.name != null){
                        city.name = i18n.t('snapshot.'+snapshot.id+'.name');
                    }
                    city.snapshot = snapshot.id;
                    city.faction = snapshot.faction;
                    city.civilization = snapshot.civilization
                    city.color = self.factions[city.faction].color;
                    city.traits = snapshot.traits==null?'':snapshot.traits;
                    city.snapshotSub = snapshotSubs[snapshot.id];
                }
            }

            if(city.population==0 && city.type!='waypoint') return false;


            var c = new City(city,self);

            self.cities[city.id] = c;


            self.data.push(c)

            self.cityMap[city.id] = c;
            self.snapshotMap[city.snapshot] = c;


            if(self.activeFactions[city.faction] === undefined  && city.faction !==0 &&self.factions[city.faction]!=undefined){
                self.activeFactions[city.faction] = self.factions[city.faction];
                self.activeFactions[city.faction].cities = [];
            }
            if(self.activeFactions[city.faction] !== undefined  ){
                self.activeFactions[city.faction].cities.push(c);
                if(city.snapshotSub?.capital){
                    self.activeFactions[city.faction].capital = c;
                }
            }
        });


        Object.entries(self.activeFactions).forEach(([key, faction]) => {

            if(faction.region !== null){
                if(self.region[faction.region] === undefined){
                    self.region[faction.region] = {};
                }
                if(self.region[faction.region][faction.area] === undefined){
                    self.region[faction.region][faction.area] = [];
                }
                self.region[faction.region][faction.area].push(faction);
            }
        });

       window.data = self.data;




       self.addData(scenario,self.data);



       self.citiesArray = Object.values(self.cities);





//        setTimeout(function(){
//		       		$('#faction li:first-child a').tab('show');
//        },100);


    }
		
		
    addData(scenario,data){

        var self = this;

        if(self.roads !== undefined){
            self.globe.remove(self.roads);
        }

        Object.entries(self.objectMap).forEach(([key, city]) => {
            self.globe.remove(city.object);
        });


        self.globe.addData(data);

       self.objects = [];
       data.forEach(function(city){
           if(city.object !== undefined){
               self.objectMap[city.object.id] = city;
               self.objects.push(city.object);
           }
       });
       self.getRoad(scenario.id);


    }


    init(faction){

        faction.cities.forEach(city=>{
            city.explored = true
            city.destinies.forEach(destiny=>{
                destiny.city.show()

            })
        })


        this.data.forEach(city=>{
            city.init();
        });

        this.redrawRoads()
    }

    checkExplored(){
        this.data.forEach(city=>{
            city.checkExplored();
        });
        this.redrawRoads()

    }

     checkHeroMaturity = (date)=>{
        const year = date.getFullYear()
        Object.keys(this.heroes).forEach(id=>{
            const hero = this.heroes[id]
            if(hero.birth + 16== year){
                let city
                if(hero.parent>0){
                    const parent = this.heroes[hero.parent]
                    city = this.cities[parent.city]

                }else{
                    city = this.cities[hero.city]
                }
                if(city)
                    city.addHero(hero)
            }

        })
     }
	
}