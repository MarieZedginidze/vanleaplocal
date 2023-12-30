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
const scene = new THREE.Scene();

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);

const light = new THREE.DirectionalLight(0xffffff, 4);
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
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0, 8, 11);
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
// controls.enabled = false;

// Transform Controls
const transformControls = new TransformControls(camera, renderer.domElement);
scene.add(transformControls);

/**
 *  Models
 */
const gltfLoader = new GLTFLoader();

let room;
// Load a Room
gltfLoader.load("/models/wallsAndFloor.glb", (gltf) => {
  room = gltf.scene;
  scene.add(room);
});

// Generating and Passing Coordinates for Models
function passingPositions() {
  let x = -1;
  let y = 2.5;
  let z = 0;
  return { x, y, z };
}

// Load and Pass a Tap Model
const tapPath = "/models/tap.glb";
debugObject.tap = () => {
  createModel(tapPath, passingPositions());
};
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
    let model = gltf.scene.children[0];
    model.scale.set(4, 4, 4);
    model.position.copy(positions);
    transformControls.attach(model);
    models.push({ model });
    scene.add(model);
  });
};
gui.add(debugObject, "tap").name("create a tap");
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
  if (models.length > 0) {
    if (transformControls.mode === "translate") {
      for (const modelGroup of models) {
        const min = new THREE.Vector3(-3, 2.5, -3);
        const max = new THREE.Vector3(3, 6, 6);
        modelGroup.model.position.clamp(min, max);
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
 * Animate
 */
const tick = () => {
  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);
  // Prevent Objects Leaving the Room

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
