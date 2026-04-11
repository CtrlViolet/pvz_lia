// =======================================
// 1. CANVAS
// =======================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// =======================================
// 2. DIMENSIONES
// =======================================

const GAME_WIDTH = 927;
const GAME_HEIGHT = 657;

// =======================================
// 2.5 GAME OVER
// =======================================
let gameOver = false

let gameOverScale = 0 // empieza invisible
let gameOverImage = new Image()

// cambia la ruta tú
gameOverImage.src = "assets/images/background/gameover.png"

// =======================================
// 3. TIPOS DE PLANTAS
// =======================================

const PLANTS = {
  SUNFLOWER: 0,
  PEASHOOTER: 1,
  REPEATER: 2,
  WALLNUT: 3,
  REPEATER_UPGRADE: 4,
  SHOVEL: 5,
};

// =======================================
// 3.5 TIPOS DE OLEADAS
// =======================================

const WAVES = [
  { count: 3, interval: 120 },
  { count: 5, interval: 100 },
  { count: 8, interval: 80 },
  { count: 12, interval: 60 },
];
// =======================================
// 4. CLASES
// =======================================

class SpriteAnimation {
  constructor(path, totalFrames) {
    this.path = path;
    this.totalFrames = totalFrames;
    this.currentFrame = 0;
    this.frameSpeed = 8;
    this.frameTimer = 0;
    this.images = [];
    this.loadImages();
  }

  loadImages() {
    for (let i = 0; i < this.totalFrames; i++) {
      let num = i.toString().padStart(2, "0");
      let img = new Image();
      img.src = this.path + "frame_" + num + "_delay-0.08s.gif";
      img.onerror = () => {
        console.error("Error cargando frame:", img.src);
      };
      this.images.push(img);
    }
  }

  update() {
    this.frameTimer++;
    if (this.frameTimer >= this.frameSpeed) {
      this.frameTimer = 0;
      this.currentFrame++;
      if (this.currentFrame >= this.totalFrames) {
        this.currentFrame = 0;
      }
    }
  }
  draw(x, y, width, height) {
    let img = this.images[this.currentFrame];

    if (img && img.complete && img.naturalWidth !== 0) {
      ctx.drawImage(img, x, y, width, height);
    } else {
      // dibuja el frame anterior si falla
      let fallback = this.images[this.currentFrame - 1];

      if (fallback && fallback.complete) {
        ctx.drawImage(fallback, x, y, width, height);
      }
    }
  }
}

class Zombie {
  constructor(row) {
    this.row = row;

    this.x = GRASS_X + COLS * CELL_WIDTH;
    this.y = GRASS_Y + row * CELL_HEIGHT;

    this.width = CELL_WIDTH;
    this.height = CELL_HEIGHT;

    this.speed = 0.3;
    this.hp = 100;

    // estado actual
    this.state = "walk"; // walk | eat | dead

    // animaciones
    this.animations = {
      walk: new SpriteAnimation("assets/images/zombies/zombie_walking/", 21),
      eat: new SpriteAnimation("assets/images/zombies/zombie_eating/", 20),
      dead: new SpriteAnimation("assets/images/zombies/zombie_death/", 17),
    };
  }

  update() {
    if (this.state === "walk") {
      this.x -= this.speed;
    }

    if (this.state === "dead") {
      this.deathTimer++;

      // duración de animación
      if (this.deathTimer > 29) {
        this.toDelete = true;
      }
    }

    this.animations[this.state].update();
  }

  draw() {
    this.animations[this.state].draw(
      this.x - 20, // ← mover izquierda
      this.y - 20, // ← subir
      this.width + 40, // ← agrandar ancho
      this.height + 40, // ← agrandar alto
    );
  }
}

class Projectile {
  constructor(x, y, row) {
    this.x = x;
    this.y = y;
    this.row = row;

    this.width = 20;
    this.height = 20;

    this.speed = 2;
    this.damage = 20;
  }

  update() {
    this.x += this.speed;
  }

  draw() {
    // puedes cambiar esto por sprite después
    ctx.fillStyle = "lime";
    ctx.beginPath();
    ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
    ctx.fill();
  }
}
function shootPea(x, y, row) {
  projectiles.push(new Projectile(x, y, row));
}

// =======================================
// SPAWN DE ZOMBIES
// =======================================

let spawnTimer = 0
let spawnInterval = 200 // frames

let currentWave = 0
let waveInProgress = false

let waveTimer = 0
let timeBetweenWaves = 300 // tiempo de espera

let zombiesToSpawn = 0
let zombiesSpawned = 0

function spawnZombie(){

    let randomRow = Math.floor(Math.random() * ROWS)

    let zombie = new Zombie(randomRow)

    zombies.push(zombie)

}
// =======================================
// 5. INSTANCIAS (ANIMACIONES)
// =======================================

const plantAnimations = {};

plantAnimations[PLANTS.SUNFLOWER] = new SpriteAnimation(
  "assets/images/plants/girasol/",
  12,
);
plantAnimations[PLANTS.PEASHOOTER] = new SpriteAnimation(
  "assets/images/plants/lanzaguisantes/",
  24,
);
plantAnimations[PLANTS.REPEATER] = new SpriteAnimation(
  "assets/images/plants/repetidora/",
  19,
);
plantAnimations[PLANTS.WALLNUT] = new SpriteAnimation(
  "assets/images/plants/nuez/",
  11,
);
plantAnimations[PLANTS.REPEATER_UPGRADE] = new SpriteAnimation(
  "assets/images/plants/repetidora_mejora/",
  12,
);


// =======================================
// 6. UI (ICONOS)
// =======================================

const iconImages = [];

const iconPaths = [
  "assets/images/icons/girasol_icon.png",
  "assets/images/icons/lanzaguisantes_icon.png",
  "assets/images/icons/repetidora_icon.png",
  "assets/images/icons/nuez_icon.png",
  "assets/images/icons/metralleta_icon.png",
  "assets/images/icons/pala_icon.png",
];

for (let i = 0; i < iconPaths.length; i++) {
  let img = new Image();
  img.src = iconPaths[i];
  iconImages.push(img);
}

let selectedIcon = -1;

let UI_X = 230;
let UI_Y = 48;
let ICON_WIDTH = 58;
let ICON_HEIGHT = 80;
let ICON_SPACING = 10;
const TOTAL_ICONS = 6;

// =======================================
// 7. GRID
// =======================================

const COLS = 9;
const ROWS = 5;

let GRASS_X = 220;
let GRASS_Y = 175;

let CELL_WIDTH = 71.11;
let CELL_HEIGHT = 85.4;


// =======================================
// 7.4 LÓGICA DE LOS SOLES
// =======================================
let suns = [];
let sunSpawnTimer = 0
let sunSpawnInterval = 300 // base
let sunPoints = 50;

const PLANT_COST = {
  [PLANTS.SUNFLOWER]: 50,
  [PLANTS.PEASHOOTER]: 100,
  [PLANTS.REPEATER]: 200,
  [PLANTS.WALLNUT]: 50,
  [PLANTS.REPEATER_UPGRADE]: 150,
};
function drawSunCounter() {
  ctx.fillStyle = "yellow";
  ctx.font = "24px Arial";

  ctx.fillText("☀ " + sunPoints, 20, 100);
}
// =======================================
// 7.5 ZOMBIES
// =======================================
let zombies = [];

// =======================================
// 7.6 LÓGICA DE ZOMBIES y proyectiles
// =======================================

let projectiles = [];
function updateZombies() {
  
  /*spawnTimer++;
  
  if (spawnTimer >= spawnInterval) {
    spawnTimer = 0;
    spawnZombie();
  }*/

  for (let i = 0; i < zombies.length; i++) {
    let z = zombies[i]; // ← SIEMPRE primero


    if (z.x <= GRASS_X - 50) {
      // cuando pasa el límite izquierdo
      gameOver = true;
    }

    // =======================================
    // ZOMBIE MUERTO
    // =======================================
    if (z.state === "dead") {
      z.update();

      if (z.toDelete) {
        zombies.splice(i, 1);
        i--;
      }

      continue;
    }

    // =======================================
    // DETECTAR COLISION CON PLANTA
    // =======================================

    let col = Math.floor((z.x - GRASS_X) / CELL_WIDTH);

    if (col >= 0 && col < COLS) {
      let plant = board[z.row][col];

      if (plant !== null) {
        z.state = "eat";

        plant.hp -= 0.2;

        if (plant.hp <= 0) {
          board[z.row][col] = null;

          z.state = "walk";
        }

        continue;
      }
    }

    // =======================================
    // CAMINAR
    // =======================================

    z.state = "walk";
    z.update();
  }
}
// =======================================
// 8. TABLERO
// =======================================

let board = [];

function createBoard() {
  for (let row = 0; row < ROWS; row++) {
    board[row] = [];
    for (let col = 0; col < COLS; col++) {
      board[row][col] = null;
    }
  }
}

createBoard();

// =======================================
// 9. ESCALADO
// =======================================

let scale = 1;

function resizeCanvas() {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  const scaleX = screenWidth / GAME_WIDTH;
  const scaleY = screenHeight / GAME_HEIGHT;

  scale = Math.min(scaleX, scaleY);

  canvas.width = GAME_WIDTH * scale;
  canvas.height = GAME_HEIGHT * scale;

  ctx.setTransform(scale, 0, 0, scale, 0, 0);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// =======================================
// 10. FONDO
// =======================================

const garden = new Image();
garden.src = "assets/images/background/froont.png";

// =======================================
// 11. FUNCIONES DE DIBUJO
// =======================================

function drawBackground() {
  ctx.drawImage(garden, 0, 0, GAME_WIDTH, GAME_HEIGHT);
}

function drawUI() {
  for (let i = 0; i < TOTAL_ICONS; i++) {
    let x = UI_X + i * (ICON_WIDTH + ICON_SPACING);
    let y = UI_Y;

    let img = iconImages[i];

    if (img && img.complete) {
      ctx.drawImage(img, x, y, ICON_WIDTH, ICON_HEIGHT);
    }

    ctx.strokeStyle = i === selectedIcon ? "yellow" : "white";
    ctx.lineWidth = i === selectedIcon ? 3 : 1;

    ctx.strokeRect(x, y, ICON_WIDTH, ICON_HEIGHT);
  }
}

function spawnSun() {
  let x = Math.random() * (GAME_WIDTH - 80) + 40;

  suns.push({
    x: x,
    y: -50, // empieza arriba
    targetY: Math.random() * (GAME_HEIGHT - 200) + 100,
    speed: 1,
    value: 25,
    collected: false,
  });
}
function updateSuns() {
  sunSpawnTimer++;

  if (sunSpawnTimer > sunSpawnInterval) {
    spawnSun();

    sunSpawnTimer = 0;

    // intervalo variable (no tan predecible)
    sunSpawnInterval = 200 + Math.random() * 200;
  }

  for (let i = 0; i < suns.length; i++) {
    let s = suns[i];

    // caer hasta su destino
    if (s.y < s.targetY) {
      s.y += s.speed;
    }

    // eliminar si ya fue recogido
    if (s.collected) {
      suns.splice(i, 1);
      i--;
    }
  }
}

function drawSuns() {
  for (let s of suns) {
    ctx.fillStyle = "yellow";

    ctx.beginPath();
    ctx.arc(s.x, s.y, 20, 0, Math.PI * 2);
    ctx.fill();
  }
}

function startWave() {
  if (currentWave >= WAVES.length) {
    console.log("Ganaste (por ahora)");
    return;
  }

  let wave = WAVES[currentWave];

  zombiesToSpawn = wave.count;
  zombiesSpawned = 0;

  spawnInterval = wave.interval;

  waveInProgress = true;

  console.log("Oleada:", currentWave + 1);
}
function updateWaves() {
  // esperar siguiente oleada
  if (!waveInProgress) {
    waveTimer++;

    if (waveTimer >= timeBetweenWaves) {
      waveTimer = 0;
      startWave();
    }

    return;
  }

  // spawnear zombies
  spawnTimer++;

  if (spawnTimer >= spawnInterval && zombiesSpawned < zombiesToSpawn) {
    spawnZombie();

    zombiesSpawned++;
    spawnTimer = 0;
  }

  // verificar fin de oleada
  if (zombiesSpawned >= zombiesToSpawn && zombies.length === 0) {
    waveInProgress = false;
    currentWave++;

    console.log("Oleada terminada");
  }
}

function drawPlants() {

  for (let row = 0; row < ROWS; row++) {

    for (let col = 0; col < COLS; col++) {

      let plant = board[row][col]; // ← aquí el cambio

      if (plant !== null) {

        let x = GRASS_X + col * CELL_WIDTH;
        let y = GRASS_Y + row * CELL_HEIGHT;

        let anim = plantAnimations[plant.type];

        if (anim) {
          anim.update();
          anim.draw(
            x + 5,
            y + 5,
            CELL_WIDTH - 10,
            CELL_HEIGHT - 10
          );
        }

      }

    }

  }

}
function updatePlants() {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      let plant = board[row][col];

      if (plant === null) continue;

      // =======================================
      // 🌻 GIRASOL GENERA SOLES
      // =======================================

      if (plant.type === PLANTS.SUNFLOWER) {
        if (!plant.sunTimer) plant.sunTimer = 0;

        plant.sunTimer++;

        if (plant.sunTimer > 300) {
          suns.push({
            x: GRASS_X + col * CELL_WIDTH + CELL_WIDTH / 2,
            y: GRASS_Y + row * CELL_HEIGHT,
            targetY: GRASS_Y + row * CELL_HEIGHT + 20,
            speed: 0.5,
            value: 25,
            collected: false,
          });

          plant.sunTimer = 0;
        }
      }

      // =======================================
      // 🔫 PLANTAS QUE DISPARAN
      // =======================================

      if (
        (plant.type === PLANTS.PEASHOOTER ||
          plant.type === PLANTS.REPEATER ||
          plant.type === PLANTS.REPEATER_UPGRADE) &&
        hasZombieInRow(row)
      ) {
        // inicializar cooldown
        if (!plant.shootTimer) plant.shootTimer = 0;

        plant.shootTimer++;

        if (plant.shootTimer > 60) {
          let x = GRASS_X + col * CELL_WIDTH + CELL_WIDTH / 2;
          let y = GRASS_Y + row * CELL_HEIGHT + CELL_HEIGHT / 2;

          // 🌱 LANZAGUISANTES
          if (plant.type === PLANTS.PEASHOOTER) {
            shootPea(x, y, row);
          }

          // 🌱🌱 REPETIDORA
          if (plant.type === PLANTS.REPEATER) {
            shootPea(x, y, row);

            setTimeout(() => {
              shootPea(x, y, row);
            }, 150);
          }

          // 🌱🌱🌱 MEJORA
          if (plant.type === PLANTS.REPEATER_UPGRADE) {
            shootPea(x, y, row);

            setTimeout(() => {
              shootPea(x, y, row);
            }, 120);

            setTimeout(() => {
              shootPea(x, y, row);
            }, 240);
          }

          plant.shootTimer = 0;
        }
      }
    }
  }
}
function updateProjectiles() {
  for (let i = 0; i < projectiles.length; i++) {
    let p = projectiles[i];

    p.update();

    // eliminar si sale de pantalla
    if (p.x > GAME_WIDTH) {
      projectiles.splice(i, 1);
      i--;
      continue;
    }

    // colisión con zombies
    for (let j = 0; j < zombies.length; j++) {
      let z = zombies[j];

      if (p.row === z.row && p.x < z.x + z.width && p.x + p.width > z.x) {

        // daño
        z.hp -= p.damage;
        if (z.hp <= 0) {
          z.state = "dead";
          z.deathTimer = 0;
        }
        // eliminar proyectil
        projectiles.splice(i, 1);
        i--;
        break;
      }
    }
  }
}

function drawProjectiles() {
  for (let p of projectiles) {
    p.draw();
  }
}
function drawZombies() {
  for (let i = 0; i < zombies.length; i++) {
    zombies[i].draw();
  }
}
function hasZombieInRow(row) {
  for (let i = 0; i < zombies.length; i++) {
    let z = zombies[i];

    // solo si está en la misma fila y en pantalla
    if (z.row === row && z.x > 0) {
      return true;
    }
  }

  return false;
}

function drawGameOver() {
  // crecer poco a poco
  if (gameOverScale < 1) {
    gameOverScale += 0.02;
  }

  let centerX = GAME_WIDTH / 2;
  let centerY = GAME_HEIGHT / 2;

  let width = 400 * gameOverScale;
  let height = 200 * gameOverScale;

  let x = centerX - width / 2;
  let y = centerY - height / 2;

  // fondo oscuro
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // imagen
  ctx.drawImage(gameOverImage, x, y, width, height);

  // texto reiniciar
  if (gameOverScale >= 1) {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("CLICK PARA REINICIAR", centerX - 150, centerY + 100);
  }
}

// =======================================
// 12. INPUT
// =======================================

function getCellFromMouse(mouseX, mouseY) {
  let col = Math.floor((mouseX - GRASS_X) / CELL_WIDTH);
  let row = Math.floor((mouseY - GRASS_Y) / CELL_HEIGHT);

  if (col >= 0 && col < COLS && row >= 0 && row < ROWS) {
    return { col, row };
  }

  return null;
}

canvas.addEventListener("click", function (e) {
  if (gameOver) {
    location.reload();
    return;
  }
  const rect = canvas.getBoundingClientRect();
  const mouseX = (e.clientX - rect.left) / scale;
  const mouseY = (e.clientY - rect.top) / scale;

  // ICONOS
  for (let i = 0; i < TOTAL_ICONS; i++) {
    let x = UI_X + i * (ICON_WIDTH + ICON_SPACING);
    let y = UI_Y;

if (
  mouseX >= x &&
  mouseX <= x + ICON_WIDTH &&
  mouseY >= y &&
  mouseY <= y + ICON_HEIGHT
) {
  // 🔁 toggle selección
  if (selectedIcon === i) {
    selectedIcon = -1; // deseleccionar
    console.log("Deseleccionado");
  } else {
    selectedIcon = i;
    console.log("Seleccionado:", i);
  }

  return;
}
  }

  // =======================================
// CLICK EN SOLES
// =======================================

for(let i = 0; i < suns.length; i++){

    let s = suns[i]

    let dx = mouseX - s.x
    let dy = mouseY - s.y

    let dist = Math.sqrt(dx*dx + dy*dy)

    if(dist < 20){

        sunPoints += s.value
        s.collected = true

        console.log("☀️ +25 → Total:", sunPoints)

        return
    }

}

  // GRID
  const cell = getCellFromMouse(mouseX, mouseY);

  if (cell && selectedIcon !== -1) {
    let current = board[cell.row][cell.col];

    if (selectedIcon === PLANTS.SHOVEL) {
      if (current !== null) {
        board[cell.row][cell.col] = null;
      }
      return;
    }

    if (selectedIcon === PLANTS.REPEATER_UPGRADE) {
      let cost = PLANT_COST[PLANTS.REPEATER_UPGRADE] || 0;

      // validar si hay repetidora
      if (current !== null && current.type === PLANTS.REPEATER) {
        // validar soles
        if (sunPoints >= cost) {
          sunPoints -= cost;

          board[cell.row][cell.col] = {
            type: PLANTS.REPEATER_UPGRADE,
            hp: current.hp,
          };

          selectedIcon = -1; // 👈 deseleccionar

          console.log("Repetidora mejorada. Soles:", sunPoints);
        } else {
          console.log("No tienes suficientes soles");
        }
      } else {
        console.log("Solo puedes mejorar una repetidora");
      }

      return;
    }

    if (current === null) {
      let cost = PLANT_COST[selectedIcon] || 0;

      if (sunPoints >= cost) {
        sunPoints -= cost;

        board[cell.row][cell.col] = {
          type: selectedIcon,
          hp: 100,
          shootTimer: 0,
        };

        selectedIcon = -1; // ← DESELECCIONA AUTOMÁTICAMENTE
        
        console.log("Plantado. Soles:", sunPoints);
      } else {
        console.log("No tienes suficientes soles");
      }
    }
  }
});

// =======================================
// 13. GAME LOOP
// =======================================
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground();

  if (!gameOver) {
    updateWaves(); // 👈 FALTABA
    updatePlants();
    updateZombies();
    updateProjectiles();
    updateSuns(); // 👈 FALTABA
  }

  drawPlants();
  drawZombies();
  drawProjectiles();
  drawSuns(); // 👈 también faltaba dibujar
  drawUI();
  drawSunCounter(); // 👈 mostrar soles

  if (gameOver) {
    drawGameOver();
  }

  requestAnimationFrame(gameLoop);
}
// =======================================
// 14. START
// =======================================

garden.onload = function () {
  gameLoop();
};
