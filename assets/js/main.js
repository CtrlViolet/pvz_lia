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
    // cambiar comportamiento según estado
    if (this.state === "walk") {
      this.x -= this.speed;
    }

    // actualizar animación actual
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
// 7.5 ZOMBIES
// =======================================
let zombies = [];

// =======================================
// 7.6 LÓGICA DE ZOMBIES y proyectiles
// =======================================

let projectiles = [];

function updateZombies() {
  spawnTimer++;

  if (spawnTimer >= spawnInterval) {
    spawnTimer = 0;
    spawnZombie();
  }

  for (let i = 0; i < zombies.length; i++) {
    let z = zombies[i];

    let col = Math.floor((z.x - GRASS_X) / CELL_WIDTH);

    if (col >= 0 && col < COLS) {
      let plant = board[z.row][col];

      if (plant !== null) {
        // 🧠 zombie entra en modo comer
        z.state = "eat";

        plant.hp -= 0.2;

        if (plant.hp <= 0) {
          board[z.row][col] = null;

          // vuelve a caminar
          z.state = "walk";
        }

        continue; // importante
      }
    }

    // si no hay planta
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

      if (plant !== null) {
        if (
          (plant.type === PLANTS.PEASHOOTER ||
            plant.type === PLANTS.REPEATER ||
            plant.type === PLANTS.REPEATER_UPGRADE) &&
          hasZombieInRow(row)
        ) {
          // cooldown
          if (!plant.shootTimer) {
            plant.shootTimer = 0;
          }

          plant.shootTimer++;

if (plant.shootTimer > 60) {
  let x = GRASS_X + col * CELL_WIDTH + CELL_WIDTH / 2;
  let y = GRASS_Y + row * CELL_HEIGHT + CELL_HEIGHT / 2;

  // 🌱 LANZAGUISANTES NORMAL
  if (plant.type === PLANTS.PEASHOOTER) {
    shootPea(x, y, row);
  }

  // 🌱🌱 REPETIDORA (2 disparos seguidos)
  if (plant.type === PLANTS.REPEATER) {
    shootPea(x, y, row);

    setTimeout(() => {
      shootPea(x, y, row);
    }, 150);
  }

  // 🌱🌱🌱 MEJORA (3 disparos)
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
      selectedIcon = i;
      return;
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
      if (current === PLANTS.REPEATER) {
        board[cell.row][cell.col] = PLANTS.REPEATER_UPGRADE;
      }
      return;
    }

    if (current === null) {
      board[cell.row][cell.col] = {
        type: selectedIcon,
        hp: 100,
      };
    }
  }
});

// =======================================
// 13. GAME LOOP
// =======================================

function gameLoop(){

    ctx.clearRect(0,0,canvas.width,canvas.height)

    drawBackground()
    updatePlants ()      // ← primero lógica
    updateZombies()   // ← primero lógica
    updateProjectiles()  // ← luego lógica

    drawPlants()
    drawZombies()     // ← luego render
    drawProjectiles()  // ← luego render
    drawUI()

    requestAnimationFrame(gameLoop)

}
// =======================================
// 14. START
// =======================================

garden.onload = function () {
  gameLoop();
};
