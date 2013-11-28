'use strict';

var camera, scene, renderer;
var geometry, material, mesh;

init();
animate();

function init() {
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.z = 1000;

  scene = new THREE.Scene();

  geometry = new THREE.CubeGeometry( 200, 200, 200 );
  material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );

  mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );

  renderer = new THREE.CanvasRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );

  $('#3Dcontainer').append(renderer.domElement);
}

function animate() {
  requestAnimationFrame( animate );

  mesh.rotation.x += 0.01;
  mesh.rotation.y += 0.02;

  renderer.render( scene, camera );
}

/*
var WIDTH = 400,
   HEIGHT = 300;

var VIEW_ANGLE = 45,
   ASPECT = WIDTH / HEIGHT,
   NEAR = 0.1,
   FAR = 10000;

var $container = $('#container');

var renderer = new THREE.WebGLRenderer();
var camera = 
   new THREE.PerspectiveCamera(
    VIEW_ANGLE,
    ASPECT,
    NEAR,
    FAR);

var scene = new THREE.Scene();

scene.add(camera);

camera.position.z = 300;

renderer.setSize(WIDTH, HEIGHT);

$container.append(renderer.domElement);

var radius = 50,
   segments = 16,
   rings = 16;

var sphere = new THREE.Mesh(
  new THREE.SphereGeometry(
    radius,
    segments,
    rings),
  sphereMaterial);

scene.add(sphere);

var sphereMaterial = 
   new THREE.MeshLambertMaterial(
   {
    color: 0xCC0000
   });

var pointLight = 
   new THREE.PointLight(0xFFFFFF);

pointLight.position.x = 10;
pointLight.position.y = 50;
pointLight.position.z = 130;

scene.add(pointLight);

renderer.render(scene, camera);
*/