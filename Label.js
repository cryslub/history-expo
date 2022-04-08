
import mainStore from './MainContext.js'

class Label{
    constructor(city,type){
        this.top=-1000;
        this.left=-1000;
        this.name=city.name;
        this.placement=city.labelPosition;
        this.city=city;
        this.type=type;
        this.parent= false;
        this.position= new THREE.Vector3(0,0,0);
        this.added=false;
    }
    setParent= function(threejsobj) {
      this.parent = threejsobj;
    }
    updatePosition= function(show,camera,width,height) {
           if(this.parent) {
             this.position.copy(this.parent.position);
           }

           var coords2d = this.get2DCoords(this.position, camera,width,height);
           this.left = coords2d.x ;
           this.top = coords2d.y;
           if(mainStore.selectedFaction){
               let color = 'rgba(0,100,255,0)'
               if(this.city.factionData.id == mainStore.selectedFaction.id){
                   color = 'rgba(0,100,255,0.3)';
               }
               this.textColor = color;
           }

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
           if(this.city.object?.visible==false && !this.city.detail) this.added=false



  }
  get2DCoords= function(position, camera,width,height) {
    var vector = position.project(camera);
    vector.x = (vector.x + 1)/2 * width;
    vector.y = -(vector.y - 1)/2 * height;
    return vector;
  }
}

export default Label