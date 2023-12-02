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
 *  Models
 */
// Instantiate GLTF Loader
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
    model.updateMatrixWorld();
    scene.add(model);

    models.push({
      model: model,
    });
  });
};

// adding creation functions to the GUI buttons
gui.add(debugObject, "createFridge");
gui.add(debugObject, "createChair");

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

// Checking if user is Dragging and Disable Orbit Controls
transformControls.addEventListener("dragging-changed", (event) => {
  controls.enabled = !event.value;
});

/**
 * Transform Controls Customization
 */

// empty geometry to replace the transformControls elements
var invisible = new THREE.BufferGeometry();

// remove transformControls translate elements
function removeTranslateControls(name) {
  transformControls._gizmo.gizmo.translate.getObjectByName(name).geometry =
    invisible;
  transformControls._gizmo.picker.translate.getObjectByName(name).geometry =
    invisible;
}
// remove global translation
removeTranslateControls("XYZ");

// remove XY translation
removeTranslateControls("XY");

// remove YZ translation
removeTranslateControls("YZ");

// remove XZ translation
removeTranslateControls("XZ");

// remove transformControls rotation elements
function removeRotateControls(name) {
  transformControls._gizmo.gizmo.rotate.getObjectByName(name).geometry =
    invisible;
  transformControls._gizmo.picker.rotate.getObjectByName(name).geometry =
    invisible;
}

// remove global rotation
removeRotateControls("XYZE");
// remove screen rotation
removeRotateControls("E");

// Change transformControls translate element colors
function changeTranslateColors(name, color) {
  transformControls._gizmo.gizmo.translate
    .getObjectByName(name)
    .material.color.setHex(color);
}
changeTranslateColors("X", "0xFF0000");
changeTranslateColors("Y", "0x38B000");
changeTranslateColors("Z", "0x00a9ff");

/**
 *  Raycaster
 */
let raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
/**
 *  Track Mouse Intersections with the Models
 */
function onClick(event) {
  // calculate Pointer Position in Normalized Device Coordinates (-1 to +1) for Both Components
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the Picking Ray with the Camera and Pointer Position
  raycaster.setFromCamera(pointer, camera);
}

window.addEventListener("mousedown", onClick);

/**
 * Animate
 */

const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Go Through the Models' Array
  if (models.length) {
    for (const modelGroup of models) {
      // Get Intersecting Models
      let modelIntersects = raycaster.intersectObject(modelGroup.model);

      // Check if modelIntersects Array Length is more than 0 and transformIntersects equals to 0, Attach Transform Controls to the Model
      if (modelIntersects.length) {
        for (let i = 0; i < modelIntersects.length; i++) {
          transformControls.attach(modelGroup.model);
        }
      }
    }
  }

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
