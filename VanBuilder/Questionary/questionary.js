/*
  Getting Elements
*/
// Questions
let questionOne = document.querySelector(".question-one");
let questionTwo = document.querySelector(".question-two");
let questionThree = document.querySelector(".question-three");
let questionFourth = document.querySelector(".question-four");

// Radio Buttons
let radioBtnsOne = questionOne.querySelectorAll("input[type='radio']");
let radioBtnsTwo = questionTwo.querySelectorAll("input[type='radio']");
let radioBtnsThree = questionThree.querySelectorAll("input[type='radio']");
// Check Boxes
let checkBoxes = questionFourth.querySelectorAll('input[type="checkbox"]');

// Form Element
const form = document.querySelector("form");

// Tips Section
const tip = document.getElementsByClassName("tips");

let form_data = new FormData(form);
let errorMsgSections = document.querySelectorAll(".chk_option_error");

/* 
    Check for Required Answers
 */
// Show error when the User doesn't Selects the Answer
function showError(option_name) {
  // Check if Form Data object Doesn't contain a Key
  if (!form_data.has(option_name)) {
    // Get the Specific Input
    let childElement = document.querySelector("." + option_name);
    // Find the Input's Parent
    let parentElement = childElement.parentNode;
    // Select the Error Message Section in a specific Form Section
    let specificErrorSection = parentElement.querySelector(".chk_option_error");
    // Display Error Message Section
    specificErrorSection.style.visibility = "visible";
  }
}

// Hide error when the User Submits the Answer
function hideError(parent) {
  let parentElement = document.querySelector("." + parent);
  let specificErrorSection = parentElement.querySelector(".chk_option_error");
  specificErrorSection.style.visibility = "hidden";
}
/*
    First Question: People Amount
*/
function getPeopleAmount() {
  let peopleAmount;
  // Get First Question's Radio Buttons, Loop throught them
  // and Assign the Checked Buttons Value to the peopleAmount Variable
  for (var i = 0; i < radioBtnsOne.length; i++) {
    if (radioBtnsOne[i].checked) {
      peopleAmount = radioBtnsOne[i].value;
    }
  }
  if (peopleAmount === undefined) {
    // Pass the Input name to the showError function, if None of the Buttons were Selected
    showError("peopleAmount");
  } else {
    // Pass the Parent's name to the hideError function, if One of the Button was selected
    hideError("question-one");
  }
  return peopleAmount;
}

/*
    Second Question: People Amount
*/
function getTripType() {
  let tripType;
  // Get Third Question's Radio Buttons, Loop throught them
  // and Assign the Checked Buttons Value to the tripType Variable
  for (var i = 0; i < radioBtnsTwo.length; i++) {
    if (radioBtnsTwo[i].checked) {
      tripType = radioBtnsTwo[i].value;
    }
  }
  return tripType;
}

/*
    Third Question: Activities
*/
function getActivities() {
  let activities = [];
  // For each Facility Option Check if the Input is Checked and Push its Value to the activities Array
  for (var i = 0; i < radioBtnsThree.length; i++) {
    if (radioBtnsThree[i].checked) {
      activities.push(radioBtnsThree[i].value);
    }
  }
  // Check for the activities Array, if it's empty, Send the Input Name to the showError function
  if (!activities.length) {
    // Pass the Input name to the showError function, if None of the Checkbox were Selected
    showError("activity");
  } else {
    // Pass the Parent's name to the hideError function, if at least One of the Checkbox was selected
    hideError("question-three");
  }
  return activities;
}

/*
    Fourth Question: Getting Facilities
*/
function getFacilities() {
  let facilities = [];
  // For each Facility Option Check if the Input is Checked and Push its Value to the facilities Array
  for (var i = 0; i < checkBoxes.length; i++) {
    if (checkBoxes[i].checked) {
      facilities.push(checkBoxes[i].value);
    }
  }
  // Check for the facilities Array, if it's empty, Send the Input Name to the showError function
  if (!facilities.length) {
    // Pass the Input name to the showError function, if None of the Checkbox were Selected
    showError("facility");
  } else {
    // Pass the Parent's name to the hideError function, if at least One of the Checkbox was selected
    hideError("question-four");
  }
  return facilities;
}

/*
    Analysing the Inputs
*/

// Suggest user/s to  Ford Transit or Mercedez Sprinter
function suggestCarSize(
  peopleAmount,
  tripType,
  activitiesArray,
  facilitiesArray
) {
  let suggestedCar;

  if (peopleAmount === "3+") {
    suggestedCar = "Mercedes Benz";
  }
  for (let i = 0; i < activitiesArray.length; i++) {
    if (activitiesArray[i] === "3+sports-manyGear") {
      suggestedCar = "Mercedes Benz";
    }
  }
  for (let i = 0; i < facilitiesArray.length; i++) {
    if (facilitiesArray[i] === "shower") {
      suggestedCar = "Mercedes Benz";
    }
  }
  if (suggestedCar === "Mercedes Benz") {
    tip[0].textContent = "get Mercedes Benz";
  } else if (tripType === "1 month+ / live in van full time") {
    {
      tip[0].textContent =
        "If you want to live Full-Time maybe, you should consider buying the big Van Once";
    }
  } else {
    tip[0].textContent = "get Ford Transit";
  }
  return suggestedCar;
}

/*
    Form
*/

form.addEventListener("submit", (event) => {
  // Stop Page from Refreshing when Submitting the Form
  event.preventDefault();
  // Get the Number of the People User had Selected
  let peopleAmount = getPeopleAmount();
  // Get the Trip Type
  let tripType = getTripType();
  // Get the Facility/Facilities the People User had Selected
  let facilities = getFacilities();
  // Get the Activity/Activities the People User had Selected
  let activities = getActivities();
  if (peopleAmount && activities.length && facilities.length) {
    suggestCarSize(peopleAmount, tripType, activities, facilities);
  }
});
