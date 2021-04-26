import mainStore from './MainContext.js';

import addHours from 'date-fns/addHours'
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays'
import differenceInCalendarMonths from 'date-fns/differenceInCalendarMonths'
import differenceInCalendarWeeks from 'date-fns/differenceInCalendarWeeks'
import differenceInCalendarYears from 'date-fns/differenceInCalendarYears'




export default   function timer(data){

   if(mainStore.speed>0){

        const newDate = addHours(mainStore.date,mainStore.speed*6);
        const diff = differenceInCalendarDays( newDate,mainStore.date);
        const weekDiff = differenceInCalendarWeeks( newDate,mainStore.date);


        const monthDiff = differenceInCalendarMonths( newDate,mainStore.date);
        const yearlyDiff = differenceInCalendarYears( newDate,mainStore.date);


       mainStore.setDate(newDate);


       var array = mainStore.jobs;
       for (var i = array.length - 1; i > -1; i--) {
           const job = array[i];
          // console.log(job.remain);
           job.onJob(diff);

           if (job.remain <=0) {
               array.splice(i, 1);
               job.onDone();
           }
       }

       dailyJob(data,diff);
       weeklyJob(data,weekDiff);
       monthlyJob(data,monthDiff);
       annualJob(data,yearlyDiff);
   }
}

function dailyJob(data,diff){
    if(diff>0){
        data.data.forEach(city=>{
            city.dailyJob(diff);
        });
        mainStore.units.forEach(unit=>{
            unit.dailyJob(diff);
        })

         Object.keys(data.factions).forEach(key=>{
            const faction = data.factions[key];
            if(faction.id>0){
                if(faction.cities.length>0){
                    faction.dailyJob(diff);
                }
            }
        });
    }
}

function weeklyJob(data,diff){
    if(diff>0){
        data.data.forEach(city=>{
            city.weeklyJob(diff);
        });

        Object.keys(data.factions).forEach(key=>{
            const faction = data.factions[key];
            if(faction.id>0){
                if(faction.cities.length>0){
                    faction.weeklyJob(diff);
                }
            }
        });
    }
}



function monthlyJob(data,diff){
    if(diff>0){
        data.data.forEach(city=>{
            city.monthlyJob(diff);
        });

         Object.keys(data.factions).forEach(key=>{
            const faction = data.factions[key];
            if(faction.id>0){
                if(faction.cities.length>0){
                    faction.monthlyJob(diff);
                }
            }
        });
    }
}


function annualJob(data,diff){
    if(diff>0){
        mainStore.checkHeroMaturity()
    }
}