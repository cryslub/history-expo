import * as THREE from 'three';

export default class VariableObjects{

	constructor(scene,mesh,globe,container){
  
	  this.roadColors = {
		  "normal":new THREE.Color( 0xAB9B5D),
		  "water":new THREE.Color( 0xA2C5FF),
		  "high":new THREE.Color( 0x6E6957),
		  "mountain":new THREE.Color( 0x82A876),
		  "desert":new THREE.Color( 0xECB480) 
	  }
  
  
		this.scene = scene;
		this.mesh = mesh;
		this.globe = globe;
		this.container = container;
		
		this.objects =[];
		this.objectMap = {};
			
		this.totalSize = globe.totalSize;
	    this.radius =  globe.radius;    
	    
		this.textlabels = [];
		
	}
	
	
	vertex(point,radius) {
		if(point === undefined){
			console.log("point undefined");
			return null;
		}
	    var phi = (90 - point[1]) * Math.PI / 180;
	    var theta = (180 - point[0]) * Math.PI / 180;

	    var sphereSize = 200.1*this.totalSize;
		
	    if(radius !== undefined) sphereSize = radius;
	    
		  return new THREE.Vector3(
				  sphereSize * Math.sin(phi) * Math.cos(theta),
				  sphereSize * Math.cos(phi),
				  sphereSize * Math.sin(phi) * Math.sin(theta)
		  );		

	}
  
	
  addData(data) {
 
	  
	  var self = this;
	  this.textlabels.forEach(function(text){
		  if(text.added) self.container.removeChild(text.element); 
	  });
	  
	  this.textlabels = [];
	  
	  if( this._baseGeometry !== undefined){
//		  while (scene.children.length>8)
//		  {
//			  scene.remove(scene.children[8]);
//		  }
		  
	  }
	  
	  var  color;

    this.is_animated = false;


	self.objects = [];


    var subgeo = new THREE.Geometry();
    data.forEach(function(city){
        if(city.color === null){
        	color = new THREE.Color("#ffffff");        	
        }else{
        	color = new THREE.Color(city.color);
        
        }
        
        city.object = self.addPoint(city, city.population, color,subgeo);
        
        self.objects.push(city.object);
        self.objectMap[city.object.id] = city;	
         

    });

      this._baseGeometry = subgeo;

  }
  

  
   addPoint(city, size, color, subgeo) {

	
		var sphereSize = this.radius-0.1*this.totalSize;
		var geometry;
		
		if(size === 0){
			sphereSize = this.radius+0.1*this.totalSize
			geometry = new THREE.CylinderGeometry( 0.05*this.totalSize, 0.05*this.totalSize, 0.5*this.totalSize,16  );
			
		    
		}else{
			
			
			geometry = new THREE.BoxGeometry(1*this.totalSize, 1*this.totalSize, 0.3*this.totalSize);
			geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0,0,-0.5));
		}
		
		
	
		
		
	    var material = new THREE.MeshBasicMaterial( {color: color} );
	
		var point = new THREE.Mesh(geometry,material);
	
	
		if(size === 0){
		
			point.geometry.rotateX((-90 * Math.PI) / 180);
		// point.geometry.translate(0,0,-3);
	
			
		}else{
		    var scale = Math.cbrt(size*this.totalSize)/100;
		    scale = Math.max( scale, 0.3*this.totalSize );
		// scale = Math.sqrt(scale);
		    point.scale.x = scale;
		    point.scale.y = scale;
		    point.scale.z = Math.max( scale, 0.8*this.totalSize ); // avoid
																// non-invertible
																// matrix
		
		    
		
		    for (var i = 0; i < point.geometry.faces.length; i++) {
		      point.geometry.faces[i].color = color;
		    }
		    
		    
		    this.addDom(point,city.name,city.labelPosition);
	
		}
	
		
	    var phi = (90 - city.latitude) * Math.PI / 180;
	    var theta = (180 - city.longitude) * Math.PI / 180;
	
	    point.position.x = sphereSize * Math.sin(phi) * Math.cos(theta);
	    point.position.y = sphereSize * Math.cos(phi);
	    point.position.z = sphereSize * Math.sin(phi) * Math.sin(theta);
	
	    point.lookAt(this.mesh.position);
	    
	    
	    if(point.matrixAutoUpdate){
	      point.updateMatrix();
	    }
	    
	    this.scene.add(point);
	    
	    var geo = new THREE.EdgesGeometry( point.geometry );
	    var mat = new THREE.LineBasicMaterial( { color: 0x111111, linewidth: 1 } );
	    var wireframe = new THREE.LineSegments( geo, mat );
	    wireframe.renderOrder = 1; // make sure wireframes are rendered 2nd
	    point.add( wireframe );
	    
	    return point;
    
  }
  
  addLines(lines) {
	  
	  var self = this;
	  
	  var geo = new THREE.BufferGeometry();

	  var sphereSize = self.radius+0.2*self.totalSize;
	
	  var vertices = [];
	  var colors = [];
	  
	  lines.forEach(function(line){
		  
		  if(line.waypoint !== "" && line.waypoint !== null){
			  var waypoint = JSON.parse(line.waypoint);
			  
			  for(var i = 0;i<waypoint.length;i++){
				  if(i === 0){
					  self.addVertex(vertices,colors,self.globePoint(line.start.latitude,line.start.longitude,sphereSize),self.vertex(waypoint[0],sphereSize),line.type);
				  }else{
					  self.addVertex(vertices,colors,self.vertex(waypoint[i-1],sphereSize),self.vertex(waypoint[i],sphereSize),line.type);
				  }
			  }
			  self.addVertex(vertices,colors,self.vertex(waypoint[waypoint.length-1],sphereSize),self.globePoint(line.end.latitude,line.end.longitude,sphereSize),line.type);
			  
			  
		  }else{
			  self.addVertex(vertices,colors,self.globePoint(line.start.latitude,line.start.longitude,sphereSize),self.globePoint(line.end.latitude,line.end.longitude,sphereSize),line.type);
		  }
		  

	  });
	  
		var material = new THREE.LineBasicMaterial( {
		    color: 0xffffff,
		    vertexColors: THREE.VertexColors
		} );
	  
		
		var fvertices = new Float32Array(vertices);
		var fcolors = new Float32Array(colors);
		geo.setAttribute( 'position', new THREE.BufferAttribute( fvertices, 3 ) );
		geo.setAttribute( 'color', new THREE.BufferAttribute( fcolors, 3 ) );
		
		  var mesh  = new THREE.LineSegments(geo, material);
			self.scene.add( mesh);
			
		return mesh;

  }
  
   globePoint(lat, lng,sphereSize){
	    var phi = (90 - lat) * Math.PI / 180;
	    var theta = (180 - lng) * Math.PI / 180;
	
	    var point = {};
	    point.x = sphereSize * Math.sin(phi) * Math.cos(theta);
	    point.y = sphereSize * Math.cos(phi);
	    point.z = sphereSize * Math.sin(phi) * Math.sin(theta);
	    
	    return point;
  }
  
    addVertex(vertices,colors,start,end,type){
	  
	    vertices.push(start.x);
	    vertices.push(start.y);
	    vertices.push(start.z);

	    colors.push(this.roadColors[type].r);
	    colors.push(this.roadColors[type].g);
	    colors.push(this.roadColors[type].b);

	    vertices.push(end.x);
	    vertices.push(end.y);
	    vertices.push(end.z);

	    colors.push(this.roadColors[type].r);
	    colors.push(this.roadColors[type].g);
	    colors.push(this.roadColors[type].b);
	    
	}
	
	onMouseover(mouse,camera){
			 
		var self = this;
			// console.log(mouse.x);

	 		 var ret = self.getSelected(mouse,camera,function(clicked,selected){
	 			self.detail(selected,camera);
	 		});
	 		if(ret === false){
	 			self.detail();
	 		}
	 }
	 
	  getSelected(mouse,camera,callback){
		 
		  var self = this;
		  
		  var raycaster = new THREE.Raycaster();
		  raycaster.setFromCamera( mouse, camera );
		  
		  var intersects = raycaster.intersectObjects( self.objects );
		
		 self.clicked = [];
		 intersects.forEach( function(intersect){
		 	if(self.objectMap[intersect.object.id] !== undefined){
		 		self.clicked.push(self.objectMap[intersect.object.id]);
		 	}
		 });
		 
		 
		 if(self.clicked.length>0){
			 
			 callback(self.clicked,self.objectMap[intersects[0].object.id]);
			 
			 return true;
		 }
		 
		 return false;
	 }
	 
	 
	   detail(city,camera){
		 	
		  if(this.detailHtml === undefined){
			  this.detailHtml = this.createTextLabel();
			  
		      this.container.appendChild(this.detailHtml.element);
		  }	 
		  
		  if(city === undefined){
			  this.detailHtml.element.className = "text-hide";
			  return;
		  }
		  
		  this.detailHtml.element.className ="text-detail";
		  
		  var html = "<div><h5>"+city.name+"</h5>";
	
		  if(city.faction > 0){
			  html +="<strong>"+city.factionData.name+"</strong><br/>";
	
			  this.detailHtml.element.style.backgroundColor = city.factionData.color;
		  }else{
			  this.detailHtml.element.style.backgroundColor = "#000";
			  
		  }
		  if(city.population > 0){
			  html +="<span class='glyphicon glyphicon-user'> </span> "+(city.population);
		  }
		  
		  html 	+="</div>";
	
		  
		 
			  
		  this.detailHtml.setHTML(html);
		  this.detailHtml.setParent(city.object);
		  this.detailHtml.updatePosition(true,camera);
	
	  }
	  
	  
  	createTextLabel() {
  	
  		var self =this;
  	
	    var div = document.createElement('div');
	    div.className = 'text-label';
	    div.style.position = 'absolute';
	    div.style.width = 100;
	    div.style.height = 100;
	    div.innerHTML = "hi there!";
	    div.style.top = -1000;
	    div.style.left = -1000;
	    
	    
	    return {
	      element: div,
	      parent: false,
	      position: new THREE.Vector3(0,0,0),
	      added:false,
	      setHTML: function(html) {
	        this.element.innerHTML = html;
	      },
	      setParent: function(threejsobj) {
	        this.parent = threejsobj;
	      },
	      updatePosition: function(show,camera) {
	        if(this.parent) {
	          this.position.copy(this.parent.position);
	        }
	        
	        var coords2d = this.get2DCoords(this.position, camera);
	        this.element.style.left = coords2d.x + 'px';
	        this.element.style.top = coords2d.y + 'px';
	
	       
	        if(show!==true){
	        	var distance = this.parent.position.distanceTo(camera.position);
		        	
	        	var a = this.parent.scale.x / 0.3;
	        	
	        	if(distance < Math.pow(a,2) * 100){
		        	this.element.classList.remove("text-hide");
		        	if(!this.added) self.container.appendChild(this.element);
	             	this.added  = true;
	        	}else{
	        		this.element.classList.add("text-hide");
	        		if(this.added) self.container.removeChild(this.element); 
	             	this.added  = false;
	        		
	        	}
	        	
		        if(distance> 400){
	        		this.element.classList.add("text-hide");
	        		if(this.added) self.container.removeChild(this.element); 
	             	this.added  = false;
		        }
		        
	        }
	
		        	
	
	      },
	      get2DCoords: function(position, camera) {
	        var vector = position.project(camera);
	        vector.x = (vector.x + 1)/2 * window.innerWidth;
	        vector.y = -(vector.y - 1)/2 * window.innerHeight;
	        return vector;
	      }
	    };
	  } 
	    
	    
	  addDom(point,name,labelPosition){
			var text = this.createTextLabel();
			text.setHTML(name);
			text.setParent(point);
			this.textlabels.push(text);
			if(labelPosition ==='top'){
				text.element.classList.add("label-top")
			}
		//	container.appendChild(text.element);
	  }
	 
	 render(mouse,camera){
		 this.onMouseover(mouse,camera);
		 
		 for(var i=0; i<this.textlabels.length; i++) {
  	      	this.textlabels[i].updatePosition(false,camera);
    	 }
		 
		 
		 
	 }
	 
	remove(object){
	  this.scene.remove(object);
  	}
	 
	 
	
}