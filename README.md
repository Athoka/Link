# The Legend of Link
## Diseño
* El juego está basado en The Legend of Zelda, la ya clásica saga desarrollada y publicada por Nintendo, más concretamente en The Legend of Zelda: Four Swords (GBA/2002) y The Legend of Zelda: Minish Cap (2004). Hemos simplificado mucho el concepto ya que son juegos de gran envergadura, pero la idea principal se mantiene.

## Objetivo del juego
* El objetivo principal del juego es que Link recorra una mazmorra derrotando a enemigos hasta llegar al enfrentamiento contra el jefe final. Una vez se derrote a este enemigo, el juego termina en victoria.
* Link puede recibir un número de impactos limitados antes de que termine el juego y, si este límite se supera, el juego termina en derrota.

## Mecánicas principales
* Movimiento libre: Link puede moverse libremente por el escenario, que contiene varias habitaciones interconectadas.
* Combate: Link puede utilizar su espada para atacar en la dirección en la que esté mirando.
* Salud: Tanto Link como los enemigos tienen un número de "puntos de impacto" que pueden soportar antes de morir.
* Interfaz: Indicador de salud, pantalla de inicio, créditos, etc.
* Tracking: Los enemigos son capaces de seguir a Link por el mapa para atacarle.
* Puzzle: La mazmorra contiene una prueba que hay que superar para avanzar.
* Interacción con el escenario: Link puede interactuar con algunos objetos del escenario para obtener información.

## Personajes
* Link: Personaje principal controlado por el jugador. Puede moverse en todas direcciones y atacar hacia arriba, hacia abajo y hacia ambos lados.
* Darknut: Enemigo. Persigue al jugador por el mapa cuando entra dentro de un radio de alcance y ataca cuando está lo suficientemente cerca.
* Dark Link: Jefe final. Similar a Link en apariencia y a Darknut en comportamiento, pero más rápido y más resistente.

## Implementación
* Basado en Quintus. Utilizamos las bibliotecas Sprites, Scenes, Input, UI, Touch, TMX, Anim, 2D y Audio.

* Los personajes se extienden de Sprite y utilizan múltiples parámetros para funcionar correctamente, por ejemplo:
  * La gravedad se establece a 0, ya que el juego se desarrolla en vista cenital y no deben caer.
  * Cada personaje tiene un valor de vida (generalmente 3) que indica los impactos que puede soportar.
  * Link tiene un parámetro "attacking" que indica si tiene que usar la animación de movimiento o la de ataque.
* Los personajes están completamente animados utilizando spritesheets (extraídas del juego original).
* Los combates se basan en un sistema de colisiones en el que tanto enemigos como el jugador solo reciben daño si su oponente está atacando.
* Los enemigos utilizan un componente "aiTrack" que hemos implementado. Permite a los NPC seguir al jugador por el mapa cuando está dentro de un rango de acción, así como atacarle si está lo suficientemente cerca.

* Los cofres también se extienden de Sprite y contienen parámetros propios:
  * Un cofre sabe si ha sido abierto o no gracias a "open" (y cuándo se está abriendo gracias a "opening").
  * El contenido del cofre se indica en el parámetro "reward".
* Al ser objetos estáticos, los cofres solo tienen una animación de apertura, por lo que solo se usa el componente animation.

* Se han implementado barreras invisibles para que el jugador no pueda pasar más allá de los límites del mapa utilizando el sistema de colisiones de Quintus.

* Las casillas de activación sirven para resolver un puzzle en la mazmorra. Si se tocan, se muestra un mensaje al jugador para que sepa que ha completado el puzzle.

* El escenario se ha construido utilizando Tiled con un tileset obtenido de internet (fuente al final del documento)
* El mapa consta de varias habitaciones interconectadas. Se cargan todas simultáneamente y, al llegar a una de las salidas de una habitación, se traslada a Link a la siguiente.
* Los escenarios contienen enemigos, cofres, puzzles, etc.

## Reparto de tareas
* David Antuña
  * Programación general, creación de aiTrack, arreglo de bugs.
* Jaime Bas
  * Documento de alcance, arreglo de sprites, diseño e implementación de mapas y menús, memoria.
* Irene González
  * Documento de alcance, diseño general, programación general, arreglo de bugs.
* José Luis Moreno
  * Arreglo de sprites, programación general, interfaz, diseño de puzzles.
  
 ## Fuentes y referencias
 * Personajes: Todos los sprites utilizados son propiedad de Nintendo. Spritesheets obtenidas de Sprite Database.
 * Tileset: Pokémon/Zelda Style tileset (por Gassassin en OpenGameArt.org, @Gazzazin en Twitter).
