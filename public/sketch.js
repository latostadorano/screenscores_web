// Metemos configuración a Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDRd1M4h4iEU93bxy7hipWXbelap0vj9eE",
  authDomain: "screenscoresweb.firebaseapp.com",
  databaseURL: "https://screenscoresweb-default-rtdb.firebaseio.com",
  projectId: "screenscoresweb",
  storageBucket: "screenscoresweb.appspot.com",
  messagingSenderId: "135074850481",
  appId: "1:135074850481:web:2c16e50fd51c43c7606490"

};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// Get a reference to the database service
var database = firebase.database();

var resetButton;
let team1Name;
let team2Name;
let team1Score = 0;
let team2Score = 0;
let period = 1;
let team1Fouls = 0;
let team2Fouls = 0;
let radius = 20;
let fill_temp = 0;

// new code
let countdownDuration; //20 minutes in milliseconds
let startTime;
let elapsedTime = 0;
let isPaused = true;
let playing = false;

// new code

let playPauseButton;

let tieColor, looseColor, winColor;
let colorA1, colorA2;

let textModifier = 1;
let verticalScreen = false;

const scorers = {
  equipo1: [],
  equipo2: []
}

// Definimos varios elementos del HTML
var divTeam1color = document.getElementById('divLocalColor');
var divTeam2color = document.getElementById('divVisitanteColor');


function setup() {
  // Write data to the database
  database.ref("users/centroGol").set({
    team1Name: 'Locales',
    team2Name: 'Visitantes',
    team1Score: 0,
    team2Score: 0,
    period: 1,
    team1Fouls: 0,
    team2Fouls: 0,
    radius: 20,
    fill: 0,
    minutes: 0,
    seconds: 0
  });

  // Definimos la forma del html
  const form = document.getElementById('datosPartido');
  form.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form from submitting and refreshing the page

    const nombreLocales = document.getElementById('nombreLocales').value;
    const nombreVisitantes = document.getElementById('nombreVisitantes').value;
    const numeroPeriodos = document.getElementById('numeroPeriodos').value;
    const duracionPeriodos = document.getElementById('timer-input').value;
    getGameSettings(nombreLocales, nombreVisitantes, numeroPeriodos, duracionPeriodos);
  });

  textAlign(CENTER);

  // Setting the timer

  // Link p5.js functions to existing HTML elements
  select('#timer-text').html("TIME'S UP");
  select('#start-stop-button').mousePressed(toggleStartStop);
  select('#reset-button').mousePressed(resetCountdown);
  select('#set-configuracion-inicial').mousePressed(setTimerDuration);

  // Set the maximum width and height for the canvas
  let maxWidth = windowWidth; // Set your desired maximum width here
  let maxHeight = windowHeight; // Set your desired maximum height here
  let canvasWidth = min(windowWidth, maxWidth);
  let canvasHeight = min(windowHeight, maxHeight);
  createCanvas(canvasWidth, canvasHeight);

  // Definimos la font
  textAlign(CENTER);
  textFont("Arial");
  textStyle(BOLD);
  if (canvasWidth < canvasHeight) {
    verticalScreen = true;
    textModifier = 1.3;
    //print('textModifier = 1.3!')
  }

  // Definimos colores para empates y ventajas
  backgroundColor = 50;
  tieColor = color("#48CFAD");
  looseColor = color("#5D9CEC");
  winColor = color("#4A89DC");

  colorA1 = winColor;
  colorA2 = looseColor;

  //buttons();
}

function draw() {
  // Read data from the database
  database.ref("users/centroGol").on("value", function (snapshot) {
    myData = snapshot.val();
    //console.log(myData);
  });

  radius = myData.radius;
  fillTemp = myData.fill;
  fill(fillTemp);
  nombreLocales = myData.team1Name;
  nombreVisitantes = myData.team2Name;
  team1Score = myData.team1Score;
  team2Score = myData.team2Score;
  let period = myData.period;
  let team1Fouls = myData.team1Fouls;
  let team2Fouls = myData.team2Fouls;

  timer();

  document.getElementById('team1Score').innerText = team1Score;
  document.getElementById('team2Score').innerText = team2Score;

  // aquí estamos intentando cambiar el background del div
  if (divTeam1color !== null) {
    divTeam1color.style.backgroundColor = colorA1;
  }

  background(backgroundColor);
  //updateTime();

  // Muestra el estado actual de los botones
  //stopButton.elt.disabled = playing;

  if (team1Score === team2Score) {
    colorA1 = tieColor;
    colorA2 = tieColor;
  }
  if (team1Score > team2Score) {
    colorA1 = winColor;
    colorA2 = looseColor;
  } else if (team1Score < team2Score) {
    colorA2 = winColor;
    colorA1 = looseColor;
  }

  noStroke();
  fill(colorA1);
  rect(0, 0, width / 2, height);
  fill(colorA2);
  rect(width / 2, 0, width, height);

  // Mostrar los fondos dinámicos del marcador
  noStroke();
  fill(colorA1);
  rect(0, 0, width / 2, height);
  fill(colorA2);
  rect(width / 2, 0, width, height);

  stroke(255);
  strokeWeight(3);
  line(width / 2, height / 2 - 90, width / 2, height / 2 + 170);

  // Mostrar los MARCADORES de cada equipo
  push();
  fill(255);
  noStroke();
  textSize(550 / (textModifier * 1.2));
  textAlign(CENTER, CENTER);
  push();
  if (team1Score > 9 && verticalScreen == true) {
    textSize(550 / (textModifier * 2.4));
  }
  text(team1Score, width / 4, height / 2 + 70);
  pop();
  push();
  if (team2Score > 9 && verticalScreen == true) {
    textSize(550 / (textModifier * 2.4));
  }
  text(team2Score, (width / 4) * 3, height / 2 + 70);
  pop();

  pop();

  // Mostrar el TIEMPO del juego
  /*   push();
    noStroke();
    fill(0, 80);
    textSize(150 / (textModifier * 2));
    textAlign(CENTER, CENTER);
    let formattedTime = nf(minutes, 2) + ":" + nf(seconds, 2);
    text(formattedTime, width / 2, height / 8);
    pop(); */

  push();
  noStroke();
  fill(255);

  // Mostrar las FALTAS de cada equipo
  textSize(40);
  textAlign(CENTER, CENTER);
  textSize(80 / textModifier);
  text(team1Fouls, width / 5, height / 8);
  text(team2Fouls, (width / 5) * 4, height / 8);
  textSize(25);
  text("Faltas", width / 5, height / 8 + 50);
  text("Faltas", (width / 5) * 4, height / 8 + 50);

  // Mostrar el PERIODO actual
  textSize(80 / textModifier);
  textAlign(CENTER, CENTER);
  text(period, width / 2, (height / 8) * 7);
  textSize(25);
  text("TIEMPO", width / 2, (height / 8) * 7 + 50);

  pop();
  //print('MouseX: ' + mouseX + '  MouseY: ' + mouseY);

  push();
  rectMode(CORNERS);
  fill(0);
  noFill();
  noStroke();
  let haaight = height / 17;
  rect(width / 10, haaight, width / 10 + width / 5, haaight * 3);
  rect((width / 10) * 7, haaight, (width / 10) * 9, haaight * 3);

  rect(width / 10, haaight, (width / 10 + width / 5) / 2, haaight * 3);
  rect((width / 10) * 7, haaight, (width / 10) * 7.5, haaight * 3);
  pop();

  noFill();
  //rect(0,height/20 *16, 400, height);
}

// Function to handle the click event on the Score button
function handleScoreButtonClick(event) {
  // Retrieving the team and scorer's name
  const button = event.target;
  const team = button.dataset.team;

  // Getting the corresponding input field
  const inputField = document.querySelector(`.scorer-input[data-team="${team}"]`);
  const scorerName = inputField.value.trim(); // Step 5: Get scorer's name and remove any extra spaces

  // Check if the scorer's name is not empty
  if (scorerName !== "") {
    // Add the scorer's name to the dictionary for the respective team
    scorers[team].push(scorerName);

    // Optional - Clear the input field after adding the scorer's name
    inputField.value = "";
  }
  print(scorers);
}

// Step 9: Adding event listeners to all Score buttons
const scoreButtons = document.querySelectorAll(".score-btn");
scoreButtons.forEach((button) => {
  button.addEventListener("click", handleScoreButtonClick);
});


function getGameSettings(nombreLocales, nombreVisitantes, numeroPeriodos, duracionPeriodos) {
  document.getElementById('targetNombreLocales').innerText = nombreLocales;
  document.getElementById('targetNombreVisitantes').innerText = nombreVisitantes;
  document.getElementById('targetTiempo').innerText = numeroPeriodos;
  document.getElementById('timer-text').innerText = duracionPeriodos;

  setTimerDuration();

  firebase.database().ref('users/centroGol').update({
    team1Name: nombreLocales,
    team2Name: nombreVisitantes
  });

  print(nombreLocales + ' vs ' + nombreVisitantes);
  print(numeroPeriodos + ' periodos de ' + duracionPeriodos);
}

function updateTeam1Score() {
  updateValues("team1Score");
}

function updateTeam2Score() {
  updateValues("team2Score");
}

// new code

//toggle between start and stop
function toggleStartStop() {
  let button = select('#start-stop-button');
  if (isPaused) {
    //if countdown was paused, set new start time and unpause
    startTime = Date.now() - elapsedTime;
    isPaused = false;
    button.html('Detener');

  } else {
    //if countdown was running, pause it
    isPaused = true;
    button.html('Iniciar');
  }
}

//reset the countdown
function resetCountdown() {
  elapsedTime = 0;
  isPaused = true;
  select('#start-stop-button').html('Start');
}

function timer() {
  //only calculate time remaining if countdown is not paused
  if (!isPaused) {
    elapsedTime = Date.now() - startTime;
  }

  let timeRemaining = countdownDuration - elapsedTime;

  //convert the time to minutes and seconds
  minutes = floor(timeRemaining / (1000 * 60));
  seconds = floor((timeRemaining % (1000 * 60)) / 1000);

  //display the time
  if (playing) {
    select('#timer-text').html(nf(minutes, 2) + ":" + nf(seconds, 2));
  } else {
    select('#timer-text').html('Bienvenido');
  }

  //if the time is over
  if (timeRemaining < 0) {
    select('#timer-text').html("SE ACABÓ EL TIEMPO!");
    noLoop();
  }
  // Update Firebase
  firebase.database().ref('users/centroGol').update({
    minutes: nf(minutes, 2),
    seconds: nf(seconds, 2)
  });
}

function setTimerDuration() {
  playing = true;
  let inputMinutes = select('#timer-input').value();
  countdownDuration = inputMinutes * 60 * 1000; // convert minutes to milliseconds

  firebase.database().ref('users/centroGol').update({
    minutes: nf(minutes, 2),
    seconds: nf(seconds, 2)
  });
}

function togglePeriod() {
  if (period == 1) {
    updateValues("period");
  } else {
    period = 1;
  }
}

function updatePeriod() {
  updateValues("period");
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    updateValues("team1Score");
  } else if (keyCode === RIGHT_ARROW) {
    updateValues("team2Score");
  } else if (keyCode === UP_ARROW) {
    updateValues("team1Fouls");
  } else if (keyCode === DOWN_ARROW) {
    updateValues("team2Fouls");
  }
}

function mousePressed() {
  var heightScores = height / 20;
  var distanceScores = width / 2 / 5;
  var heightFouls = height / 17;
  var heightPeriod = (height / 20) * 17;
  var distancePeriod = width / 9;

  // SCORES
  if (mouseY > (height / 20) * 7 && mouseY < (height / 20) * 15) {
    if (mouseX > 0 && mouseX < distanceScores) {
      updateValues("team1Score", -1);
      win = false;
    }
    if (mouseX > distanceScores && mouseX < width / 2) {
      updateValues("team1Score");
      win = true;
    }
    if (mouseX > width / 2 && mouseX < width / 2 + distanceScores) {
      updateValues("team2Score", -1);
      win = false;
    }
    if (mouseX > width / 2 + distanceScores && mouseX < width) {
      updateValues("team2Score");
      win = true;
    }
  }

  // FALTAS
  if (mouseY > heightFouls && mouseY < heightFouls * 3) {
    if (mouseX > width / 10 && mouseX < (width / 10 + width / 5) / 2) {
      updateValues("team1Fouls", -1);
    } else if (
      mouseX > (width / 10 + width / 5) / 2 &&
      mouseX < width / 10 + width / 5
    ) {
      updateValues("team1Fouls");
    } else if (mouseX > (width / 10) * 7 && mouseX < (width / 10) * 7.5) {
      updateValues("team2Fouls", -1);
    } else if (mouseX > (width / 10) * 7.5 && mouseX < (width / 10) * 9) {
      updateValues("team2Fouls");
    }
  }

  // PERIOD
  if (mouseY > heightPeriod && mouseY < height) {
    if (
      mouseX > width / 2 - distancePeriod &&
      mouseX < width / 2 + distancePeriod
    ) {
      togglePeriod();
    }
  }
}

function updateValues(value, amount = 1) {
  // Get a reference to the location in the database where the score is stored for the specified team
  let scoreRef = database.ref("users/centroGol/" + value);

  // Update the score for the specified team
  scoreRef.transaction(function (currentValue) {
    return (currentValue || 0) + amount;
  });
}

function resetValues(value) {
  let scoreRef = database.ref("users/centroGol/" + value);
  scoreRef.transaction(function (currentValue) {
    return currentValue * 0;
  });
}

/*
function buttons() {

  // Create a button for each team
  createButton("Team 1")
    .position(50, height - 70)
    .mousePressed(function () {
      updateValues("team1Score");
    });
  createButton("Team 2")
    .position(130, height - 70)
    .mousePressed(function () {
      updateValues("team2Score");
      });


  // Crea botones de play, pausa y stop
  playButton = createButton("▶️"); //⏸
  playButton.style("visibility", "hidden");
  if (verticalScreen == false) {
    playButton.style("visibility", "hidden");
  }
  playButton.position(width / 2 - 50, 165);
  playButton.mousePressed(togglePlaying);
  //playButton.center('horizontal');

  // Stop button
  stopButton = createButton("⏹");
  stopButton.style("visibility", "hidden");
  if (verticalScreen == false) {
    stopButton.style("visibility", "hidden");
  }
  stopButton.position(width / 2 + 15, 165);
  stopButton.mousePressed(stopTime);

  // Reset button
  resetButton = createButton("Reset").position(width - 150, height - 70);
  resetButton.style("visibility", "visible");
  if (verticalScreen == false) {
    resetButton.style("visibility", "hidden");
  }
  resetButton.mousePressed(function () {
    stopTime();
    database.ref("users/centroGol").set({
      team1Score: 0,
      team2Score: 0,
      minutes: 0,
      seconds: 0,
      period: 1,
      team1Fouls: 0,
      team2Fouls: 0,
      radius: 0,
      fill: 0
    });
  });
}

  */