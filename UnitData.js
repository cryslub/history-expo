import { observable, computed, action } from 'mobx';
import * as THREE from 'three';


import mainStore from './MainContext.js';
import Util from './Util.js';
import {SubUnits} from './Common.js'


const maxWidth = mainStore.unitSize;

export default class UnitData extends SubUnits{

    @observable delay = 1;
    @observable  remain = 0;
    @observable state = 'deploy';
    @observable quantity = 1;
    @observable completedQuantity = 0;
    @observable equipments= {};
    @observable resources = {};
    @observable  selectedProduction = 0;
    @observable  selected= false;


    name = '';
    icon = '';
    data = {};
    subs = [];
    effort  =0;
    city ={};
    category='';
    goods = 0;
    waypointIndex = 0;
    pathIndex = 0;
    count=0;
    distanceFromLast = 0;
    pause = false;
    moral = 0;

    constructor(unit,city,sort) {

       super();

        this.name = unit.name;
        this.icon = unit.icon;
        this.color = unit.color;
        this.description = unit.description;
        this.type = unit.type;
        this.delay = unit.delay;
        this.remain = unit.delay;
        this.data = unit;
        this.city = city;
        this.category = unit.category;
        this.factionData = city.factionData;
        this.currentLocation = city;
        this.men = unit.manpower;
        this.sort = sort;
    }

    initProgress = ()=>{
        const production = this.getProduction();
        if(production != undefined){
            this.setProgress(production.delay);
         }
          this.effort = 0
    }

    onDone = ()=>{
        if(this.state == 'deploy'){
               this.setState('')
         }
    }

    getProduction = ()=>{
        let production = this.data.production;
        if(production == undefined) return undefined;
        if(Array.isArray(production)){
             production = production[this.selectedProduction]
        }
        return production;
    }


    onJob = ()=>{
        if(this.state == 'deploy'){
            this.setRemain(this.remain-0.25*mainStore.speed);
        }
        if(this.state == 'traveling' || this.state == 'fleeing'){
            this.travel();
         }


    }


    fighting = ()=>{

        let foes = this.getFoes(this.city.factionData.id)

        let city = undefined;

        if(this.blocked !=undefined){
            if(this.blocked.checkCollision(this) && this.blocked.sort != 'unit'){
                city = this.blocked
            }
        }


        if(city!=undefined){

            if(city.factionData.id == this.city.factionData.id ){
                this.blocked = undefined

            }else{

                city.units.forEach(unit=>{
                    foes = foes.concat(this.getSub(unit))
                })

                mainStore.units.forEach(unit=>{
                    if(unit.city.factionData.id == city.factionData.id){
                        if(unit.currentLocation.id==city.id && unit.currentRoad==undefined){
                             foes = foes.concat(this.getSub(unit))
                        }
                    }
                });
            }


        }


        let ret = this.attack(city,foes)

        if(city!=undefined){
            if(city.factionData.id == this.city.factionData.id){
                this.blocked = undefined

            }else{

                 if(city.buildings.wall.completedQuantity<=0){
                    city.buildings.wall.completedQuantity=0
                    city.buildings.wall.quantity = 0
                    this.annex(city)
                }

                 if(!ret){
                    this.annex(city)

                }
            }
        }

        if(city!=undefined || foes.length>0){
            this.state = 'fighting'
        }else{
            if(this.state == 'fighting')  this.state = 'waiting'
        }
    }

    attack = (city,foes)=>{
        let ret = true
        if(this.type=='group'){
            this.units.forEach(unit=>{
                if(unit.data.category=='army'){
                    ret = unit.attackInd(city,foes);
                }
            })
        }else{
            ret =  this.attackInd(city,foes);
        }
        return ret;
    }

    annex = (city)=>{
        this.state='waiting'
       // this.remain=0;
        city.annex(this.city.factionData);
        this.blocked = undefined
    }

    attackInd = (city,foes)=>{
        if(this.getTotalDamage()<=0) return;
        const damage = {
            piercing:this.getEffect('piercingDamage'),
            blunt:this.getEffect('bluntDamage'),
            slash:this.getEffect('slashDamage')};

        if(Math.random()>0.5 || city==undefined){
            return this.attackUnit(city,foes,damage)

        }else{
            this.attackWall(city,damage,2)
        }

        return true;
    }

    attackUnit = (foes,damage)=>{

        if(foes.length>0){
            const index = Math.floor(Math.random*foes.length)
            const foe = foes[index];

            this.attackIndUnit(foe,damage)
            return true;
        }else{
            return false;
        }

    }

    getFoes = (factionId)=>{
        let foes = []
        mainStore.units.forEach(unit=>{
            if(unit.city.factionData.id !=  factionId && unit.category=='army'){
                if( this.object.position.distanceTo(unit.object.position)<=0.2){
                     foes.push(unit)
                }else if(this.currentRoad==undefined && this.currentLocation.checkCollision(unit) ){
                     foes.push(unit)
                }
            }
        })

        return foes;
    }

    getSub = (unit)=>{
        const foes =[];
        if(unit.type=='group'){
            unit.units.forEach(unit=>{

                if(unit.getTotalDamage()>0){
                    foes.push(unit);
                }
            });
        }else{
              if(unit.getTotalDamage()>0){
                  foes.push(unit);
              }
       }

       return foes;
    }

    getTotalDamage = ()=>{
        const damage = this.getEffect('piercingDamage') + this.getEffect('slashDamage') + this.getEffect('bluntDamage')

        return damage;
    }


    attackIndUnit = (unit,damage)=>{

        if(unit.category=='army'){

           const d = Math.max(damage.piercing-unit.getEffect('piercingDefense'),0)
               +Math.max(damage.blunt-unit.getEffect('bluntDefense'),0)
               +Math.max(damage.slash-unit.getEffect('slashDefense'),0);

            if(d>0){

                if(unit.currentRoad!=undefined){
                    const city = unit.currentLocation;
                    d -= d*(Math.floor(city.getDefense())/city.getDefenseMax())*0.5
                }

                   ret = true;
                   d = Math.min(unit.men,d)
                   unit.men -= d
                   if(!unit.onDeploy()){
                        unit.city.population-=d
                   }
                   if(Math.floor(unit.men)<=0){
                        unit.dead();
                   }
           }
       }
    }

    dead = ()=>{
       Util.arrayRemove(this.city.units,this);
       if(this.onDeploy()){
            mainStore.removeUnit(this);
       }
       if(this.parent!=undefined){
            this.parent.removeUnit(this)
       }
    }

    attackWall = (city,damage,mod)=>{
        const d = Math.max(damage.piercing-5,0)+Math.max(damage.blunt-2,0)+Math.max(damage.slash-10,0);
        if(d>0){

            city.buildings.wall.completedQuantity -= (d*mod/100)
            city.buildings.wall.quantity -= (d*mod/100)


        }
    }

    dailyJob = (diff)=>{
      this.consumeFood(diff);
      if(this.getTotalDamage()>0){
         this.fighting();
       }
    }

    consumeFood = (diff)=>{
        const consume = this.manpower /100;

        const food = this.resources.food;
        let noFood = false;
        if(food==undefined){
             noFood = true;
        }else{
           this.resources.food -= consume;
           if(this.resources.food<0){
             this.resources.food = 0;
             noFood = true;
           }

        }

        if(noFood){
            if(this.currentLocation.factionData.id == this.city.factionData.id && this.currentRoad==undefined){
                const food = this.city.resources.food
                if(food){
                    this.city.resources.food -= consume;
                    noFood = false;
                }
            }
        }

        if(noFood){
            this.moral -= 5;
        }


        this.checkMoral();
    }

    checkMoral(){
        if(this.moral <=0){
            if(this.currentRoad==undefined && this.currentLocation.id == this.city.id){
                this.enter();
            }else{
                if(this.state!='fleeing'){

                    const result = Util.aStar(this,this.city);
                    this.startMove(result.path)
                    this.state='fleeing'
                }
            }
        }
        if(this.moral <-50){
            mainStore.removeUnit(this);
        }
    }

    checkCollision(unit){

        return this.object.position.distanceTo(unit.object.position) < 0.2
        //return ray.intersectsBox( box);
    }

    enter(){
        const unit = this;
         const city = unit.currentLocation;
        city.addUnit(unit);
        city.population += unit.manpower;
        unit.state=''

        mainStore.removeUnit(unit);
    }

    getMaxEffort = ()=>{
        return this.completedQuantity*this.delay;
    }

    @action setDelay = (delay)=>{
        this.delay = delay;
    }

    @action setRemain = (remain)=>{
        this.remain = remain;
    }

    @action setState = (state)=>{
        this.state = state;
    }

    @action setProgress = (delay)=>{
        this.delay = delay;
        this.remain = delay;
    }

    @action setQuantity = (quantity)=>{
        this.quantity = quantity;
    }

    @computed get width(){
        return this.remain*maxWidth/this.delay;
    }

    @action
    refreshEquipment(){
        this.equipments = Object.assign({}, this.equipments);
    }

    @action
    toggleSelected(){
        this.selected = !this.selected;
    }

    getEffect(key){
         let ret = 0;

        if(this.type=='group'){
            this.units.forEach(unit=>{
                ret += unit.getEffect(key)
            })
        }else{
            Object.keys(this.equipments).forEach(k=>{
                const equipment = this.equipments[k];
                if(equipment!=undefined){
                    const data = equipment.data;
                    if(data.effect[key]!=undefined){
                        ret += data.effect[key];
                    }
                }
            })
        }
        return ret;

    }

     @computed get capacity(){
        if(this.type=='group'){
            let capacity = 0;
            this.units.forEach(unit=>{
                capacity += unit.capacity;
            })
            return capacity
        }
        return this.data.capacity + this.getEffect('capacity');
    }

     @computed get speed(){

         const maxCapacity = this.capacity;
         const carrying = this.carrying();
        let speed = this.data.speed;

        if(this.type=='group'){
            let min = undefined;
            this.units.forEach(unit=>{
                if(unit.speed<min || min == undefined){
                    min = unit.speed;
                }
            })

            if(min==undefined){speed =0}
            else{speed=min}
        }
        if(speed == 0) return 0;
        if(maxCapacity==0) return speed;
        return speed-(maxCapacity==0?10:Math.floor((carrying/maxCapacity)*10));

     }

    @computed get totalFoods(){
        const food = this.resources.food
        if(food==undefined) return 0;

        return food;
    }

    @computed get manpower(){
        if(this.type=='group'){
            let manpower = 0;
            this.units.forEach(unit=>{
                manpower += unit.data.manpower;
            })
            return manpower;
        }else{
            return this.men;
        }

    }

    @computed get survivableDays(){
        let manpower = this.manpower;
        if(manpower == undefined || manpower ==0 ) return 0;
        return Math.floor(this.totalFoods/(manpower/100)) ;
    }

    @computed get nearByUnits(){
        const units = [];
        if(this.state=='') return units;
        mainStore.units.forEach(unit=>{
            if(unit!=this && unit.object.position.distanceTo(this.object.position)<0.2){
                units.push(unit)
            }
        })
        return units;
    }


     @computed get canTrade (){
        return this.state!='traveling'&&
            this.currentLocation.trade.length>0&&
            this.currentLocation.factionData.id!=mainStore.selectedFaction.id&&
            (this.type=='merchant' || this.hasUnit('merchant'))
    }

    carrying(){
        let ret =  0;

        Object.keys(this.resources).forEach(key=>{
            const resource = this.resources[key];
            if(resource!=undefined){
                    ret += resource;
            }
        })

        ret += this.getEffect('weight');

        return ret;

    }

    calculateProduction(){
       const production = this.data.production;
       if(production){
            const to = Math.floor((production.delay*this.quantity)/this.units.length);
            const diff = to - this.delay;
            this.delay = to;
            this.remain += diff;
            if(this.remain<0)this.remain=0;
       }
    }

    addUnit(unit){

       this.units.push(unit);
     //  this.calculateProduction();
    }

    addGroup(unit){
        unit.inGroup = true;
        unit.parent = this;
        this.city.removeUnit(u);
        this.units.push(u);
    }


    removeUnit(unit){
        Util.arrayRemove(this.units,unit);
        if(this.type=='group'&&this.units.length==0) {
           if(this.onDeploy()){
                mainStore.removeUnit(this);
           }
       }
         this.refreshUnits()
      // this.calculateProduction();

    }

    addResource(key,quantity){

        quantity = Math.floor(quantity);
        Util.initMap(this.resources,key,0)

        this.resources[key] += Math.floor(quantity);


        this.refreshResource();
        return quantity;
    }

    consumeResource(key,quantity){
        if(this.resources[key] == undefined ) return 0;
        const consume = Math.min(Math.floor(quantity),this.resources[key]);
        this.resources[key]  -=consume;

        if(this.resources[key]<=0) delete this.resources[key];
        this.refreshResource();
        return consume;
    }


    @action
    refreshResource(){
        this.resources = Object.assign({}, this.resources);
    }

    @action
    setSelectedProduction(selectedProduction){
        this.selectedProduction = selectedProduction;
    }


    startMove(path,destination){
        this.destination = destination;
        this.path = path;
        this.state ='traveling'
        this.remain = 1;
        this.city.removeUnit(this);
        this.pathIndex =0;
        this.pause = false;

         if(this.currentRoad !=undefined){
            const line = this.currentRoad;
            const road = line.road;
            const target = this.path[0];
            if(this.currentLocation.id==target.id){
                if(target.id== road.start){
                    this.currentLocation = road.destinies[1].city;
                }else{
                    this.currentLocation = road.destinies[0].city;
                }


                if(road.waypoint !== "" && road.waypoint !== null){
                    const waypoint = JSON.parse(road.waypoint);
                    this.waypointIndex = waypoint.length - this.waypointIndex;
                }
            }
         }
         if(!mainStore.jobs.includes(this)){
            mainStore.jobs.push(this)
         }
    }


    hasArmy = ()=>{
        return (this.data.category=='army' ||this.units.some(unit=>{
            return unit.data.category=='army'
        }));
    }

    nextPath = (target)=>{
        this.currentLocation = target;
        this.pathIndex++;
        this.initPath();
    }

    initPath = ()=>{
        if(this.currentRoad!=undefined)
            Util.arrayRemove(this.currentRoad.road.units,this);
        this.currentRoad = undefined
        this.distanceFromLast =0;
    }


    travel = ()=>{
         if( this.pause) return;
        this.target = this.path[this.pathIndex];
        let line;
        if(this.currentRoad == undefined){
            this.currentLocation.destinies.forEach(destiny=>{
                if(destiny.city.id==this.target.id){
                    line = destiny;
                    return false;
                }
            });
        }else{
            line = this.currentRoad;
        }

        const road = line.road
        if(road==undefined) return;

        this.currentRoad = line;
        road.units.push(this)

        let t = this.target.object.position;
        let waypoint;


        this.blocked = undefined;
        if(road.waypoint !== "" && road.waypoint !== null){
             waypoint = JSON.parse(road.waypoint);
             if(road.end == this.currentLocation.id){
                waypoint.reverse()
             }
             if(this.waypointIndex==waypoint.length){
                t = this.target.object.position;
                this.blocked = this.target
             }else{
                t = Util.vertex(waypoint[this.waypointIndex]);
             }
        }else{
            this.blocked = this.target
        }

        if(this.currentRoad != undefined){
            this.currentRoad.road.units.forEach(unit=>{
                if(unit.object.position.distanceTo(this.object.position)<0.2 && unit != this){
                    if(unit.hasArmy()){
                        this.blocked = unit;
                    }
                }
            })
        }

        if(this.target.factionData.id==this.city.factionData.id||(this.target.factionData.id==0&&this.target.population==0)||!this.hasArmy()){
            this.blocked = undefined
        }

        let speed = (this.speed/256)*mainStore.speed;
        if(road.type=='mountain'){
            speed = speed*(2/3)
        }

        this.distanceFromLast += (this.speed*1000*mainStore.speed)

        const object = this.object

        if(this.blocked!= undefined && object.position.distanceTo(t) < speed*2){
             var collisionResults;
            do{
                if(!this.move(t,0.015)) break;
                collisionResults = this.blocked.checkCollision(this)
            }while(!collisionResults)

            this.state='waiting';
            this.pathIndex =0;

            //this.endTravel();

        }else{
            if(this.destination!=undefined && this.pathIndex ==this.path.length-1 &&this.object.position.distanceTo(this.destination) <speed){
                this.move(t,this.object.position.distanceTo(this.destination)-0.2)
                this.endTravel();
            }else{
                if(!this.move(t,speed)){
                    if(waypoint==undefined){
                        this.nextPath(this.target);
                    }else{
                        this.waypointIndex++
                        if(this.waypointIndex>waypoint.length){
                            this.waypointIndex = 0;
                            this.nextPath(this.target);
                        }
                    }

                    if(this.pathIndex>=this.path.length){
                        this.endTravel();
                    }
                }
            }
        }
    }

    onDeploy(){
        return this.state == 'waiting' || this.state == 'traveling' || this.state == 'fighting'
    }

    endTravel(){
        this.state='waiting';
        this.pathIndex =0;
//        this.remain = 0;
        this.initPath();
    }
    move(position,speed){

           const object = this.object;

            return mainStore.objects.move(position,object,speed);

     }

    toggleStop(){
        this.pause = !this.pause;
    }

    checkCapacity = ()=>{
        let i =0;
        const city = this.currentLocation;
        if(Object.keys(this.resources).length>0){
            while( this.capacity<this.carrying()){
                const key = Object.keys(this.resources)[i];
                const quantity = this.carrying()-this.capacity;
                const consume = this.consumeResource(key,quantity);
                city.addResource(key,consume);
                i++
            }
        }
     }

     hasUnit(type){
        return this.units.some(unit=>{return unit.type==type});
     }



}