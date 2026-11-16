import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import RAPIER from 'https://cdn.jsdelivr.net/npm/@dimforge/rapier3d-compat@0.17.3/+esm';
import { createRover } from './rover.js';
import { buildWorld } from './worlds.js';

await RAPIER.init();
const canvas=document.querySelector('#scene');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5)); renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene(); const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.1,700);
scene.add(new THREE.HemisphereLight(0xc7dcff,0x574034,1.8));
const sun=new THREE.DirectionalLight(0xffe6cb,2.4); sun.position.set(-35,65,25); sun.castShadow=true; sun.shadow.mapSize.set(1024,1024); scene.add(sun);
const $=id=>document.getElementById(id); const keys={};
let worldName='mars',group,rover,physics,body,third=true,discoveries=[],pickups=[],scanned=new Set(),xp=0,data=0,crystals=0,scanCount=0;
let drag=false,lastX=0,lastY=0,orbit=0,pitch=0;
const saved=JSON.parse(localStorage.getItem('spaceLegacyPlay')||'{}'); xp=saved.xp||0; data=saved.data||0;
function toast(msg){$('toast').textContent=msg;$('toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').classList.remove('show'),2200)}
function hud(){ $('xp').textContent=String(xp).padStart(3,'0'); $('data').textContent=data; $('discoveries').textContent=`${scanned.size} / 6`; $('worldName').textContent=worldName.toUpperCase(); $('missionProgress').style.width=Math.min(100,crystals*10+scanCount*25)+'%'; localStorage.setItem('spaceLegacyPlay',JSON.stringify({xp,data})); }
function addFixedBox(x,y,z,hx,hy,hz){const rb=physics.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(x,y,z));physics.createCollider(RAPIER.ColliderDesc.cuboid(hx,hy,hz).setFriction(1.1),rb)}
function createPhysics(){
 physics=new RAPIER.World({x:0,y:-9.81,z:0}); physics.timestep=1/60;
 const floor=physics.createRigidBody(RAPIER.RigidBodyDesc.fixed());
 physics.createCollider(RAPIER.ColliderDesc.cuboid(130,.25,130).setTranslation(0,-.25,0).setFriction(1.3),floor);
 // Fixed colliders for large boulders and educational exhibit stands.
 for(const o of group.userData.obstacles||[]) addFixedBox(o.x,Math.max(.5,o.y||.8),o.z,o.r||1,.8,o.r||1);
 for(const d of discoveries) addFixedBox(d.position.x,1.1,d.position.z,1.05,1.1,1.05);
 const desc=RAPIER.RigidBodyDesc.dynamic().setTranslation(0,1.25,8).setLinearDamping(1.35).setAngularDamping(3.0).setCanSleep(false);
 body=physics.createRigidBody(desc);
 physics.createCollider(RAPIER.ColliderDesc.cuboid(1.08,.58,1.42).setMass(95).setFriction(1.15).setRestitution(.015),body);
}
function loadWorld(name){if(group)scene.remove(group);worldName=name;group=buildWorld(name);scene.add(group);discoveries=group.userData.discoveries;pickups=group.userData.pickups;scanned=new Set();crystals=0;scanCount=0;createPhysics();rover=createRover();group.add(rover);$('worldMoon').classList.toggle('active',name==='moon');$('worldMars').classList.toggle('active',name==='mars');$('missionTitle').textContent=name==='moon'?'LUNAR FIELD SURVEY':'MARS GEOLOGY EXPEDITION';$('missionText').textContent='Collect 5 crystals and scan 2 science exhibits.';hud();toast(name.toUpperCase()+' PHYSICS SIMULATION READY');}
loadWorld('mars');
function syncVisual(){const t=body.translation(),q=body.rotation();rover.position.set(t.x,t.y-1.15,t.z);rover.quaternion.set(q.x,q.y,q.z,q.w);}
function nearest(){let best=null,dist=5;const t=body.translation();for(const d of discoveries){if(scanned.has(d.id))continue;const n=Math.hypot(t.x-d.position.x,t.z-d.position.z);if(n<dist){dist=n;best=d;}}return best;}
function scan(){const d=nearest();if(!d){toast('NO SCANNABLE OBJECT IN RANGE');return;}scanned.add(d.id);scanCount++;xp+=50;data++;$('scanTitle').textContent=d.title;$('scanDescription').textContent=d.description;$('scanFact').textContent=d.fact;$('scanPanel').classList.remove('hidden');hud();toast('DISCOVERY LOGGED · +50 XP');}
function reset(){body.setTranslation({x:0,y:1.4,z:8},true);body.setLinvel({x:0,y:0,z:0},true);body.setAngvel({x:0,y:0,z:0},true);body.setRotation({x:0,y:0,z:0,w:1},true);toast('ROVER RESET');}
let driveSpeed = 0;
let roverYaw = 0;

function animate() {
    requestAnimationFrame(animate);

    // Read keyboard input
    const forward =
        (keys.w || keys.arrowup ? 1 : 0) -
        (keys.s || keys.arrowdown ? 1 : 0);

    const steer =
        (keys.a || keys.arrowleft ? 1 : 0) -
        (keys.d || keys.arrowright ? 1 : 0);

    const velocity = body.linvel();

    // Acceleration and braking
    if (keys.space) {
        driveSpeed *= 0.80;
    } else if (forward !== 0) {
        driveSpeed += forward * 0.14;
    } else {
        driveSpeed *= 0.97;
    }

    driveSpeed = THREE.MathUtils.clamp(
        driveSpeed, -1.0, 1.5
    );

    // Steering
    if (Math.abs(driveSpeed) > 0.003) {
        roverYaw += steer * 0.025 *
            Math.sign(driveSpeed);
    }

    // Calculate rover direction
    const rotation = new THREE.Quaternion()
        .setFromAxisAngle(
            new THREE.Vector3(0, 1, 0),
            roverYaw
        );

    // Update physics body rotation
    body.setRotation({
        x: rotation.x,
        y: rotation.y,
        z: rotation.z,
        w: rotation.w
    }, true);

    const direction = new THREE.Vector3(0, 0, -1)
        .applyQuaternion(rotation);

    // Move rover
    body.setLinvel({
        x: direction.x * driveSpeed,
        y: velocity.y,
        z: direction.z * driveSpeed
    }, true);

    // Run physics
    physics.step();

    // Update rover position
    const position = body.translation();

    rover.position.set(
        position.x,
        position.y - 1.15,
        position.z
    );

    rover.rotation.y = roverYaw;

    // Animate wheels
    const speed = Math.abs(driveSpeed);

const speedDisplay = $('speed');
if (speedDisplay) {
    speedDisplay.textContent = (speed * 10).toFixed(1);
}

    rover.userData.wheels.forEach(wheel => {
        wheel.rotation.x += speed * 0.05 *
            Math.sign(driveSpeed || 1);
    });
    // Collect energy crystals and science data
for (let i = pickups.length - 1; i >= 0; i--) {
    const item = pickups[i];

    item.rotation.y += 0.025;

    item.position.y =
        item.userData.baseY +
        Math.sin(performance.now() * 0.002 + i) * 0.14;

    const dx = item.position.x - position.x;
    const dz = item.position.z - position.z;

    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance < 2.8) {

        if (item.userData.type === "crystal") {
            xp += 25;
            crystals++;
            toast("+25 XP - ENERGY CRYSTAL");
        } else {
            xp += 10;
            data++;
            toast("+10 XP - SCIENCE DATA");
        }

        group.remove(item);
        pickups.splice(i, 1);

        hud();
    }
}

    // Update camera
    const target = rover.position.clone();
    target.y += 1.5;

    if (third) {
        const offset = new THREE.Vector3(
            Math.sin(roverYaw + orbit) * 9,
            4.7,
            Math.cos(roverYaw + orbit) * 9
        );

        camera.position.lerp(
            target.clone().add(offset), 0.09
        );

        camera.lookAt(target);
    } else {
        camera.position.copy(target);
        camera.quaternion.copy(rover.quaternion);
    }

    // Render scene
    renderer.render(scene, camera);
}

animate();
window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();

    if (['arrowup', 'arrowdown', 'arrowleft',
         'arrowright', ' '].includes(key)) {
        e.preventDefault();
    }

    keys[key === ' ' ? 'space' : key] = true;

    if (key === 'e') scan();

    if (key === 'c') {
        third = !third;
        $('cameraBtn').textContent =
            'CAMERA: ' + (third ? 'THIRD' : 'FIRST');
    }

    if (key === 'r') reset();
});

window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    keys[key === ' ' ? 'space' : key] = false;
});
$('cameraBtn').onclick=()=>{third=!third;$('cameraBtn').textContent='CAMERA: '+(third?'THIRD':'FIRST');};
$('worldMoon').onclick=()=>loadWorld('moon');$('worldMars').onclick=()=>loadWorld('mars');
$('helpBtn').onclick=()=>$('helpPanel').classList.toggle('hidden');$('closeHelp').onclick=()=>$('helpPanel').classList.add('hidden');$('closeScan').onclick=()=>$('scanPanel').classList.add('hidden');$('mobileScan').onclick=scan;
canvas.addEventListener('pointerdown',e=>{drag=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointerup',()=>drag=false);
canvas.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;if(third)orbit-=dx*.004;else{orbit-=dx*.004;pitch=THREE.MathUtils.clamp(pitch-dy*.004,-.8,.8);}});
document.querySelectorAll('[data-key]').forEach(b=>{const k=b.dataset.key;b.addEventListener('pointerdown',e=>{e.preventDefault();keys[k]=true;});['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,()=>keys[k]=false));});
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));});
