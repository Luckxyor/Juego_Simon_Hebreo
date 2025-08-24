# Juego "Simón" en Hebreo (para tablets, 4–5 años)

Este proyecto es una app web simple (HTML/CSS/JS) pensada para tablets. La interfaz es en hebreo, grande y táctil.

## Cómo usar

1. Asegúrate de que los audios estén en la carpeta `assets/` (ya incluidos):
   - `assets/אָדֹם.mp3` (Rojo – אָדֹם)
   - `assets/יָרֹק.mp3` (Verde – יָרֹק)
   - `assets/כָּחֹל.mp3` (Azul – כָּחֹל)
   - `assets/צָהֹב.mp3` (Amarillo – צָהֹב)

   Los nombres deben mantenerse exactamente igual (UTF-8) para que el mapeo funcione.

2. Abre `index.html` en el navegador de la tablet o PC. No requiere servidor.

3. Pulsa el botón "הַתְחֵל" dentro del círculo central para comenzar.

4. Toca los colores en el orden del patrón que se muestra/escucha.

## Controles y accesibilidad

- Diseño RTL y textos en hebreo.
- Botones grandes, aptos para dedos pequeños.
- Estados anunciados en texto (área en vivo) y feedback visual (brillo) + sonoro (MP3 por color).

## Nivel

El juego tiene una sola velocidad fija (un único nivel) pensada para 4–5 años.

## Estructura

- `index.html`: Maquetación y UI.
- `styles.css`: Estilos táctiles y responsivos.
- `script.js`: Lógica del juego (generación de secuencia, reproducción, entradas del usuario y audio).
- `assets/`: MP3 de los colores en hebreo con ניקוד (puntuación vocálica).

## Notas

- Algunos navegadores móviles requieren una interacción del usuario antes de permitir audio; el juego precarga tras el primer toque.
- Si al tocar no suena, verifica que los archivos están en `assets/audio/` con los nombres indicados y que el volumen del dispositivo esté activo.
- Puedes instalar como "app" en tablets añadiendo un acceso directo desde el navegador.

---
¡Listo para jugar! 🇮🇱🎨🔊
