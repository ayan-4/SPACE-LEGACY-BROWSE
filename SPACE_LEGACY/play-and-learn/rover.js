import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
export function createRover(){
 const root=new THREE.Group();root.userData={speed:0,wheels:[],suspensions:[]};
 const mat=(c,m=0.35,r=.5)=>new THREE.MeshStandardMaterial({color:c,metalness:m,roughness:r});
 const ivory=mat(0xc9c9bd,.65,.38),dark=mat(0x20272b,.25,.75),gold=mat(0xb58a43,.7,.3),black=mat(0x111619,.1,.85),blue=new THREE.MeshStandardMaterial({color:0x38c9ed,emissive:0x087c9b,emissiveIntensity:.8});
 function box(w,h,d,x,y,z,m,parent=root){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
 // Chassis, equipment deck and thermal panels
 box(2.45,.62,3.05,0,1.25,0,ivory);
 box(2.15,.12,2.6,0,1.61,0,gold);
 for(let s of [-1,1]){box(.12,.35,2.5,s*1.18,1.3,0,dark);for(let i=0;i<5;i++)box(.035,.26,.32,s*1.25,1.32,-.95+i*.48,ivory)}
 // Instrument boxes
 box(.65,.42,.72,-.55,1.91,.2,dark);box(.55,.3,.65,.55,1.85,.25,gold);
 // Mast, sensor head and camera lenses
 const mast=new THREE.Mesh(new THREE.CylinderGeometry(.075,.1,1.35,12),dark);mast.position.set(0,2.5,-.85);root.add(mast);
 box(.95,.42,.55,0,3.18,-.85,ivory);
 for(let x of [-.3,0,.3]){const lens=new THREE.Mesh(new THREE.CircleGeometry(.105,20),blue);lens.position.set(x,3.2,-1.135);root.add(lens)}
 // Robotic arm approximation
 const arm=new THREE.Group();arm.position.set(-.8,1.65,-.9);root.add(arm);
 const seg=box(.13,.13,1.15,-.15,-.15,-.5,gold,arm);seg.rotation.x=-.35;
 const joint=new THREE.Mesh(new THREE.SphereGeometry(.16,16,12),dark);joint.position.set(-.15,-.15,-1.05);arm.add(joint);
 box(.35,.18,.35,-.15,-.2,-1.3,ivory,arm);
 // Six rocker-bogie wheels and articulated links
 for(const side of [-1,1]){
  for(const z of [-1.12,0,1.12]){
   const pivot=new THREE.Group();pivot.position.set(side*1.32,.64,z);root.add(pivot);
   const tire=new THREE.Mesh(new THREE.CylinderGeometry(.48,.48,.34,28,1),dark);tire.rotation.z=Math.PI/2;tire.castShadow=true;pivot.add(tire);
   for(let k=0;k<12;k++){const lug=new THREE.Mesh(new THREE.BoxGeometry(.37,.09,.075),black);lug.position.set(0,Math.cos(k*Math.PI/6)*.46,Math.sin(k*Math.PI/6)*.46);lug.rotation.x=k*Math.PI/6;pivot.add(lug)}
   const hub=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.37,20),gold);hub.rotation.z=Math.PI/2;pivot.add(hub);
   root.userData.wheels.push(pivot);
  }
  const beam=new THREE.Mesh(new THREE.BoxGeometry(.13,.13,2.5),gold);beam.position.set(side*1.05,.82,0);root.add(beam);
 }
 // antenna
 const ant=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.85,8),gold);ant.position.set(.85,2.3,.8);root.add(ant);
 return root;
}