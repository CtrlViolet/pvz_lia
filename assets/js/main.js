// =======================================
// OBTENER CANVAS Y CONTEXTO DE DIBUJO
// =======================================

// Canvas principal donde se dibuja el juego
const canvas = document.getElementById("gameCanvas")

// Contexto 2D para dibujar sprites, formas, etc.
const ctx = canvas.getContext("2d")


// =======================================
// DIMENSIONES BASE DEL JUEGO
// =======================================

// Tamaño real del fondo del juego
const GAME_WIDTH = 927
const GAME_HEIGHT = 657


// =======================================
// CONFIGURACION DEL TABLERO (GRID)
// =======================================

// PVZ usa 9 columnas y 5 filas
const COLS = 9
const ROWS = 5

// Posición final del césped dentro del fondo
let GRASS_X = 220
let GRASS_Y = 175

// Tamaño de cada celda del grid
let CELL_WIDTH = 71.11
let CELL_HEIGHT = 85.4


// =======================================
// ESCALADO PARA DIFERENTES PANTALLAS
// =======================================

// Variable que guarda el factor de escala
let scale = 1

function resizeCanvas(){

    // Tamaño de la pantalla del usuario
    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight

    // Escalado horizontal y vertical
    const scaleX = screenWidth / GAME_WIDTH
    const scaleY = screenHeight / GAME_HEIGHT

    // Usamos el menor para mantener proporción
    scale = Math.min(scaleX, scaleY)

    // Ajustar tamaño real del canvas
    canvas.width = GAME_WIDTH * scale
    canvas.height = GAME_HEIGHT * scale

    // Escalar todo el contexto
    ctx.setTransform(scale,0,0,scale,0,0)

}

// Recalcular si cambia tamaño de ventana
window.addEventListener("resize", resizeCanvas)

// Ejecutar al iniciar
resizeCanvas()


// =======================================
// CARGAR IMAGEN DEL FONDO
// =======================================

// Imagen del jardín
const garden = new Image()

// Ruta del archivo
garden.src = "assets/images/background/froont.png"


// =======================================
// TABLERO LOGICO DEL JUEGO
// =======================================

// Matriz donde se guardarán las plantas
let board = []

function createBoard(){

    for(let row = 0; row < ROWS; row++){

        // crear fila
        board[row] = []

        for(let col = 0; col < COLS; col++){

            // cada celda inicia vacía
            board[row][col] = null

        }

    }

}

// crear tablero
createBoard()


// =======================================
// DIBUJAR FONDO DEL JUEGO
// =======================================

function drawBackground(){

    ctx.drawImage(
        garden,
        0,
        0,
        GAME_WIDTH,
        GAME_HEIGHT
    )

}


// =======================================
// DIBUJAR GRID DEL JARDIN (SOLO DEBUG)
// =======================================

function drawGrid(){

    ctx.strokeStyle = "rgba(0,255,0,0.5)"
    ctx.lineWidth = 2

    for(let row = 0; row < ROWS; row++){

        for(let col = 0; col < COLS; col++){

            // calcular posición de celda
            let x = GRASS_X + col * CELL_WIDTH
            let y = GRASS_Y + row * CELL_HEIGHT

            ctx.strokeRect(
                x,
                y,
                CELL_WIDTH,
                CELL_HEIGHT
            )

        }

    }

}


// =======================================
// OBTENER CELDA SEGUN POSICION DEL MOUSE
// =======================================

function getCellFromMouse(mouseX, mouseY){

    // calcular columna
    let col = Math.floor((mouseX - GRASS_X) / CELL_WIDTH)

    // calcular fila
    let row = Math.floor((mouseY - GRASS_Y) / CELL_HEIGHT)

    // verificar si está dentro del grid
    if(col >= 0 && col < COLS && row >= 0 && row < ROWS){

        return {col,row}

    }

    return null

}


// =======================================
// DETECTAR CLICK DEL MOUSE
// =======================================

canvas.addEventListener("click", function(e){

    // obtener posicion real del canvas
    const rect = canvas.getBoundingClientRect()

    // ajustar por escala
    const mouseX = (e.clientX - rect.left) / scale
    const mouseY = (e.clientY - rect.top) / scale

    // obtener celda correspondiente
    const cell = getCellFromMouse(mouseX, mouseY)

    if(cell){

        // verificar si la celda está libre
        if(board[cell.row][cell.col] === null){

            // colocar planta de prueba
            board[cell.row][cell.col] = "plant"

            console.log("Planta colocada en:",cell.row,cell.col)

        }

    }

})


// =======================================
// DIBUJAR PLANTAS DE PRUEBA
// =======================================

function drawPlants(){

    for(let row = 0; row < ROWS; row++){

        for(let col = 0; col < COLS; col++){

            // si hay una planta en esa celda
            if(board[row][col] !== null){

                // calcular posicion
                let x = GRASS_X + col * CELL_WIDTH
                let y = GRASS_Y + row * CELL_HEIGHT

                // dibujar rectangulo de prueba
                ctx.fillStyle = "yellow"

                ctx.fillRect(
                    x + 10,
                    y + 10,
                    CELL_WIDTH - 20,
                    CELL_HEIGHT - 20
                )

            }

        }

    }

}


// =======================================
// GAME LOOP PRINCIPAL
// =======================================

function gameLoop(){

    // limpiar pantalla
    ctx.clearRect(0,0,canvas.width,canvas.height)

    // dibujar fondo
    drawBackground()

    // dibujar grid
    drawGrid()

    // dibujar plantas
    drawPlants()

    // repetir ciclo
    requestAnimationFrame(gameLoop)

}


// =======================================
// INICIAR JUEGO CUANDO CARGUE EL FONDO
// =======================================

garden.onload = function(){

    gameLoop()

}