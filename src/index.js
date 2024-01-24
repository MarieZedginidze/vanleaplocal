// Redirect users when they click van builder links
let builderRedirects = document.getElementsByClassName("builderRedirect");

let retrievedVanType = localStorage.getItem("carType");

for (const builderRedirect of builderRedirects) {
  builderRedirect.addEventListener("click", () => {
    if (retrievedVanType === "undefined" || !retrievedVanType) {
      window.location.replace("/Choose-car/Choose-car.html");
    } else {
      window.location.replace("/Van-builder/Van.html");
    }
  });
}

// Create a mouse trail
const coords = { x: 500, y: -30 };
const circles = document.querySelectorAll(".circle");

const colors = [
  "#FF8F3D",
  "#C6EBFF",
  "#FF8F3D",
  "#42A0E5",
  "#80CE8F",
  "#84C6FF",
  "#FFD460",
  "#FFD460",
  "#FFD460",
  "#FFD460",
  "#FFD460",
  "#FFD460",
  "#FF8F3D",
  "#FF8F3D",
  "#FF8F3D",
  "#FF8F3D",
  "#84C6FF",
  "#84C6FF",
  "#84C6FF",
  "#84C6FF",
  "#80CE8F",
  "#80CE8F",
];

circles.forEach(function (circle, index) {
  circle.x = 0;
  circle.y = 0;
  circle.style.backgroundColor = colors[index % colors.length];
});

window.addEventListener("mousemove", function (e) {
  coords.x = e.clientX;
  coords.y = e.clientY;
});

function animateCircles() {
  let x = coords.x;
  let y = coords.y;

  circles.forEach(function (circle, index) {
    circle.style.left = x + 2 + "px";
    circle.style.top = y + 20 + "px";

    circle.style.scale = (circles.length - index) / circles.length;

    circle.x = x;
    circle.y = y;

    const nextCircle = circles[index + 1] || circles[0];
    x += (nextCircle.x - x) * 0.3;
    y += (nextCircle.y - y) * 0.3;
  });

  requestAnimationFrame(animateCircles);
}

animateCircles();
