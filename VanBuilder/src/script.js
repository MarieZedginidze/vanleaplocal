import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import GUI from "lil-gui";

const gui = new GUI();
const debugObject = {};

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
let scene = new THREE.Scene();

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1);
scene.add(light);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  100
);
scene.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 *  Controls
 */
// Orbit Controls
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 1, 0);
controls.enableDamping = true;

controls.minDistance = 8;
controls.maxDistance = 20;

// Changed how far you can orbit vertically, upper and lower limits.
controls.minPolarAngle = 0; // radians
controls.maxPolarAngle = 1.3; // radians

//controls.enabled = false;

// Transform Controls
const transformControls = new TransformControls(camera, renderer.domElement);
scene.add(transformControls);
/**
 *  Models
 */
const gltfLoader = new GLTFLoader();

let room;
let backPlane;
let floorPlane;
let truckPlane;
let sidePlane;
let topPlane;

let backPlanebbox;
let floorPlanebbox;
let truckPlanebbox;
let sidePlanebbox;
let topPlanebbox;
// Load a Room
gltfLoader.load("models/test-car.glb", (gltf) => {
  room = gltf.scene;
  backPlane = room.getObjectByName("backPlane");
  floorPlane = room.getObjectByName("floorPlane");
  truckPlane = room.getObjectByName("truckPlane");
  sidePlane = room.getObjectByName("sidePlane");
  topPlane = room.getObjectByName("topPlane");

  backPlane.visible = false;
  floorPlane.visible = false;
  truckPlane.visible = false;
  sidePlane.visible = false;
  topPlane.visible = false;

  scene.position.set(0, 0, 0);
  scene.add(room);
});

// Generating and Passing Coordinates for Models
function passingPositions() {
  let x = 1.5;
  let y = 0.835;
  let z = 1;
  return { x, y, z };
}

// Load and Pass a Cupboard Model
const cupboardPath = "/models/cupboard.glb";
debugObject.cupboard = () => {
  createModel(cupboardPath, passingPositions());
};

let models = [];
// Define General Create Model Function
const createModel = (path, positions) => {
  // Load a Model, Add it to the Scene and to the Models' array
  gltfLoader.load(path, (gltf) => {
    let model = gltf.scene;
    model.position.copy(positions);
    transformControls.attach(model);
    models.push({ model });
    scene.add(model);
  });
};
gui.add(debugObject, "cupboard").name("create a cupboard");

/**
 *  Track Mouse Events
 */
let mousedownCoords = new THREE.Vector2();
let mouseupCoords = new THREE.Vector2();

function mousedown(event) {
  // calculate Pointer Position in Normalized Device Coordinates (-1 to +1) for Both Components
  mousedownCoords.x = (event.clientX / window.innerWidth) * 2 - 1;
  mousedownCoords.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function mouseup(event) {
  mouseupCoords.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouseupCoords.y = -(event.clientY / window.innerHeight) * 2 + 1;
  // Check if mousedown coordinates are different from mouse up coordinates
  if (
    mousedownCoords.x === mouseupCoords.x &&
    mousedownCoords.y === mouseupCoords.y
  ) {
    attachControls(mousedownCoords);
  }
}

canvas.addEventListener("mousedown", mousedown);
canvas.addEventListener("mouseup", mouseup);

/**
 * Track Key Down Events
 */
// Change Transform Control Modes with Shortcut Keys
function setShotrCutKey(event) {
  switch (event.keyCode) {
    case 87: // W = translate
      transformControls.setMode("translate");
      break;
    case 69: // E = rotate
      transformControls.setMode("rotate");
      break;
    case 82: // R = scale
      transformControls.setMode("scale");
      break;
  }
}

window.addEventListener("keydown", setShotrCutKey, true);

/*
 * Check For Intersecting Models and Toggle Transform Controls
 */
let raycaster = new THREE.Raycaster();

function attachControls(pointer) {
  let modelsArray = [];
  let firstObject;

  // Update the Picking Ray with the Camera and Pointer Position
  raycaster.setFromCamera(pointer, camera);
  // If there is only one model, only check for a single model
  if (models.length === 1) {
    for (const modelGroup of models) {
      let intersectModel = raycaster.intersectObject(modelGroup.model);

      // If we have intersected model, attach controls, if not- detach
      if (intersectModel.length) {
        let intersectedObject = intersectModel[0].object.parent;
        transformControls.attach(intersectedObject);
      } else {
        transformControls.detach();
      }
    }
  }
  // If we have more than one model in the scene, push models' group directly to the modelsArray
  if (models.length > 1) {
    for (let i = 0; i < models.length; i++) {
      modelsArray.push(models[i].model);
    }
    let intersectModels = raycaster.intersectObjects(modelsArray);
    // If we have intersected models, check for the first face and take its parent and attach controls to it,
    // if we don't have any intersections, remove controls
    if (intersectModels.length) {
      firstObject = intersectModels[0].object.parent;
      transformControls.attach(firstObject);
    } else {
      transformControls.detach();
    }
  }
}
// Restrict Translation of an Object
function restrictingMovement() {
  backPlanebbox = new THREE.Box3().setFromObject(backPlane);
  floorPlanebbox = new THREE.Box3().setFromObject(floorPlane);
  truckPlanebbox = new THREE.Box3().setFromObject(truckPlane);
  sidePlanebbox = new THREE.Box3().setFromObject(sidePlane);
  topPlanebbox = new THREE.Box3().setFromObject(topPlane);
  for (const modelGroup of models) {
    let model = modelGroup.model;
    let van = room.children[0];
    let vanBoundingBox = new THREE.Box3().setFromObject(van);
    let modelBoundingBox = new THREE.Box3().setFromObject(model);
    let modelSize = modelBoundingBox.getSize(new THREE.Vector3());

    // restricting movement on the x axis with black plane

    if (modelBoundingBox.max.x > backPlanebbox.max.x) {
      model.position.x = backPlane.position.x - modelSize.x / 2;
    }
    // restricting movement on the y axis with top plane
    if (modelBoundingBox.max.y > topPlanebbox.max.y) {
      model.position.y = topPlane.position.y - modelSize.y / 2;
    }
    // restricting movement on the z axis with side plane
    if (modelBoundingBox.min.z < sidePlanebbox.min.z) {
      -(model.position.z = sidePlane.position.z + modelSize.z / 2);
    }
    // restricting movement on the x axis with truck plane
    if (modelBoundingBox.min.x < truckPlanebbox.min.x) {
      -(model.position.x = truckPlane.position.x + modelSize.x / 2);
    }
    // restricting movement on the y axis with floor plane
    if (modelBoundingBox.min.y < floorPlanebbox.min.y) {
      model.position.y = floorPlane.position.y + modelSize.y / 2;
    }
    // restricting the scaling of the object
    if (transformControls.mode === "scale") {
      if (modelBoundingBox.max.x > vanBoundingBox.max.x) {
      }
      if (modelBoundingBox.max.y > vanBoundingBox.max.y) {
      }
      if (modelBoundingBox.max.z > vanBoundingBox.max.z) {
      }
    }
  }
}

transformControls.addEventListener("change", restrictingMovement);

// check if user drags and disable orbit controls
transformControls.addEventListener("dragging-changed", (event) => {
  controls.enabled = !event.value;
});

/**
 * Database
 */
/**
 * Saving and Loading the Scene
 */
// Saving and Loading the Camera's Position and Location Seperately
function saveCameraLocation() {
  localStorage.setItem("camera.position.x", camera.position.x);
  localStorage.setItem("camera.position.y", camera.position.y);
  localStorage.setItem("camera.position.z", camera.position.z);

  localStorage.setItem("camera.rotation.x", camera.rotation.x);
  localStorage.setItem("camera.rotation.y", camera.rotation.y);
  localStorage.setItem("camera.rotation.z", camera.rotation.z);
}
function loadCameraLocation() {
  camera.position.x = parseFloat(localStorage.getItem("camera.position.x"));
  camera.position.y = parseFloat(localStorage.getItem("camera.position.y"));
  camera.position.z = parseFloat(localStorage.getItem("camera.position.z"));

  camera.rotation.x = parseFloat(localStorage.getItem("camera.rotation.x"));
  camera.rotation.y = parseFloat(localStorage.getItem("camera.rotation.y"));
  camera.rotation.z = parseFloat(localStorage.getItem("camera.rotation.z"));
}

// Saving the Scene
function saveScene() {
  let result = scene.toJSON();
  saveCameraLocation();
  localStorage.savedScene = JSON.stringify(result);
}
// Loading the Scene
function loadScene() {
  scene.updateMatrixWorld();
  let json = JSON.parse(localStorage.savedScene);
  console.log(json);
  let loader = new THREE.ObjectLoader();
  loadCameraLocation();
  loader.parse(json, function (e) {
    // Set the Scene as the loaded Object
    if (json !== undefined) scene = e;
  });
}

document.addEventListener("DOMContentLoaded", loadScene);

// Reseting the Scene
function resetScene() {
  localStorage.clear();
  location.reload();
}

let savingBtn = document.getElementById("save-btn");
savingBtn.addEventListener("click", saveScene);

window.addEventListener("load", loadScene);

let resetBtn = document.getElementById("reset-btn");
resetBtn.addEventListener("click", resetScene);
/**
 * Animate
 */
const tick = () => {
  // update matrix world
  for (const modelGroup of models) {
    modelGroup.model.updateMatrix();
  }
  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
