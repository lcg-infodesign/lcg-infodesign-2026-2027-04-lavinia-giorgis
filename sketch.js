let data;
let totalDeaths = 0;
let nationalities = [];
let counts = {};
let hoveredNationality = null;
 
//margine grafico
let margin = 20;
 
// Larghezza del rettangolo del grafico
let rectWidth = 500;
 
async function setup() 
{
  createCanvas(windowWidth, windowHeight);
 
  
  data = await loadTable("everest.csv", ",", "header");
 
  //conto quante morti ci sono per nazionalità scorre ogni riga del dataset
  for (let rowNumber = 0; rowNumber < data.getRowCount(); rowNumber++) 
  {
    let nationality = data.getString(rowNumber, "Nationality");
 
    if (nationality === "") 
    {
      nationality = "Unknown";
    }
 
    if (counts[nationality]) 
    {
      counts[nationality]++;
    } else 
    {
      counts[nationality] = 1;
    }
 
    totalDeaths++;
  }
 
  // estrae nomi nazionalita
  nationalities = Object.keys(counts);
  nationalities.sort((a, b) => counts[b] - counts[a]);
}
 
function draw() 
{
  background(10, 20, 50);
  hoveredNationality = null;
 
  // Titolo e sottotitolo
  noStroke();
  fill(245);
  textSize(34);
  text("Le vittime dell’Everest ", 40, 60);
  text(" 1921–2023", 30, 100);
  textSize(15);
  fill(245);
  text("Decessi totali sull’Everest, suddivisi per nazionalità", 40, 120);

   noFill();
  stroke(255);
  strokeWeight(1);
  rect(30, 135, 340, 65);

  noStroke();
  textSize(13);
  fill(245);
  text("Spessore della riga = numero di morti del paese", 40, 155);
  text("Rosso scuro = più morti · Rosa chiaro = meno morti", 40, 173);

  // Piccola sfumatura di esempio
  for (let i = 0; i < 100; i++) 
  {
    fill(lerpColor(color(150, 20, 30), color(255, 150, 150), i / 99));
    rect(40 + i * 1.5, 182, 1.5, 10);
  }
 
  // yPos tiene conto dove disegnare il prossimo riquadro
  let xPos = (width - rectWidth) / 2;
  let yPos = height - margin;
  let label = "";
 
  stroke(18);
 
  //rughe per ogni nazionalita
  for (let i = 0; i < nationalities.length; i++) 
  {
    let nationality = nationalities[i];
    let count = counts[nationality];
 
    let layerHeight = map(count, 0, totalDeaths, 0, height - 2 * margin);
    yPos -= layerHeight;
 
    // il puntatore dentro il riquadro allora poi dopo coloro
    let isHovered =
      mouseX >= xPos &&
      mouseX <= xPos + rectWidth &&
      mouseY >= yPos &&
      mouseY <= yPos + layerHeight;
 
    if (isHovered) 
    {
      // Evidenzio il paese
      fill(255);
      stroke(255);
      strokeWeight(2);
      label = nationality + ": " + count;
      hoveredNationality = nationality;
    } else 
    {
      //sfumatura
      let t = map(i, 0, nationalities.length - 1, 0, 1);
      fill(lerpColor(color(150, 20, 30), color(255, 150, 150), t));
      stroke(10, 20, 50)
      strokeWeight(1);
    }
 
    rect(xPos, yPos, rectWidth, layerHeight);
  }
 
  // nazionalità scritta
  if (label != "") 
  {
    noStroke();
    textSize(14);
 
    fill(0);
    rect(mouseX + 8, mouseY, textWidth(label) + 12, 24);
 
    fill(255);
    text(label, mouseX + 14, mouseY + 17);
  }
    if (hoveredNationality) 
    {
    cursor(HAND);
  } else {
    cursor(ARROW);
  }
}


function mousePressed() 
{
  if (hoveredNationality) 
  {
    window.location.href = "detail.html?paese=" + encodeURIComponent(hoveredNationality);
  }
}


function windowResized() 
{
  resizeCanvas(windowWidth, windowHeight);
}
 
 
