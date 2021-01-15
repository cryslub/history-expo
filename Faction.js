import { makeAutoObservable } from "mobx"
import { observable, computed, action } from 'mobx';

import Util from './Util.js';

import {FactionAI} from './AI.js';

import mainStore from './MainContext.js'

export default class Faction{

	constructor(faction) {
        this.id = faction.id;
        this.name = faction.name;
        this.color = faction.color;
        this.region = faction.region;
        this.area = faction.area;

	    this.cities = [];
        this.forces = [];
        this.targeted = [];

        this.ai = new FactionAI(this);

	}

    dailyJob(diff){

        if(mainStore.selectedFaction.id!=this.id){
            this.ai.dailyJob(diff)
        }
    }

    weeklyJob(diff){

        if(mainStore.selectedFaction.id!=this.id){
            this.ai.weeklyJob(diff)
        }
    }


    monthlyJob(diff){

        if(mainStore.selectedFaction.id!=this.id){
            this.ai.monthlyJob(diff)
        }
    }

}

