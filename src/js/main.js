var scene = new THREE.Scene();
scene.add( new THREE.AmbientLight( 0xFFFFFF ) );

scene.fog = new THREE.Fog( 11115678, 0, 10 );

var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 100 );

let cameraRotate = {
    x: 0,
    y: 0,
    z: 0
}

let cameraPosition = {
    x: 5,
    y: 0.5,
    z: 5
}

window['cameraRotate'] = cameraRotate;

let _camData = localStorage.getItem('camera');
if (_camData) {
    let cameraData = JSON.parse(localStorage.getItem('camera'));
    let { position, rotation } = cameraData
    cameraPosition = position;
    cameraRotate.y = rotation.y;
}

window.onunload = () => {
    console.log('2we')
    let cameraData = { rotation: cameraRotate, position: cameraPosition };
    localStorage.setItem('camera', JSON.stringify(cameraData));
}

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap


document.body.appendChild( renderer.domElement );


let light = new THREE.PointLight( 0xFFFFFF, 1, 100 );
light.position.set( 0, 10, 0 );
scene.add( light );

let box = new THREE.BoxGeometry(1, 1, 1);
let material = new THREE.MeshStandardMaterial( { color: 0x555555, wireframe: true } );
let cube = new THREE.Mesh(box, material);
cube.position.x = 1;
cube.position.y = 0.65;
cube.position.z = 0;
scene.add(cube); 

let gridX = 0;
let gridZ = 0;
let cubes = [];
for (let z = 0; z < 10; z++) {

    for (let x = 0; x < 10; x++) {
        let geometry = new THREE.BoxGeometry(1, 0.25, 1);
        let material = new THREE.MeshPhysicalMaterial( { color: 0x555555, /* wireframe: true */ } );
        let cube = new THREE.Mesh(geometry, material);
        cube.position.x = gridX += 1.05;
        cube.position.z = gridZ;
        cubes.push(cube);
        scene.add(cube); 
    }
    gridZ += 1.05;
    gridX = 0;
}

var dir = new THREE.Vector3(cameraRotate.x, cameraRotate.y, cameraRotate.z);

dir.normalize();

var origin = new THREE.Vector3(cameraPosition.x, cameraPosition.y, cameraPosition.z);
var length = 0.75;
var hex = 0xffff00;

var arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
scene.add( arrowHelper );


let keysPressed = {
    'ArrowUp': false,
    'ArrowDown': false,
    'ArrowLeft': false,
    'ArrowRight': false,
    'KeyW': false,
    'KeyS': false,
    'KeyA': false,
    'KeyD': false
};

addEventListener('keyup',   keyUpHandler);
addEventListener('keydown', keyDownHandler);

function keyDownHandler(event) {
    keysPressed[event.code] = true;
}

function keyUpHandler(event) {
    keysPressed[event.code] = false;
}

function move(keys) {
    keys['ArrowUp']      && lookUp();
    keys['ArrowDown']    && lookDown();
    keys['ArrowLeft']    && turnLeft();
    keys['ArrowRight']   && turnRight();
    keys['KeyW']         && moveForward();
    keys['KeyS']         && moveBackward();
    keys['KeyA']         && moveLeft();
    keys['KeyD']         && moveRight();

    camera.rotation.x = cameraRotate.x;
    camera.rotation.y = cameraRotate.y;
    camera.rotation.z = cameraRotate.z;

    camera.position.x = cameraPosition.x;
    camera.position.y = cameraPosition.y;
    camera.position.z = cameraPosition.z;
}

function lookUp() {
    let { x, y, z } = calculateDirection(cameraRotate.y);
    cameraRotate.x += 1 / 50;
    cameraRotate.z += 1 / 50;
}

function lookDown() {
    let { x, y, z } = calculateDirection(cameraRotate.y);
    cameraRotate.x -= z / 50;
    //cameraRotate.z -= x / 50;
}

function turnLeft() {
    cameraRotate.y += 0.02;
    if (cameraRotate.y >= Math.PI * 2) {
        cameraRotate.y = 0;
    }
}

function turnRight() {
    cameraRotate.y -= 0.02;
    if (cameraRotate.y <= 0) {
        cameraRotate.y = Math.PI * 2;
    }
}

function moveForward() {
    let { x, y, z } = calculateDirection(cameraRotate.y);
    cameraPosition.x += x / 100;
    cameraPosition.z += z / 100;
}

function moveBackward() { 
    let { x, y, z } = calculateDirection(cameraRotate.y);
    cameraPosition.x -= x / 100;
    cameraPosition.z -= z / 100;
}

function moveLeft() {
    let { x, y, z } = calculateDirection(cameraRotate.y);
    cameraPosition.x += z / 100;
    cameraPosition.z -= x / 100;
}

function moveRight() {
    let { x, y, z } = calculateDirection(cameraRotate.y);
    cameraPosition.x -= z / 100;
    cameraPosition.z += x / 100;
}

function calculateDirection(radians) {
    let x       = 0;
    let y       = 0; 
    let z       = 0;
    let degrees = radians * 180 / Math.PI;
    
    let state   = degrees >= 0 && degrees < 90      ? 'NW' :
                  degrees >= 90 && degrees < 180    ? 'WS' :
                  degrees >= 180 && degrees < 270   ? 'SE' :
                  degrees >= 270 && degrees <= 360  ? 'EN' : new Error('unexpected value');
              
    switch(state) {
        case 'NW':
            x = -(degrees / 45);
            z = -(90 - degrees) / 45;
            break;
        case 'WS':
            z =  (degrees - 90) / 45;
            x = -(90 - (degrees - 90)) / 45;
            break;
        case 'SE':
            x = (degrees - 180) / 45;
            z = (90 - (degrees - 180)) / 45;
            break;
        case 'EN':
            z = -(degrees - 270) / 45;
            x =  (90 - (degrees - 270)) / 45;
            break;
        default: 
            new Error('Calculate direction error');
    }
    
    return { x, y, z };
}

function refreshVector(cameraRotate, cameraPosition) {
    let { x, y, z } = calculateDirection(cameraRotate.y);

    var newSourcePos = new THREE.Vector3(cameraPosition.x,
                                         cameraPosition.y-0.3,
                                         cameraPosition.z);

    arrowHelper.position.copy(newSourcePos);
    direction = new THREE.Vector3(x, y, z);
    direction.normalize()
    arrowHelper.setDirection(direction);
}

let _x = 1;
let _z = 1;
var animate = function () {
    requestAnimationFrame( animate );

    refreshVector(cameraRotate, cameraPosition);
    move(keysPressed);

    // let { x, y, z } = calculateDirection(cameraRotate.y);
    // console.log('x ', x)
    // console.log('z', z)
    // //cameraRotate.x = 6;
    // //z <= 0 && (cameraRotate.x = cc);
    // //z >  0 && (cameraRotate.x = -cc);
    // cameraRotate.z = _z;
    // cameraRotate.x = _x;

    // _z += 0.001;
    // _x -= 0.001;
    // x >= 0 && (cameraRotate.z = -c);
    // x <= 0 && (cameraRotate.z = c);
/*
    let randIndex = Math.floor(Math.random() * 100);
    let randDir = Math.floor(Math.random() * 3 - 1)

    cubes[randIndex].position.y += 0.005 * randDir;
*/
    cube.rotation.y -= 0.01;

    renderer.render( scene, camera );
};

animate();