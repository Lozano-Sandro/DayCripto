# Críptico (web instalable)

Juego de crucigramas crípticos: partida individual o reto a un compañero con puntos.

## Probar en tu computadora

1. Instala Node.js 18 o superior.
2. Dentro de la carpeta del proyecto:
   ```
   npm install
   npm start
   ```
3. Abre http://localhost:3000

Para probar el reto con otra persona, cada jugador debe usar un dispositivo distinto (dos celulares, o un celular y una PC). Dos pestañas de la misma PC comparten identidad y se pierden al cambiar de ventana.

## Publicar en internet (Render)

1. Sube esta carpeta a un repositorio de GitHub.
2. En https://render.com crea un servicio nuevo desde ese repositorio. Render detecta `render.yaml` y usa `npm install` y `npm start`.
3. Render te dará una dirección con HTTPS, por ejemplo `https://criptico.onrender.com`. Compártela.

Para instalarla: en Android (Chrome) aparece "Instalar app"; en iPhone (Safari) usa Compartir → "Añadir a pantalla de inicio".

## Aviso importante

En el plan gratuito de Render, `data.json` (puntos y usuarios) se borra cuando el servicio se reinicia o se redespliega. Para guardar los puntos de forma permanente hace falta una base de datos (PostgreSQL).

## Reglas del juego

- 3 intentos fallidos por partida. Al intentar por cuarta vez, pierdes.
- En el reto, si minimizas, cambias de ventana o de pestaña, cierras o recargas la página, pierdes y el rival gana el bote.
- En la partida individual no se apuestan puntos, pero la regla de salir de la app también aplica.
