
export default class City{
	constructor(city,$scope) {
		
		
		this.scope = $scope;
		this.governer = 0;
		

		this.id = city.id;
		this.yn = city.yn;
		this.cityType = city.type;

		this.snapshot = city.snapshot;
		this.year = city.year;
		this.scenario = city.scenario;
		this.scenarioCity = city.scenarioCity;

		this.color = city.color;
		this.faction = city.faction;
		this.factionData = $scope.factions[city.faction];
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
		this.traits = [];
		this.sub = [];
 		//this.mustering = new Mustering(this);
		
		this.buildings = {};
		this.weapons = {};
		this.heroes = [];
		this.soldierClasses = {};
		this.nameImage = {};
 		
		this.ai = {workerShortage:false};
		
		
 	
 					 		
 		//this.makeBlockSize();
 		
 		//this.makeMaxBlockSize();
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
	
	makeBlockSize(){
		var size = 0;
		
		
		this.totalBuildingSize =  size;
	}
	
	makeMaxBlockSize(){
		this.maxBuildingSize =  Math.floor(Math.sqrt(this.population)*2);
		// 		return Math.pow(Math.floor(Math.sqrt(city.population)/10),2) + 10;
	}

	getRecruitMax(){
		var city = this;
		
		if(city !== undefined){
			var max = city.population/100;
			max = max*city.loyalty/100;
			var governer = this.scope.heroes[this.governer];
			if(governer!==undefined)
				max *= 1+0.1*governer.authority;
			max = Math.floor(max);
			return max < (city.mans - city.soldiers)?max:(city.mans - city.soldiers);
		}
		
		return 0;
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

	build(type){
		
		var self = this;
		
		this.idle -= this.scope.buildings[type].builders;
		this.silver -= this.scope.buildings[type].silver;

		this.buildings[type].building = true;
		
		var job =  {
			fn:function(){
				self.buildings[type].amount ++;
				self.idle += self.scope.buildings[type].builders;
				self.buildings[type].building = false;
				
				self.buildings[type].jobs.shift();
				
				self.calculateBuildingBonus();

			},
			exec:function(){
				
				var delay = self.getOptions('delay');
				var wisdom = 0;
				var governer = self.scope.heroes[self.governer];
				if(governer!==undefined)
					wisdom = 	governer.wisdom;
				this.delay -= 1+0.1*wisdom+0.01*delay;
				this.delay++;
			},
			delay:self.buildings[type].delay
		};

		this.totalBuildingSize += this.scope.buildings[type].size;

		this.buildings[type].jobs.push(job);
		
		return job;
		
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
	
	dailyJob(){

		if(this.garrison > 0){

			this.food -= Math.floor((this.garrison+this.workers)/10);
			
			var consume = this.getOptions('foodConsume');
			this.food -= consume;
			
			if(this.food<=0){
				this.mans +=(this.garrison+this.workers);
				this.garrison = 0;				
				this.workers = 0;
				this.idle = 0;
				this.food = 0;
				

			}
		}
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
	
}

