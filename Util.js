
 const Util = {
	

	 number :  (number) =>{
		 
		  if(number === undefined) return "";
		   
		  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");	    	
			
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
	


}
 
 
 export default Util