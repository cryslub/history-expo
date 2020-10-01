import * as THREE from 'three';

import Colors from "./Colors.js"

export default class VariableObjects{

	constructor(scene,mesh,globe,container){
  
		this.changeTheme('natural')
  
  
		this.scene = scene;
		this.mesh = mesh;
		this.globe = globe;
		this.container = container;
		//this.setTextLabels = setTextLabels;
		
		this.objects =[];
		this.objectMap = {};
			
		this.totalSize = globe.totalSize;
	    this.radius =  globe.radius;    
	    
		this.textlabels = [];
		this.detail();
	}
	
	changeTheme = (theme) => {
		this.theme = theme;
		this.roadColors = {
			  "normal":new THREE.Color( Colors[this.theme].road.normal),
			  "water":new THREE.Color( Colors[this.theme].road.water),
			  "high":new THREE.Color( Colors[this.theme].road.high),
			  "mountain":new THREE.Color( Colors[this.theme].road.mountain),
			  "desert":new THREE.Color( Colors[this.theme].road.desert) 
		  }
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
        
        city.object = self.makePoint(city, city.population, color);
        
        subgeo.merge(city.object.geometry, city.object.matrix);
        self.scene.add(city.object);
        
        self.objects.push(city.object);
        self.objectMap[city.object.id] = city;	
         

    });

      this._baseGeometry = subgeo;
      
     // this.setTextLabels(this.textlabels)

  }
  

  makePoint(city, size, color){
	  	var sphereSize = this.radius-0.1*this.totalSize;
		var geometry;
		
		if(size === 0){
			sphereSize = this.radius+0.1*this.totalSize
			geometry = new THREE.CylinderGeometry( 0.1*this.totalSize, 0.1*this.totalSize, 0.5*this.totalSize,16  );
			
		    
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
		    scale = Math.max( scale, 0.5*this.totalSize );
		// scale = Math.sqrt(scale);
		    point.scale.x = scale;
		    point.scale.y = scale;
		    point.scale.z = Math.max( scale, 0.8*this.totalSize ); // avoid
																// non-invertible
																// matrix
		
		    
		
		    for (var i = 0; i < point.geometry.faces.length; i++) {
		      point.geometry.faces[i].color = color;
		    }
		    
		    
		    this.addDom(point,city);
	
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
	    
	    
	    var geo = new THREE.EdgesGeometry( point.geometry );
	    var mat = new THREE.LineBasicMaterial( { color: 0x111111, linewidth: 1 } );
	    var wireframe = new THREE.LineSegments( geo, mat );
	    wireframe.renderOrder = 1; // make sure wireframes are rendered 2nd
	    point.add( wireframe );
	    
	    return point;
  }
  

  makeSelectPoint(city, size, color){
	  	var sphereSize = this.radius-0.1*this.totalSize;
		var geometry;
		
		if(size === 0){
			sphereSize = this.radius+0.1*this.totalSize
			geometry = new THREE.CylinderGeometry( 0.1*this.totalSize, 0.1*this.totalSize, 0.5*this.totalSize,16  );
			
		    
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
		    scale = Math.max( scale, 0.5*this.totalSize );
		// scale = Math.sqrt(scale);
		    point.scale.x = scale;
		    point.scale.y = scale;
		    point.scale.z = Math.max( scale, 0.8*this.totalSize ); // avoid
																// non-invertible
																// matrix
		
		    
		
		    for (var i = 0; i < point.geometry.faces.length; i++) {
		      point.geometry.faces[i].color = color;
		    }
		    
		    
		    this.addDom(point,city);
	
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
	    
	    	    
	    return point;
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
		    
		    
		    this.addDom(point,city);
	
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
	  
	  self.lines = lines;
	  
	  if(this.roads !=undefined) this.remove(this.roads)
	  
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
			
		this.roads = mesh;
		
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
	 
	 
	   detail(city){
		 	
		  if(this.detailHtml === undefined){
			  this.detailHtml = this.createTextLabel();			  
		  }	 
		  
		  if(city === undefined){
//			  this.detailHtml.element.className = "text-hide";
			  this.detailHtml.added = false;
			  return;
		  }
		  
//		  this.detailHtml.element.className ="text-detail";
		  this.detailHtml.name = city.name;
		  this.detailHtml.added = true;
		  this.detailHtml.factionName=city.factionData.name;
		  
		  this.detailHtml.population = city.population;
		  
		  if(city.faction > 0){
			  this.detailHtml.color = city.factionData.color;
		  }else{
			  this.detailHtml.color = 'black'
		  }
		  
		 
			  
//		  this.detailHtml.setHTML(html);
		  this.detailHtml.setParent(city.object);
		 
		  
	  }
	  
	  
  	createTextLabel(city) {
  	
  		var self =this;
  		
  		if(city===undefined) city = {};
	    
	    return {
	    	top:-1000,
	    	left:-1000,
	    	name:city.name,
	    	placement:city.labelPosition,
	    	city:city,
	    	parent: false,
	    	position: new THREE.Vector3(0,0,0),
	    	added:false,
	    	setParent: function(threejsobj) {
	          this.parent = threejsobj;
	        },
	        updatePosition: function(show,camera) {
	        if(this.parent) {
	          this.position.copy(this.parent.position);
	        }
	        
	        var coords2d = this.get2DCoords(this.position, camera);
	        this.left = coords2d.x ;
	        this.top = coords2d.y;
	        
	        
	       
	        if(show!==true){
	        	var distance = this.parent.position.distanceTo(camera.position);
		        	
	        	var a = this.parent.scale.x / 0.3;
	        	
	        	if(distance < Math.pow(a,2) * 100){
	             	this.added  = true;
	        	}else{
	             	this.added  = false;
	        		
	        	}
	        	
		        if(distance> 400){
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
	    
	    
	  addDom(point,city){
			var text = this.createTextLabel(city);
			text.setParent(point);
			this.textlabels.push(text);
		
	  }
	 
	 render(mouse,camera){
		 
		 for(var i=0; i<this.textlabels.length; i++) {
  	      	this.textlabels[i].updatePosition(false,camera);
    	 }
		// this.setTextLabels(this.textlabels)
		 if(this.detailHtml!=undefined)
			 this.detailHtml.updatePosition(true,camera);
		 return {textlabels:this.textlabels,detail:this.detailHtml}
		 
	 }
	 
	remove(object){
	  this.scene.remove(object);
  	}
	 
	 
	
}