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
