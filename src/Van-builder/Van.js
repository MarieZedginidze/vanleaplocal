import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

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
  preserveDrawingBuffer: true,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0xefefef, 1);

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
transformControls.setSize(0.8, 0.8, 0.8);
scene.add(transformControls);
/**
 *  Models
 */
const gltfLoader = new GLTFLoader();

let van;
// let backPlane;
// let floorPlane;
// let truckPlane;
// let sidePlane;
// let topPlane;

// let backPlanebbox;
// let floorPlanebbox;
// let truckPlanebbox;
// let sidePlanebbox;
// let topPlanebbox;
let vanType;
// Load a van
// Load Van Depending on the Questionary Results
let retrievedVanType = JSON.parse(localStorage.getItem("carType"));
if (retrievedVanType === "Ford Transit") {
  vanType = "Ford Transit";

  gltfLoader.load("/models/l2h2.glb", (gltf) => {
    van = gltf.scene;
    // backPlane = van.getObjectByName("backPlane");
    // floorPlane = van.getObjectByName("floorPlane");
    // truckPlane = van.getObjectByName("truckPlane");
    // sidePlane = van.getObjectByName("sidePlane");
    // topPlane = van.getObjectByName("topPlane");

    // backPlane.visible = false;
    // floorPlane.visible = false;
    // truckPlane.visible = false;
    // sidePlane.visible = false;
    // topPlane.visible = false;
    scene.position.set(0, -0.3, 0);
    scene.add(van);
  });
}
if (retrievedVanType === "Mercedes Benz") {
  gltfLoader.load("/models/l3h3.glb", (gltf) => {
    vanType = "Mercedes Benz";
    van = gltf.scene;
    // backPlane = van.getObjectByName("backPlane");
    // floorPlane = van.getObjectByName("floorPlane");
    // truckPlane = van.getObjectByName("truckPlane");
    // sidePlane = van.getObjectByName("sidePlane");
    // topPlane = van.getObjectByName("topPlane");

    // backPlane.visible = false;
    // floorPlane.visible = false;
    // truckPlane.visible = false;
    // sidePlane.visible = false;
    // topPlane.visible = false;
    scene.position.set(0, 0, 0);
    scene.add(van);
  });
}

// Generating and Passing Coordinates for Models
function passingPositions() {
  let x = 1.5;
  let y = 1.2;
  let z = 1;
  return { x, y, z };
}

/**
 * Create Models UI
 */
// Load and Pass a Cupboard Model
const cupboardPath = "/models/cupboard.glb";
let cupboard = document.querySelector(".cupboard");

cupboard.addEventListener("click", () => {
  createModel(cupboardPath, passingPositions());
});

// Load and Pass a Sphere Model
const spherePath = "/models/sphere.glb";
let sphere = document.querySelector(".sphere");

sphere.addEventListener("click", () => {
  createModel(spherePath, passingPositions());
});

// Load and Pass a Sphere Model
const bathSpherePath = "/models/sphere.glb";
let bathSphere = document.querySelector(".bathSphere");
bathSphere.addEventListener("click", () => {
  createModel(bathSpherePath, passingPositions());
});

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

/**
 * Toggle Items Menu
 */
let kitchenAppliances = document.getElementById("kitchen-appliances");
let bathroomAppliances = document.getElementById("bathroom-appliances");
let menuItems = document.querySelectorAll(".item-list");

for (const menuItem of menuItems) {
  menuItem.addEventListener("click", toggleMenu);
}

function toggleMenu(e) {
  if (e.target.id === "kitchen-icon") {
    if (kitchenAppliances.style.display == "block") {
      kitchenAppliances.style.display = "none";
    } else {
      kitchenAppliances.style.display = "block";
      bathroomAppliances.style.display = "none";
    }
  }
  if (e.target.id === "bathroom-icon") {
    if (bathroomAppliances.style.display == "block") {
      bathroomAppliances.style.display = "none";
    } else {
      bathroomAppliances.style.display = "block";
      kitchenAppliances.style.display = "none";
    }
  }
}
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
 * Track Key Down and Interaction Icons Events
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

let interactionIcons = document.querySelectorAll(".interaction-icons");

function changeTransformMode(e) {
  if (e.target.id === "move-icon") {
    transformControls.mode = "translate";
  }
  if (e.target.id === "rotate-icon") {
    transformControls.mode = "rotate";
  }
  if (e.target.id === "scale-icon") {
    transformControls.mode = "scale";
  }
}
for (const interactionIcon of interactionIcons) {
  interactionIcon.addEventListener("click", changeTransformMode);
}

/**
 * Display and Close the Info Sidebar
 */
let lengthInfo = document.getElementById("info-length");
let heightInfo = document.getElementById("info-height");
let widthInfo = document.getElementById("info-width");

let infoSidebar = document.querySelector(".info-sidebar");

function displaySidebar(modelName) {
  if (modelName === "Cube") {
    document.getElementById("model-image").src =
      "https://www.aberdeens.co.za/images/cmsimages/big/product_267_2DoorFloorKitchenCupboard(PineTop)ClearPine(1).jpg";

    document.querySelector(".info-sidebar").style.display = "block";
  }
  if (modelName === "Sphere") {
    document.getElementById("model-image").src =
      "https://www.splashlearn.com/math-vocabulary/wp-content/uploads/2022/04/sphere1.png";
  }
  infoSidebar.style.display = "block";
}
// Close the Info Sidebar
let closeBtn = document.getElementById("close-btn");
closeBtn.addEventListener("click", () => {
  infoSidebar.style.display = "none";
});

// Get Model from the attachControls Function
let modelFromIntersection;

function getClickedModel(model) {
  if (model) {
    // If there is an intersecting model, enable the button
    deleteBtn.disabled = false;
  } else {
    // If there is no intersecting model, disable the button
    deleteBtn.disabled = true;
  }
  modelFromIntersection = model;
}

/**
 * Delete the Model
 */
let deleteBtn = document.getElementById("delete-btn");
function deleteModel() {
  if (modelFromIntersection) {
    transformControls.detach();
    modelFromIntersection.removeFromParent(scene);
    infoSidebar.style.display = "none";
  }
}
deleteBtn.addEventListener("click", deleteModel);

// Display Sizes of the Models into the Info Sidebar Inputs
let modelBoundingBox;
let modelSize;

function displayModelSizes() {
  if (modelFromIntersection) {
    modelBoundingBox = new THREE.Box3().setFromObject(modelFromIntersection);
    modelSize = modelBoundingBox.getSize(new THREE.Vector3());
    lengthInfo.textContent =
      "length: " + Math.round((modelSize.x + Number.EPSILON) * 100) / 100;
    heightInfo.textContent =
      "height: " + Math.round((modelSize.y + Number.EPSILON) * 100) / 100;
    widthInfo.textContent =
      "width: " + Math.round((modelSize.z + Number.EPSILON) * 100) / 100;
  }
}

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

        // Check Model's Names and Send it to the Sidebar Function
        displaySidebar(intersectModel[0].object.name);
        getClickedModel(intersectModel[0].object);
        displayModelSizes();
      } else {
        transformControls.detach();
        getClickedModel(undefined);
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
      // Check Model's Names and Send it to the Sidebar Function
      displaySidebar(firstObject.children[0].name);
      getClickedModel(firstObject.children[0]);
      displayModelSizes();
    } else {
      transformControls.detach();
      getClickedModel(undefined);
    }
  }
}
/**
 * Restrict Translation of an Object
 *
 */
function restrictingMovement() {
  // backPlanebbox = new THREE.Box3().setFromObject(backPlane);
  // floorPlanebbox = new THREE.Box3().setFromObject(floorPlane);
  // truckPlanebbox = new THREE.Box3().setFromObject(truckPlane);
  // sidePlanebbox = new THREE.Box3().setFromObject(sidePlane);
  // topPlanebbox = new THREE.Box3().setFromObject(topPlane);
  // for (const modelGroup of models) {
  //   let model = modelGroup.model;
  //   let modelBoundingBox = new THREE.Box3().setFromObject(model);
  //   let modelSize = modelBoundingBox.getSize(new THREE.Vector3());
  //   // restricting movement on the x axis with black plane
  //   if (transformControls.mode === "translate") {
  //     if (modelBoundingBox.max.x > backPlanebbox.max.x) {
  //       model.position.x = backPlane.position.x - modelSize.x / 2;
  //     }
  //     // restricting movement on the y axis with top plane
  //     if (modelBoundingBox.max.y > topPlanebbox.max.y) {
  //       model.position.y = topPlane.position.y - modelSize.y / 2;
  //     }
  //     // restricting movement on the z axis with side plane
  //     if (modelBoundingBox.min.z < sidePlanebbox.min.z) {
  //       -(model.position.z = sidePlane.position.z + modelSize.z / 2);
  //     }
  //     // restricting movement on the x axis with truck plane
  //     if (modelBoundingBox.min.x < truckPlanebbox.min.x) {
  //       -(model.position.x = truckPlane.position.x + modelSize.x / 2);
  //     }
  //     // restricting movement on the y axis with floor plane
  //     if (modelBoundingBox.min.y < floorPlanebbox.min.y) {
  //       model.position.y = floorPlane.position.y + modelSize.y / 2;
  //     }
  //   }
  //   displayModelSizes();
  // }
}

transformControls.addEventListener("change", restrictingMovement);

// check if user drags and disable orbit controls
transformControls.addEventListener("dragging-changed", (event) => {
  controls.enabled = !event.value;
});

/**
 * Database
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

function saveScene() {
  saveCameraLocation();
  let existingModels = [];

  for (let i = 0; i < models.length; i++) {
    let model = models[i].model;

    existingModels.push({ model });
    localStorage.setItem("localModels", JSON.stringify(existingModels));
  }

  // Save whole scene
  let result = scene.toJSON();
  localStorage.savedScene = JSON.stringify(result);
}
function loadScene() {
  let loader = new THREE.ObjectLoader();

  let retrievedModels = JSON.parse(localStorage.getItem("localModels"));
  for (const modelGrop of retrievedModels) {
    loader.parse(modelGrop.model, function (e) {
      models.push({ model: e });
      scene.add(e);
    });
  }

  // parsing the whole scene
  let parsedScene = JSON.parse(localStorage.savedScene);
  loader.parse(parsedScene, function (e) {});
  loadCameraLocation();
}
// Save scene models to the localstorage under the existingModels array
let savingBtn = document.getElementById("save-btn");
savingBtn.addEventListener("click", saveScene);
// Add the models from the Locastorage existingModels array to the Scene
window.addEventListener("load", loadScene);

// Clear the Localstorage and the Models in the Scene
function resetScene() {
  localStorage.clear();
  localStorage.setItem("carType", JSON.stringify(vanType));
  location.reload();
}
let resetBtn = document.getElementById("reset-btn");
resetBtn.addEventListener("click", resetScene);

function saveAsImage() {
  let imgData;

  try {
    let strMime = "image/jpeg";
    let strDownloadMime = "image/octet-stream";

    imgData = renderer.domElement.toDataURL(strMime);

    saveFile(imgData.replace(strMime, strDownloadMime), "my-van.jpg");
  } catch (e) {
    return;
  }
}
let saveFile = function (strData, filename) {
  let link = document.createElement("a");
  if (typeof link.download === "string") {
    document.body.appendChild(link); //Firefox requires the link to be in the body
    link.download = filename;
    link.href = strData;
    link.click();
    document.body.removeChild(link); //remove the link when done
  } else {
    location.replace(uri);
  }
};

// Download the Scene as a JPG
let exportBtn = document.getElementById("export-btn");
exportBtn.addEventListener("click", saveAsImage);

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
