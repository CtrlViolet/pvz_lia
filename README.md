# 🌱 Plantas vs Combis (JavaScript)

Proyecto inspirado en *Plants vs Zombies*, desarrollado completamente en JavaScript utilizando Canvas.  
Incluye sistema de oleadas, animaciones por sprites, generación de recursos y lógica de combate en tiempo real.

---

## 🎮 Características

- 🌿 Sistema de plantas:
  - Girasol (genera soles)
  - Lanzaguisantes
  - Repetidora
  - Nuez
  - Mejora de repetidora

- 🧟 Sistema de enemigos:
  - Zombies con animaciones (caminar, comer, morir)
  - Vida escalable por ronda
  - Movimiento y colisiones con plantas

- 🔫 Sistema de combate:
  - Proyectiles con detección de colisiones
  - Daño ajustable
  - Eliminación de enemigos con animación

- ☀ Sistema de recursos:
  - Generación automática de soles
  - Producción de soles por girasoles
  - Límite máximo de recursos

- 🌊 Sistema de oleadas:
  - Incremento progresivo de dificultad
  - Cantidad de enemigos por ronda
  - Intervalos de aparición dinámicos

- 🎨 Animaciones:
  - Sprites por frame
  - Sistema de fallback en caso de error de carga
  - Animaciones independientes por entidad

- 🖱 Interacción:
  - Selección de plantas mediante UI
  - Colocación en grid
  - Recolección de soles con clic

- 💀 Game Over:
  - Detección cuando un zombie cruza la línea
  - Pantalla animada de fin de juego
  - Reinicio con clic

---

## 🧠 Lógica del Juego

El juego está basado en un sistema de **grid (filas y columnas)** donde:

- Cada planta ocupa una celda
- Los zombies avanzan por filas
- Se detectan colisiones planta-zombie
- Se ejecutan acciones según estado:
  - `walk`
  - `eat`
  - `dead`

---

## ⚙️ Tecnologías usadas

- HTML5
- CSS3
- JavaScript (Vanilla)
- Canvas API

---

## 🎵 Extras

- Música de fondo integrada
- Pantalla inicial con botón de inicio
- Efectos visuales y UI temática

---

## 📱 Diseño Responsive

- Adaptado para:
  - Monitores grandes (2K)
  - Laptops
  - Dispositivos móviles

- Uso de:
  - Flexbox
  - Bootstrap 5 (Navbar y Footer)

---

## 🚀 Cómo ejecutar

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/tu-repo.git