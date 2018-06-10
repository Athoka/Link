# The Legend of Link

## Diseño

- El juego está basado en The Legend of Zelda, la ya clásica saga desarrollada y publicada por Nintendo, más concretamente en The Legend of Zelda: Four Swords (GBA/2002) y The Legend of Zelda: Minish Cap (2004). Hemos simplificado mucho el concepto ya que son juegos de gran envergadura, pero la idea principal se mantiene.

## Objetivo del juego

- El objetivo principal del juego es que Link recorra el castillo derrotando a enemigos hasta llegar al enfrentamiento contra el jefe final. Una vez se derrote a este enemigo, el juego termina en victoria.
- Link puede recibir un número de impactos limitados antes de que termine el juego y, si este límite se supera, el juego termina en derrota.

## Mecánicas principales

- Movimiento libre: Link puede moverse libremente por el escenario, que contiene varias habitaciones interconectadas.
- Combate:
  - Link puede utilizar su espada para atacar en la dirección en la que esté mirando.
  - Si Link está mirando en la dirección que recibe un ataque empleará su escudo para defenderse.
- Salud: Tanto Link como los enemigos tienen un número de "puntos de impacto" que pueden soportar antes de morir.
- Interfaz: Indicador de salud, pantalla de inicio, créditos, etc.
- Tracking: Los enemigos son capaces de seguir a Link por el mapa para atacarle.
- Puzzle: La mazmorra contiene una prueba que hay que superar para avanzar.
- Interacción con el escenario: Link puede interactuar con algunos objetos y personajes del escenario para obtener información.

## Personajes

- Link: Personaje principal controlado por el jugador. Puede moverse en todas direcciones y atacar hacia arriba, hacia abajo y hacia ambos lados.
- Darknut: Enemigo. Persigue al jugador por el mapa cuando entra dentro de un radio de alcance y ataca cuando está lo suficientemente cerca.
- Dark Link: Jefe final. Similar a Link en apariencia y a Darknut en comportamiento, pero más rápido y más resistente.
- Princesa Zelda: Personaje que aparece al principio de la aventura para informarnos de nuestra misión. 

## Implementación

- Basado en Quintus. Utilizamos las bibliotecas Sprites, Scenes, Input, UI, Touch, TMX, Anim, 2D y Audio.

- Los personajes se extienden de Sprite y utilizan múltiples parámetros para funcionar correctamente, por ejemplo:
  - La gravedad se establece a 0, ya que el juego se desarrolla en vista cenital y no deben caer.
  - Cada personaje tiene un valor de vida (generalmente 3) que indica los impactos que puede soportar.
  - Link tiene un parámetro "attacking" que indica si tiene que usar la animación de movimiento o la de ataque.
- Los personajes están completamente animados utilizando spritesheets (extraídas del juego original).
- Los combates se basan en un sistema de colisiones en el que tanto enemigos como el jugador solo reciben daño si su oponente está atacando.
- Los enemigos utilizan un componente "aiTrack" que hemos implementado. Permite a los NPC seguir al jugador por el mapa cuando está dentro de un rango de acción, así como atacarle si está lo suficientemente cerca.

- Los cofres también se extienden de Sprite y contienen parámetros propios:
  - Un cofre sabe si ha sido abierto o no gracias a "open" (y cuándo se está abriendo gracias a "opening").
  - El contenido del cofre se indica en el parámetro "reward".
- Al ser objetos estáticos, los cofres solo tienen una animación de apertura, por lo que solo se usa el componente animation.

- Se han implementado barreras invisibles para que el jugador no pueda pasar más allá de los límites del mapa utilizando el sistema de colisiones de Quintus.

- En el castillo existe un puzzle en el que hay que activar dos interruptores para poder avanzar a la siguiente sala. Dichos interruptores cambian de color cuando han sido presionados. Una vez que el puzzle se resuelve, se indica mediante un sonido que se puede avanzar a la siguiente sala.  

- El escenario se ha construido utilizando Tiled con varios tileset obtenido de internet (fuente al final del documento)
- El mapa consta de varios escenarios: un pueblo, los exteriores del castillo y el interior del castillo. Cada escenario está en una escena diferente y se cambia de una a otra al llegar a las entradas y salidas del mismo.

- Los escenarios contienen enemigos, cofres, puzzles y personajes amigables.

## Reparto de tareas

- David Antuña
  - Programación general, creación de aiTrack, arreglo de bugs, programación del hud.
- Jaime Bas
  - Documento de alcance, arreglo de sprites, diseño e implementación de mapas y menús, memoria.
- Irene González
  - Documento de alcance, diseño general, programación general, arreglo de bugs, diseño de mapas.
- José Luis Moreno
  - Arreglo de sprites, programación general, interfaz, diseño de puzzles.

## Fuentes y referencias

- Personajes: Todos los sprites utilizados son propiedad de Nintendo. Spritesheets obtenidas de Sprite Database.
- Tileset: Todos los mapas son propiedad de Nintendo. Obtenidos de Spriteresource.
- Música: Toda la música y sonidos utilizados son propiedad de Nintendo. Obtenidos de http://noproblo.dayjo.org/ZeldaSounds/
