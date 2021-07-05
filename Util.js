import * as THREE from 'three';



 const Util = {
	

	 number :  (number) =>{
		 
		  if(number === undefined) return "";

		  return Math.floor(number).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			
	},
	isEmpty : (value,def)=>{
	    if(value == undefined){
	        if(def == undefined) return 0
    	    return def;
	    }
	    return value;
	},
    sum : (arr,key) =>{
    	if(Array.isArray( arr))
    		return arr.map(item => item[key]).reduce((prev, next) => prev + next)
    	return Object.keys(arr).map((k,i) => arr[k][key]).reduce((prev, next) => prev + next)
    	
    },
    hexToRgbA : (hex,opacity) =>{
	    var c;
	    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
	        c= hex.substring(1).split('');
	        if(c.length=== 3){
	            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
	        }
	        c= '0x'+c.join('');
	        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+opacity+')';
	    }
	    throw new Error('Bad Hex');
	},	
	hash : (list,key) =>{
		const map = {}
		list.forEach((item)=>{
			map[item[key]] = item;
		});		
		
		return map;
	},
	link : (link)=> {
		if(link !=='')
			window.open(link, "youtube")
	},
	getSize(max){
	   var height = window.outerHeight;
		var width = window.innerWidth;
		
		console.log(width+','+height)

		if(width>=960 ) {
			width = width-402;		
		}else{
			width = width-85;					
		}
		
		
		height-=150;
		
		if(max!==undefined){
			
			width = Math.min(max,width);
			height = Math.min(max,height);			
		}else{
			
			//height = width;
		}
		
		return {width:width,height:height}
   },
	makeHistory (arr){

		const history = {};
			
	   	arr.forEach(function(item) {
	   		if(history[item.person] === undefined){
	   			history[item.person] = {
	   					candidates:[],inspection:[],inspectionCount:{}};
	   		}
	   		history[item.person].candidates.push(item);
	   	});
	   	
	   	
	   	return history;
	},
	
    initMap(obj,key,init){
        if( obj[key]==undefined){
            obj[key] = init;
            return true;
        }

        return false;
    },
    arrayRemove(array,obj){
        for (var i = array.length - 1; i > -1; i--) {
            if(array[i] == obj){
                 array.splice(i, 1);
            }
        }
    },
    intDivide(source,mod){

        const n = source/mod;
        let result = Math.floor(n);
        if(n-result >0) result++;
        return result;
    },
    positiveSub(source,sub){
        source -= sub

        if(source<0){
            source = 0
        }
        return source
    },
    getDistance(lat1,lon1,lat2,lon2){
          const R = 6371e3; // metres
          const φ1 = lat1 * Math.PI/180; // φ, λ in radians
          const φ2 = lat2 * Math.PI/180;
          const Δφ = (lat2-lat1) * Math.PI/180;
          const Δλ = (lon2-lon1) * Math.PI/180;

          const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                    Math.cos(φ1) * Math.cos(φ2) *
                    Math.sin(Δλ/2) * Math.sin(Δλ/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

          const d = R * c; // in metres
          return d;
      },
    vertex(point) {
         const sphereSize =  200*0.5+0.2*0.5;

		if(point === undefined){
			console.log("point undefined");
			return null;
		}
	    var phi = (90 - point[1]) * Math.PI / 180;
	    var theta = (180 - point[0]) * Math.PI / 180;


		  return new THREE.Vector3(
				  sphereSize * Math.sin(phi) * Math.cos(theta),
				  sphereSize * Math.cos(phi),
				  sphereSize * Math.sin(phi) * Math.sin(theta)
		  );

	},

    aStar (unit,end){
        let start;
        if(unit.type=='city'){
            start = unit
        }else{
            if(unit.currentLocation!=undefined && unit.currentRoad==undefined){
                if(end.category!='unit'){
                    const result = unit.currentLocation.aStars[end.id]
                    if(result!=undefined){
                        return result
                    }
                }
            }

            start = unit.currentLocation;
            if(unit.currentRoad !=undefined){
                const line = unit.currentRoad;
                const road = line.road;

                start = {destinies:[
                    {city:road.destinies[0].city,cost:line.cost},
                    {city:road.destinies[1].city,cost:line.cost}
                ],
                id:0}
            }

             if(end.category=='unit'){
                if(end.currentRoad == undefined){
                    end = end.currentLocation;
                }else{
                    let s;
                    if(unit.currentRoad==undefined){
                        s = unit.currentLocation.object.position;
                    }else{
                        s = unit.object.position;
                    }
                    if(s.distanceTo(end.currentRoad.road.destinies[0].city.object.position) >s.distanceTo(end.currentRoad.road.destinies[1].city.object.position)){
                        end = end.currentRoad.road.destinies[1].city
                    }else{
                        end = end.currentRoad.road.destinies[0].city
                    }
                }
            }
        }


        if(start.aStars){
           const result = start.aStars[end.id]
           if(result!=undefined){
               return result
           }
        }


        const scores = {};
        scores[start.id] = {selected :true};

        let pivot = start;
        let selectedLength = 0;
        let selectedScore;
        do{


            pivot.destinies.forEach(destiny=>{
                const city = destiny.city;
                if(scores[city.id]==undefined){

                    const distance = end.getDistance(city);
                    const length = selectedLength+destiny.cost;
                    const score = length  + distance;

                    scores[city.id] = {length:length,score:score,city:city,selected:false,from:pivot}
                }
            })

            let bestScore = undefined;
            let bestKey = '';
            Object.keys(scores).forEach(key=>{
                const score = scores[key];
                if(!score.selected){
                    if(bestScore==undefined || score.score<bestScore){
                        bestScore = score.score;
                        bestKey = key;
                    }
                }
            })

            selectedScore = scores[bestKey]
            pivot = selectedScore.city;
            selectedLength = selectedScore.length;
            selectedScore.selected = true;
//            console.log(pivot.name)

        } while(pivot.id != end.id)

        const path = [end];
        let p = selectedScore;
        while(p.from.id != start.id){
            path.push(p.from);
            p = scores[p.from.id];
        }


        const result = {
            length:selectedLength,
            path : path.reverse(),
            end:end
        }

        if(start.aStars){
           if(end.category!='unit'){
               start.aStars[end.id] = result;
           }
        }


        return result;

    }

}
 
 
 export default Util