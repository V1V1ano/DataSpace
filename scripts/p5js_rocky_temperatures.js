let planets = []

//order: mercury, venus, earth, mars
// values: mean_Temp (°C), min_Temp (°C), max_Temp(°C), diameter (km)

terrestrial_Planets = [
        [167,-170,449,4879],
        [464,465,467,12104],
        [15,-89,58,12756],
        [-65,-125,20,6792]]

// Hilfsfunktion, um Diameter aufzusummieren
function getSum(total, num) {
    return total + num;
}

// Diameter herausfiltern
let diameters = [];
  for (h=0; h<terrestrial_Planets.length; h++){
    diameters.push(terrestrial_Planets[h][3]);
  }

// MinTemps herausfiltern
let minTemps = [];
  for (h=0; h<terrestrial_Planets.length; h++){
    minTemps.push(terrestrial_Planets[h][1]);
  }

// MaxTemps herausfiltern
let maxTemps = [];
  for (h=0; h<terrestrial_Planets.length; h++){
    maxTemps.push(terrestrial_Planets[h][2]);
  }


// Diametersumme berechnen
diameterSum = diameters.reduce(getSum);

function setup() {
  // dopppelte Pixel Anzahl von A3
  createCanvas(297*2, 420*2);
}

function draw() {
  // y-Position für Rectangle Position
  let yPosition = 0;

  
  for (let i = 0; i < terrestrial_Planets.length; i++) {
    let diameterRange = map(terrestrial_Planets[i][3], 0, diameterSum, 0,height);

    // 1. BG
    fill(0);
    strokeWeight(0.2);
    stroke(255, 255, 255);
    rect(0,yPosition,width,diameterRange);

    // 2. MeanCircle
    // temepratureRange manuell eingegeben
    let temperatureRange = map(terrestrial_Planets[i][0], min(minTemps), max(maxTemps), 0, width);
    fill(255);
    stroke(0);
    strokeWeight(1);
    circle(temperatureRange, yPosition+diameterRange/2, diameterRange);


    // 3. DRAW MIN AND MAX TEMPERATURE
    noFill();
    stroke("blue");
    let temperatureMin = map(terrestrial_Planets[i][1], min(minTemps), max(maxTemps), 0, width);
    circle(temperatureMin, yPosition+diameterRange/2, diameterRange)

    stroke("orange");
    let temperatureMax = map(terrestrial_Planets[i][2],min(minTemps), max(maxTemps), 0, width);
    circle(temperatureMax, yPosition+diameterRange/2, diameterRange)

    // countUp yPosition
    yPosition += diameterRange;
  }
  
}



