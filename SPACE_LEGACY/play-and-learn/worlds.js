import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
export function buildWorld(kind){
 const g=new THREE.Group(),mars=kind==='mars';
 const terrainMat=new THREE.MeshStandardMaterial({color:mars?0x8f4933:0x777b82,roughness:1});
 const geo=new THREE.PlaneGeometry(300,300,150,150),p=geo.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getY(i);let h=Math.sin(x*.055)*Math.cos(z*.047)*1.2+Math.sin((x+z)*.023)*2.2+Math.cos(x*.13)*Math.sin(z*.12)*.22;p.setZ(i,h)}
 geo.computeVertexNormals();const ground=new THREE.Mesh(geo,terrainMat);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;g.add(ground);
 // Background horizon and sky
 const sky=new THREE.Mesh(new THREE.SphereGeometry(500,32,20),new THREE.MeshBasicMaterial({color:mars?0x492b31:0x111a2a,side:THREE.BackSide}));g.add(sky);
 const rockMat=new THREE.MeshStandardMaterial({color:mars?0x63382d:0x555b62,roughness:1});
 const obstacles=[];
 // Large boulders are solid obstacles; small pebbles are visual surface detail.
 for(let i=0;i<115;i++){
  const a=Math.random()*Math.PI*2,r=12+Math.random()*125,s=.35+Math.random()*(i%5===0?2.5:.8);
  const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(s,1),rockMat);rock.position.set(Math.cos(a)*r,s*.55,Math.sin(a)*r);rock.scale.set(1,.55+Math.random()*.5,.9);rock.rotation.set(Math.random(),Math.random(),Math.random());rock.castShadow=true;rock.receiveShadow=true;g.add(rock);
  if(s>1.05)obstacles.push({x:rock.position.x,z:rock.position.z,r:s*.9});
 }
 // distant ridges
 for(let j=0;j<7;j++){const ridge=new THREE.Mesh(new THREE.ConeGeometry(13+Math.random()*12,8+Math.random()*15,7),rockMat);ridge.position.set((Math.random()-.5)*210,5,(Math.random()-.5)*210);ridge.scale.z=1.7;g.add(ridge)}
 const pickups=[],discoveries=[];
 for(let i=0;i<42;i++){const x=(Math.random()-.5)*190,z=(Math.random()-.5)*190;const type=i%4===0?'crystal':'data';const color=type==='crystal'?0x36e7ff:0x7dff9b;const o=new THREE.Mesh(new THREE.OctahedronGeometry(.42),new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:1.4}));o.position.set(x,1.1,z);o.userData={type,baseY:1.1};g.add(o);pickups.push(o)}
 const items=mars?[
 ['Spirit rover exhibit','Spirit explored Gusev Crater and found evidence of past water-altered environments.','Spirit landed in January 2004 and operated far beyond its planned 90-sol mission.'],
 ['Opportunity rover exhibit','Opportunity examined rocks and soils that revealed ancient watery conditions.','Opportunity operated for nearly 15 years; NASA ended the mission in 2019.'],
 ['Perseverance sample system','Perseverance studies Jezero Crater and collects rock and regolith samples.','Perseverance landed on Mars in February 2021.'],
 ['Ancient river delta','Layered sediments in Jezero preserve clues about an ancient lake and river delta.','Jezero Crater was selected partly because it once held a lake.'],
 ['Mars meteorite station','Meteorites help scientists compare planetary materials and understand Mars.','A small number of meteorites found on Earth originated on Mars.'],
 ['Ingenuity helicopter','Ingenuity demonstrated powered, controlled flight on another planet.','Ingenuity completed 72 flights before its mission ended in 2024.']
 ]:[
 ['Apollo 15 lunar rover exhibit','The Lunar Roving Vehicle let astronauts travel farther across the lunar surface.','Apollo 15 was the first mission to use the Lunar Roving Vehicle, in 1971.'],
 ['Surveyor 3 exhibit','Surveyor 3 landed on the Moon and returned images and surface data.','Apollo 12 astronauts visited Surveyor 3 in 1969.'],
 ['Lunar module descent stage','The descent stage helped land astronauts on the Moon and remained there.','Apollo lunar module descent stages were left on the lunar surface.'],
 ['Apollo footprint learning exhibit','This marked zone is an educational exhibit about Apollo-era footprints.','It is not the exact location or a replica of Neil Armstrong’s footprint.'],
 ['ALSEP experiment exhibit','Apollo surface experiments measured properties of the lunar environment.','Some Apollo experiments transmitted data for years after astronauts left.'],
 ['Lunar sample station','Apollo crews collected lunar rocks and soil for analysis on Earth.','Apollo lunar samples still support scientific research.']
 ];
 items.forEach((it,i)=>{const a=i*Math.PI/3,x=Math.cos(a)*30,z=Math.sin(a)*30;const plinth=new THREE.Mesh(new THREE.CylinderGeometry(1,1.2,2.2,12),new THREE.MeshStandardMaterial({color:0x9ba9ad,metalness:.55,roughness:.45}));plinth.position.set(x,1.1,z);plinth.castShadow=true;g.add(plinth);const beacon=new THREE.Mesh(new THREE.SphereGeometry(.34,16,12),new THREE.MeshBasicMaterial({color:0x38ddff}));beacon.position.set(x,2.55,z);g.add(beacon);discoveries.push({id:i,title:it[0],description:it[1],fact:it[2],position:plinth.position})});
 g.userData={pickups,discoveries,obstacles};return g;
}