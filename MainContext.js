import  React, { createContext } from 'react';
import { observable, computed, action } from 'mobx';

import Util from './Util.js';


class MainStore{

    unitSize = 82;

    @observable selectedCity={};
    @observable selectedScenario={};
    @observable selectedFaction = {};
    @observable year=0;
    @observable date=0;
    @observable speed=1;
    @observable  stage="start";




    jobs = [];
    originalSpeed = 1;
    movingUnit = {};
    units = [];

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

     move = (unit)=>{
        this.movingUnit= unit;
        this.pause();
        this.stage="choose";
     }

     removeUnit = (unit)=>{
        Util.arrayRemove(this.units,unit);
        this.scene.current.remove(unit)
     }

     addUnit = (unit) => {
         const city = unit.currentLocation;
         unit.initMoral();
         city.population-=unit.manpower;

         this.scene.current.addUnit(city.latitude,city.longitude,city.factionData.color,unit)
         this.units.push(unit);
     }
}

export const mainStore = new MainStore();
export default mainStore;

