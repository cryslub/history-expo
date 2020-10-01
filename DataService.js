import City from './City.js';
import DataBase from './DataBase.js';


export default class DataService{
	constructor(objetcs){
	
		var self = this;
	
		self.host = "http://cryslub.cafe24app.com/history/";
		//self.host = "";

		self.globe = objetcs;
		
		self.cities ={};
		self.showUnuse = false;
		self.factions = {0:{name:'None',id:0}};
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
		
		self.database = new DataBase();
		
	}
	
	load =  ()=>{
		
		const self = this;
		
		this.checkUpdate(()=>{

			
			self.getFaction();
			
			self.getScenario(()=>{
				self.selectScenario(self.scenarios[0]);			
				
			});
			
		});
		
	
		
	}
	
	checkUpdate =  (callback)=>{
		const self = this;
		
		this.database.getVersion((rows)=>{
			console.log(rows)
			if(rows.length == 0){
				self.download(callback);
			}
		});
	}
	
	download = async (callback) =>{
		await this.downloadScenario();
		
		
		callback();
	}
	
	downloadScenario = async () =>{
		
		
		const data = await fetch(this.host+"data/scenario")
    	const scenarios = await data.json();
		this.database.insertScenarios(scenarios)
		
	}
	
	 getScenario(callback){
		  var self = this;
		  console.log("getScenario")
	    	this.database.getScenarios((rows)=>{
	    			    		 
	    		self.scenarios = rows._array;
	    		rows._array.forEach(function(scenario){
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
			    	callback();
	    	});
	    	

		    	
		   
			
		}
		
		getRoad (scenario){
			var self = this;
			fetch(self.host+"data/road/scenario/"+scenario)
			.then(response => response.json())
		    .then(data => {		    
		    	
		    	self.roadMap = {};
		    	
		    	var lines = data;
		    	Object.entries(lines).forEach(([key, line]) => {
					
					self.roadMap[line.road] = line;
			 	});
				
				
				self.lineCoord = [];
				Object.entries(self.roadMap).forEach(([key, line]) => {
					
					
					if(self.cities[line.start] !== undefined && self.cities[line.end] !== undefined){

						if(self.cities[line.start].yn && self.cities[line.end].yn){
// line.type ='road';
							line.destinies = [{road:line,city:self.cities[line.start]},{road:line,city:self.cities[line.end]}];
							line.forces = [];
							
							self.cities[line.start].destinies.push({road:line,city:self.cities[line.end]});
							self.cities[line.end].destinies.push({road:line,city:self.cities[line.start]});

							self.lineCoord.push({start:self.cities[line.start],end:self.cities[line.end],waypoint:line.waypoint,type:line.type});
							
						}
					}
			 	});
				
				self.roads = self.globe.addLines(self.lineCoord);

				var interval = setInterval(function(){ 
					if(self.globe.loaded){
//						self.closeLoading();					
						 clearInterval(interval);
					}
				}, 1000);
		    	
		    });
			
		}
		
		
		
		
		
		
	async getFaction(){
		var self = this;
		
		const data  = await fetch(self.host+"data/faction")
    	var list = await data.json();
    	Object.entries(list).forEach(([key, faction]) => {
			
			faction.cities = [];
			faction.forces = [];
			faction.targeted = [];
			
			self.factions[faction.id] = faction;
	 	});
		
		
	}
	
		selectScenario (scenario){
			var self = this;
			
			self.selectedScenario=scenario;
			
			self.cities = {};
			
			self.cityMap = {};
			self.snapshotMap = {};
			self.cities = {};
			self.selectedFaction = 0;
			
			
			
//			self.startLoading();
			
			fetch(self.host+"data/scenarioCities/"+scenario.id)
			.then(response => response.json())
		    .then(data => {
		    	
		    	var list = data;
		    	self.data = [];
		    	self.activeFactions = {};
		    	self.region = {};

		    	Object.entries(list).forEach(([key, city]) => {
			 		
			 		var c = new City(city,self);
			 		
			 		self.cities[city.id] = c;
			 		
			 		
			 		self.data.push(c)
			 		
			 		self.cityMap[city.id] = c;
			 		self.snapshotMap[city.snapshot] = c;
			 		

			 		if(self.activeFactions[city.faction] === undefined && city.yn && city.faction !==0 &&self.factions[city.faction]!=undefined){
				 		self.activeFactions[city.faction] = self.factions[city.faction];	
				 		self.activeFactions[city.faction].cities = [];
					}
			 		if(self.activeFactions[city.faction] !== undefined && city.yn ){
			 			self.activeFactions[city.faction].cities.push(c);
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
		       
		       
		       
		       
		       self.addData(scenario);
		       
		       

		       self.citiesArray = Object.values(self.cities);

			  	
		       
			  	
			  	
		       	setTimeout(function(){
//		       		$('#faction li:first-child a').tab('show');
		       	},100);
			  	
			  	 
		    });
			
		}
		
		
		addData(scenario){
		
			var self = this;
			

//			self.globe = self.objects;

			var data = [];

			if(self.roads !== undefined){
				self.globe.remove(self.roads);						
			}
			
			Object.entries(self.objectMap).forEach(([key, city]) => {
			
				self.globe.remove(city.object);			
			});
			
			window.data.forEach(function(city){
				
				if(self.showUnuse || city.yn){
					data.push(city);
				}	
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
		
	
}