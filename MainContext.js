import  React, { createContext } from 'react';
import { observable, computed, action } from 'mobx';

import Util from './Util.js';


class MainStore{

    unitSize = 82;
    debug = true

    @observable selectedCity={};
    @observable selectedScenario={};
    @observable selectedFaction = {};
    @observable year=0;
    @observable date=0;
    @observable speed=0;
    @observable  stage="load";
    @observable selectionList = []
    gameStarted = false


    data = {era:{},region:{}};

    jobs = [];
    originalSpeed = 1;
    movingUnit = {};
    buildingUnit = {};

    units = [];
    onBuild ={}

    constructor() {
    }

    @action
    setSelectedCity = (city)=>{
        this.selectedCity  = city;
    }

    @action
    setSelectedScenario = (scenario)=>{
        this.selectedScenario  = scenario;
    }

    @action
    setSelectedFaction = (faction)=>{
        this.selectedFaction  = faction;
    }

    @action
    setYear = (year)=>{
        this.year  = year;
    }

    @action
    setDate = (date)=>{
        this.date  = date;
    }

    @action
    setSpeed = (speed)=>{
        this.speed  = speed;
    }

    @action
    pause = ()=>{
        this.originalSpeed = this.speed;
        this.speed = 0;
    }
    @action
    resume = ()=>{
        this.speed= this.originalSpeed ;
    }

     @action
     setStage = (stage)=>{
        this.stage = stage;
     }

    @action
    setSelectionList = (selectionList)=>{
        this.selectionList = selectionList
    }

     move = (unit)=>{

        this.movingUnit= unit;
        this.pause();
        this.stage="choose";
        this.scene.current.rendered = false

     }

      build = (building,unit)=>{

        this.buildingUnit = unit;
         this.onBuild= building;
         this.pause();
         this.stage="build";
//         this.scene.current.rendered = false

      }

     redraw = ()=>{
        this.scene.current.rendered = false
     }

     removeUnit = (unit)=>{
        Util.arrayRemove(this.units,unit);
        this.scene.current.remove(unit)
     }

     addUnit = (unit) => {
         const city = unit.currentLocation;
         unit.initMoral();
         city.population-=unit.manpower;
         unit.explored = city.explored
         this.scene.current.addUnit(city.latitude,city.longitude,city.factionData.color,unit)
         this.units.push(unit);
     }

     getCoreData = ()=>{
        return {
            selectedFaction:this.selectedFaction.id,
            date:this.date.toJSON(),
            units : this.units.map(unit=>{
                return unit.getCoreData()
            })
        }
     }

     parseCoreData = (saved,data)=>{
        this.setDate(new Date(saved.date))
        this.setSelectedFaction(data.factions[saved.selectedFaction]);

        this.units = [];

        saved.units.forEach(unit=>{
            const u = new UnitData()
            u.parseCoreData(unit,data)
            this.units.push(u)
            const city = u.city
            this.scene.current.addUnitWithPosition(unit.position,city.factionData.color,u)
        })
     }

     checkHeroMaturity = ()=>{
        this.data.checkHeroMaturity(this.date)

     }

     moveObject = (p,o,s) =>{
        console.log("move")

        this.objects.move(p,o,s)
        this.scene.current.rendered = false
     }
}

export const mainStore = new MainStore();
export default mainStore;

