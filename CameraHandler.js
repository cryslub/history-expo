export default class CameraHandler{

	constructor(container,camera,mesh,options){
		
		this.camera = camera;
		this.mesh = mesh;
		this.container = container;
		this.options = options
		
		this.distance = 200;
		this.distanceTarget = 200;
		
		this.camera.position.z = this.distance;

	  this.mouse = { x: 0, y: 0 };
	  this.touch = { x: 0, y: 0 };

	  this.mouseOnDown = { x: 0, y: 0 };

	  this.rotation = { x: 0, y: 0};



	  this.target = { x: Math.PI*3/2, y: Math.PI / 6.0 };
	  this.targetOnDown =  { x: 0, y: 0 };

	  this.zoomMin = 105
	  this.zoomMax = 200

      if(options?.initialPoint){
        this.rotation = {x:(270 + options.initialPoint.long) * Math.PI / 180,y: options.initialPoint.lat/180 * Math.PI}
        this.moveCameraTo(options.initialPoint.lat,options.initialPoint.long,options.initialPoint.distance);
	  }


	  //  this.container.addEventListener('mousedown', this.onMouseDown, false);
	  //  this.container.addEventListener('mousewheel', this.onMouseWheel, false);
	  //   this.container.addEventListener('mousemove', this.onTouchMove, false);
	}
	
	
	
	handlePanResponderGrant = (event) => { 
		this.mousedown = true;
		


		this.touch.x = ( event.pageX / window.innerWidth ) * 2 - 1;
		this.touch.y = - ( event.pageY / window.innerHeight ) * 2 + 1;
		
	//	console.log(this.mouse.x+","+this.mouse.y)
		
		
	    this.mouseOnDown.x = - event.pageX;
	    this.mouseOnDown.y = event.pageY;

	    this.targetOnDown.x = this.target.x;
	    this.targetOnDown.y = this.target.y;
		
	}
	
	handlePanResponderMove = (event) =>  {
   	//if(this.mousedown){
	    this.mouse.x = - event.pageX;
	    this.mouse.y = event.pageY;
	
	    var zoomDamp = (this.distance*this.distance)/100000;
	
	    this.target.x = this.targetOnDown.x + (this.mouse.x - this.mouseOnDown.x) * 0.003 * zoomDamp;
	    this.target.y = this.targetOnDown.y + (this.mouse.y - this.mouseOnDown.y) * 0.003 * zoomDamp;
	
	    this.target.y = this.target.y > this.PI_HALF ? this.PI_HALF : this.target.y;
	    this.target.y = this.target.y < - this.PI_HALF ? - this.PI_HALF : this.target.y;
   // }
  }
	
	handlePanResponderEnd= (event) =>  {
		 //  this.container.removeEventListener('mousemove', this.onMouseMove, false);
		  //  this.container.removeEventListener('mouseup', this.onMouseUp, false);
		  //  this.container.removeEventListener('mouseout', this.onMouseOut, false);
		    
		  	this.mousedown = false;
		 
		   // this.container.style.cursor = 'auto';
		  }
	
  onMouseDown = (event) => { 
    event.preventDefault();
    
     //   this.container.addEventListener('mousemove', this.onMouseMove, false);
  //  this.container.addEventListener('mouseup', this.onMouseUp, false);
  //  this.container.addEventListener('mouseout', this.onMouseOut, false);
    

	this.mousedown = true;
    this.mouseOnDown.x = - event.clientX;
    this.mouseOnDown.y = event.clientY;

    this.targetOnDown.x = this.target.x;
    this.targetOnDown.y = this.target.y;

    //this.container.style.cursor = 'move';
  }

   onMouseMove = (event) =>  {
   	//if(this.mousedown){
	    this.mouse.x = - event.clientX;
	    this.mouse.y = event.clientY;
	
	    var zoomDamp = this.distance/1000;
	
	    this.target.x = this.targetOnDown.x + (this.mouse.x - this.mouseOnDown.x) * 0.005 * zoomDamp;
	    this.target.y = this.targetOnDown.y + (this.mouse.y - this.mouseOnDown.y) * 0.005 * zoomDamp;
	
	    this.target.y = this.target.y > this.PI_HALF ? this.PI_HALF : this.target.y;
	    this.target.y = this.target.y < - this.PI_HALF ? - this.PI_HALF : this.target.y;
   // }
  }
  
  onMouseUp = (event) =>  {
 //  this.container.removeEventListener('mousemove', this.onMouseMove, false);
  //  this.container.removeEventListener('mouseup', this.onMouseUp, false);
  //  this.container.removeEventListener('mouseout', this.onMouseOut, false);
    
  	this.mousedown = false;
 
   // this.container.style.cursor = 'auto';
  }

   onMouseOut = (event) =>  {
 //  this.container.removeEventListener('mousemove', this.onMouseMove, false);
 //   this.container.removeEventListener('mouseup', this.onMouseUp, false);
 //   this.container.removeEventListener('mouseout', this.onMouseOut, false);
    
  	this.mousedown = false;

  }
  
   onZoomEvent = (event) => {
	    this.zoom(Math.log(event.scale)*2);
	    return false;
	 }
   
  onMouseWheel = (event) => {
    event.preventDefault();
    //if (overRenderer) {
      this.zoom(event.wheelDeltaY * 0.1);
    //}
    return false;
  }

   
   onSingleTap = (event) =>{
		const x = event.pageX;
		const y = event.pageY;
		

		this.mouse.x = ( x / window.innerWidth ) * 2 - 1;
		this.mouse.y = - ( y / window.innerHeight ) * 2 + 1;
   }
  
  onDoubleTap = ()=> {
	  if(this.distanceTarget>150){ 
		 // console.log(this.distanceTarget);
		  this.distanceTarget = 120;
	        
		 }else if(this.distanceTarget<=150) this.distanceTarget = 300;
  }
  
  zoom =(delta) =>{

    this.distanceTarget -= delta;
    this.checkZoom();
  }
  
  checkZoom = ()=>{
	    this.distanceTarget = this.distanceTarget > this.zoomMax ? this.zoomMax : this.distanceTarget;
	    this.distanceTarget = this.distanceTarget < this.zoomMin  ? this.zoomMin : this.distanceTarget;
	  
  }
  
  zoomIn = ()=>{	  
	  this.zoom(Math.log(100)*2);
  }

  zoomOut = ()=>{	  
	  this.zoom(Math.log(0.01)*2);
  }

  
  setDistanceTarget = (distanceTarget)=>{
	  	this.distanceTarget = distanceTarget;
	    this.checkZoom();
}


  moveCameraTo = (lat,long,distance)=>{

	  this.target.x = (270 + long) * Math.PI / 180;
	  this.target.y = lat/180 * Math.PI  ;
	  if(distance == undefined){
		  this.distanceTarget = this.distanceTarget > 120 ? 120 : this.distanceTarget;
	  }else  this.distanceTarget = distance;
  }


  
  render(){
  
	this.rotation.x += (this.target.x - this.rotation.x) * 0.1;
	this.rotation.y += (this.target.y - this.rotation.y) * 0.1;
    this.distance += (this.distanceTarget - this.distance) * 0.3;

    if(this.options?.boundary){
        if(this.rotation.x>this.options.boundary.right) this.rotation.x = this.options.boundary.right
        if(this.rotation.x<this.options.boundary.left) this.rotation.x = this.options.boundary.left
        if(this.rotation.y>this.options.boundary.top) this.rotation.y = this.options.boundary.top
        if(this.rotation.y<this.options.boundary.bottom) this.rotation.y = this.options.boundary.bottom
    }

   // console.log(this.rotation.x+","+this.rotation.y)

    const position = this.camera.position

    const prev = {x:position.x,y:position.y,z:position.z}

    position.x = this.distance * Math.sin(this.rotation.x) * Math.cos(this.rotation.y);
    position.y = this.distance * Math.sin(this.rotation.y);
    position.z = this.distance * Math.cos(this.rotation.x) * Math.cos(this.rotation.y);

    //console.log(this.camera.position.x+","+this.camera.position.y+","+this.camera.position.z)

    this.camera.lookAt(this.mesh.position);

    if(prev.x != position.x) return true
    if(prev.y != position.y) return true
    if(prev.z != position.z) return true

    return false
  }
}
