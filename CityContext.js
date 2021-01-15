import  React, { createContext } from 'react';
import { observable, computed, action ,decorate} from 'mobx';

class CityStore{

    @observable city;
    @observable units = [];
    @observable number = 1;

    constructor() {
    }


    @action
    setNumber = (number) =>{
        console.log(number);
        this.number = number;
    }


    @action
    setUnits = (units)=>{
        this.units = units;
    }


    @action
    addUnit = (unit)=>{
        this.units.push(unit);
    }

}
export const cityStore = new CityStore();
export default cityStore;
