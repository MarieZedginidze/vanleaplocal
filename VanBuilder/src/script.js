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

// Load a Room
gltfLoader.load("/models/wallsAndFloor.glb", (gltf) => {
  let room = gltf.scene;
  scene.add(room);
});

// Generating and Passing Random Coordinates for Models
function passingRandomPositions() {
  let x = (Math.random() - 0.5) * 6;
  let y = 1;
  let z = (Math.random() - 0.5) * 7;
  return { x, y, z };
}
// Load and Pass a Fridge Model
const fridgePath = "/models/fridge.glb";
debugObject.createFridge = () => {
  createModel(fridgePath, passingRandomPositions());
};
// Load and Pass a Chair Model
const chairPath = "/models/chair.glb";
debugObject.createChair = () => {
  createModel(chairPath, passingRandomPositions());
};

let models = [];
// Define General Create Model Function
const createModel = (path, positions) => {
  // Load a Model, Add it to the Scene and to the Models' array
  gltfLoader.load(path, (gltf) => {
    let model = gltf.scene;
    model.scale.set(2.5, 2.5, 2.5);
    model.position.copy(positions);
    models.push({ model });
    scene.add(model);

    for (let model of models) {
      transformControls.attach(model.model);
    }
  });
};

gui.add(debugObject, "createFridge");
gui.add(debugObject, "createChair");

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

// Check For Intersecting Models
function attachControls(pointer) {
  let modelsArray = [];
  let firstObject;

  let raycaster = new THREE.Raycaster();
  // Update the Picking Ray with the Camera and Pointer Position
  raycaster.setFromCamera(pointer, camera);
  if (models.length === 1) {
    for (const modelGroup of models) {
      let intersectModel = raycaster.intersectObject(modelGroup.model);
      if (intersectModel.length) {
        transformControls.attach(modelGroup.model);
      } else {
        transformControls.detach(modelGroup.model);
      }
    }
  }
  if (models.length > 1) {
    for (var i = 0; i < models.length; i++) {
      modelsArray.push(models[i].model);
    }
    let intersectModels = raycaster.intersectObjects(modelsArray);

    if (intersectModels.length) {
      firstObject = intersectModels[0].object.parent;
      transformControls.attach(firstObject);
    } else {
      transformControls.detach();
    }
  }
}

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

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
