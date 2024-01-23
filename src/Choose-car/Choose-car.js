let testCar1 = document.getElementById("test-car");
let testCar2 = document.getElementById("test-car2");

let vanType;
testCar1.addEventListener("click", () => {
  vanType = "Ford Transit";
  localStorage.setItem("carType", JSON.stringify(vanType));
  window.location.replace("/Van-builder/Van.html");
});

testCar2.addEventListener("click", () => {
  vanType = "Mercedes Benz";
  localStorage.setItem("carType", JSON.stringify(vanType));
  window.location.replace("/Van-builder/Van.html");
});
