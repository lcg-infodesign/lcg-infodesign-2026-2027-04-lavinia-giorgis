let data;
let selezionata = "";   // paese scelto, letto dall'URL
let causes = [];        // [{ nome, count }, ...] ordinate dalla più frequente
let totalCountry = 0;

// layout
let marginX = 40;
let gridTop = 285;
let gridBottom = 40;
let cellMinW = 230;     // larghezza minima di una cella (meno colonne = più grandi)
let cellH = 230;        // altezza fissa di una cella

// palette (assegnata in setup, perché color() funziona solo dopo l'avvio di p5)
let colSfondo;          // sfondo
let colTesto;           // tutte le scritte
let colMontagna;        // roccia
let colNeve;            // cima innevata
let neve = true;        // cima innevata sì/no

async function setup() {
  data = await loadTable("everest.csv", ",", "header");

  createCanvas(windowWidth, windowHeight);

  colSfondo = color(255);
  colTesto = color(15, 35, 100);       // blu
  colMontagna = color(85, 105, 135);   // grigio-blu della roccia
  colNeve = color(225, 236, 248);      // azzurro ghiaccio

  // paese scelto: detail.html?paese=Nepal
  // getURLParams() non decodifica, quindi "United%20Kingdom" va decodificato
  let parametri = getURLParams();
  selezionata = decodeURIComponent(parametri.paese);

  // nel CSV le nazionalità vuote sono "", nella prima pagina le chiamiamo "Unknown"
  let valore = selezionata === "Unknown" ? "" : selezionata;

  // tutte le righe di quel paese
  let righe = data.findRows(valore, "Nationality");
  totalCountry = righe.length;

  // conto le cause di morte
  let counts = {};   // chiave: causa in minuscolo, valore: { nome, count }

  for (let riga of righe) {
    let cause = riga.getString("Cause of death").trim();
    if (cause === "") cause = "Unknown";

    let key = cause.toLowerCase();   // unisce "Heart attack" e "Heart Attack"
    if (!counts[key]) {
      counts[key] = { nome: cause, count: 0 };
    }
    counts[key].count++;
  }

  // trasformo in array e ordino dalla causa più frequente
  causes = Object.values(counts);
  causes.sort((a, b) => b.count - a.count);

  adjustCanvasHeight();
}

function draw() {
  // i dati non sono ancora pronti (setup è asincrono)
  if (!data) return;

  background(colSfondo);

  // pulsante indietro
  drawBackButton();
  cursor(isOverBack() ? HAND : ARROW);

  // intestazione
  noStroke();
  fill(colTesto);
  textAlign(LEFT, BASELINE);
  textSize(30);
  text(selezionata, 40, 120);

  textSize(15);
  text("Causes of death on Everest from " + selezionata, 40, 150);
  text("Total deaths: " + totalCountry, 40, 175);

  // legenda con bordo
  drawLegend();

  if (causes.length === 0) return;

  // --- GRIGLIA DI MONTAGNE (come nell'esempio dei glifi) ---
  let numeroGlifi = causes.length;
  let numeroColonne = getNumeroColonne();
  let numeroRighe = ceil(numeroGlifi / numeroColonne);
  let dimColonna = (width - 2 * marginX) / numeroColonne;
  let dimRiga = cellH;

  let maxCount = causes[0].count; // già ordinate: la prima è la più grande

  let xCorrente = marginX;
  let yCorrente = gridTop;

  for (let g = 0; g < numeroGlifi; g++) {
    mioGlifo(
      xCorrente + dimColonna / 2,
      yCorrente + dimRiga / 2,
      dimRiga,
      causes[g],
      maxCount,
      dimColonna
    );

    xCorrente = xCorrente + dimColonna;

    // a fine riga si va a capo
    if ((g + 1) % numeroColonne === 0) {
      xCorrente = marginX;
      yCorrente = yCorrente + dimRiga;
    }
  }

  textAlign(LEFT, BASELINE); // ripristino
}

// legenda semplice con bordo (come nella prima pagina)
function drawLegend() {
  let boxX = 30;
  let boxY = 195;

  // bordo
  noFill();
  stroke(colTesto);
  strokeWeight(1);
  rect(boxX, boxY, 340, 65);

  // mini montagna di esempio
  push();
  translate(boxX + 35, boxY + 48);
  disegnaMontagna(36, 30);
  pop();

  // spiegazione
  noStroke();
  fill(colTesto);
  textAlign(LEFT, BASELINE);
  textSize(13);
  text("Each mountain = one cause of death", boxX + 70, boxY + 28);
  text("Taller mountain = more people", boxX + 70, boxY + 46);
}

// glifo = una montagna per causa, con numero e nome sotto
// _x, _y = centro della cella, _size = altezza della cella, _cellW = larghezza della cella
function mioGlifo(_x, _y, _size, _causa, _maxCount, _cellW) {
  push();

  // l'origine (0,0) è la linea di base della montagna, un po' sotto il centro
  translate(_x, _y + _size * 0.08);

  let maxH = _size * 0.5;
  let minH = maxH * 0.35;

  // altezza: parte da un minimo e cresce con la radice quadrata del numero
  let h = lerp(minH, maxH, sqrt(_causa.count / _maxCount));
  let w = min(h * 1.4, _cellW * 0.75);

  disegnaMontagna(w, h);

  // numero di persone (blu, grande)
  noStroke();
  fill(colTesto);
  textAlign(CENTER, TOP);
  textSize(22);
  text(_causa.count, 0, 8);

  // nome originale della causa (blu, fino a 2 righe)
  textSize(14);
  let righe = wrapText(_causa.nome, _cellW - 16, 2);
  for (let i = 0; i < righe.length; i++) {
    text(righe[i], 0, 40 + i * 18);
  }

  pop();
}

// montagna = triangolo isoscele dritto, con piccola cima innevata simmetrica
// si disegna attorno a (0,0): la base sta sulla linea y = 0
function disegnaMontagna(w, h) {
  // contorno sottile: tiene visibile la sagoma su sfondo bianco
  stroke(colMontagna);
  strokeWeight(1.5);
  strokeJoin(ROUND);

  // corpo della montagna
  fill(colMontagna);
  triangle(0, -h, -w / 2, 0, w / 2, 0);

  // cima innevata con il bordo a denti (simmetrica)
  if (neve) {
    let yBordo = -h * 0.7;        // altezza a cui finisce la neve
    let dx = (w / 2) * 0.3;       // metà larghezza della neve

    fill(colNeve);
    beginShape();
    vertex(0, -h);
    vertex(dx, yBordo);
    vertex(dx * 0.5, yBordo - h * 0.06);
    vertex(0, yBordo + h * 0.04);
    vertex(-dx * 0.5, yBordo - h * 0.06);
    vertex(-dx, yBordo);
    endShape(CLOSE);
  }
}

// numero di colonne in base alla larghezza disponibile
function getNumeroColonne() {
  let availW = windowWidth - 2 * marginX;
  let maxCols = max(2, floor(availW / cellMinW));
  let numeroColonne = min(ceil(sqrt(causes.length)), maxCols);
  return max(1, numeroColonne);
}

// il canvas diventa abbastanza alto da contenere tutte le righe
function adjustCanvasHeight() {
  let numeroRighe = ceil(causes.length / getNumeroColonne());
  let needed = gridTop + numeroRighe * cellH + gridBottom;
  resizeCanvas(windowWidth, max(windowHeight, needed));
}

// accorcia un testo con "…" finché sta nella larghezza data
function fitText(str, maxW) {
  if (textWidth(str) <= maxW) return str;
  while (str.length > 1 && textWidth(str + "…") > maxW) {
    str = str.slice(0, -1);
  }
  return str + "…";
}

// spezza un testo in più righe (max maxLines); l'ultima viene accorciata con "…"
function wrapText(str, maxW, maxLines) {
  let words = str.split(" ");
  let lines = [];
  let current = "";

  for (let i = 0; i < words.length; i++) {
    let test = current === "" ? words[i] : current + " " + words[i];

    if (textWidth(test) <= maxW) {
      current = test;
    } else {
      if (current !== "") lines.push(current);
      current = words[i];
    }
  }
  if (current !== "") lines.push(current);

  // troppe righe: tengo le prime e accorcio l'ultima con "…"
  if (lines.length > maxLines) {
    let resto = lines.slice(maxLines - 1).join(" ");
    lines = lines.slice(0, maxLines - 1);
    lines.push(fitText(resto, maxW));
  }

  // una parola singola più larga della cella
  for (let i = 0; i < lines.length; i++) {
    lines[i] = fitText(lines[i], maxW);
  }
  return lines;
}

// posizione e raggio del pulsante "indietro" (in alto a sinistra)
function backButton() {
  return { x: marginX + 22, y: 44, r: 22 };
}

function isOverBack() {
  let b = backButton();
  return dist(mouseX, mouseY, b.x, b.y) <= b.r;
}

// pulsante rotondo con freccia verso sinistra + scritta a destra
function drawBackButton() {
  let b = backButton();
  let over = isOverBack();

  // cerchio
  stroke(colTesto);
  strokeWeight(2);
  fill(over ? colTesto : colSfondo);
  circle(b.x, b.y, b.r * 2);

  // freccia
  stroke(over ? colSfondo : colTesto);
  strokeWeight(2.5);
  strokeCap(ROUND);
  line(b.x + 10, b.y, b.x - 10, b.y);
  line(b.x - 10, b.y, b.x - 2, b.y - 8);
  line(b.x - 10, b.y, b.x - 2, b.y + 8);

  // scritta a destra del cerchio
  noStroke();
  fill(colTesto);
  textAlign(LEFT, CENTER);
  textSize(15);
  text("Back to chart", b.x + b.r + 12, b.y);

  textAlign(LEFT, BASELINE); // ripristino
}

// click sul pulsante: torna alla prima pagina
function mousePressed() {
  if (isOverBack()) {
    window.location.href = "index.html";
  }
}

function windowResized() {
  adjustCanvasHeight();
}