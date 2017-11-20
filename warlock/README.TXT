Runjia Li, 204597009

---Introduction---

WARLOCK is a third-person shooting game. The player plays as a warlock trapped
inside a dungeon. He must defend himself against hordes of monsters. 

Use WASD to move, QE to turn, J to shoot, M to view the map and F to restart.
Your HP bar is located on the top.

The dungeon is procedurally generated. Clearing up all the monsters in current
level brings the you to the next level. The size of the dungeon being 
generated and the damage dealt by the monsters all scale with the level.

You can possibly obtain Salves(which heal you) and Shields(which provides you with
damage resistance) by destroying crates and urns that scatter in the dungeon. In 
addition, destroying Goblets(yellow particles levitating above a black stand) gives
you temporary damage boost.

Goblins (green) are the most common monsters. Ogres (large) are larger and slower. 
Draugrs (grey) are fast, and becomes Ghosts when killed. 

---Notable Mechanical Features---

1. Procedural generation: the dungeon is procedurally generated, so every time when
the game starts or a new level is reached the dungeon looks different. The layout of
rooms, placement of decorative objects and monsters are all randomly decided but in
a logically reasonable manner. (You can press M to view the map, then press F repeatedly 
to observe some different layouts) (Also, see arena.js)

2. Collision check: every drawn object is bounded by an invisible collision box. Every
time when an object moves to a new position, the game engine checks whether its 
collision box collides with that of other objects using some simple maths. If so, the 
object is moved back its last non-colliding position. (See movings.js)

3. Physics: all moving objects' motion are modelled using explicit Euler, by updating 
acceleration, velocity and position every time display() is called. As a result, for
example, the projectiles exhibit reasonable behavior.

4. Particle effects: basically, monsters explode into blocks when killed. Projectiles 
splatter into smaller blocks when hitting other objects. Both are implemented by creating
some small projectiles with random directions and velocities on death/collision

5. Performance optimization & energy saving: only objects within 300 radius of the player 
are drawn and animated, since the player does not have to see the other objects anyway. 
In addition, objects behind the player (except for monsters, for gameplay reasons)
are not drawn. Both reduce the number of function calls and calculations performed on
updating positions. 

6. Scene control: the game's overarching Scene Component is actually a finite-state machine
toggling between different gameplay states like "main", "dead", "win". At each state
some different routines are called. (See game.js)

7*. Monster AI (outside the scope of this class): the monsters share a very crude
implementation of AI. Essentially it is a hardcoded finite state machine with states like
"roaming", "aggro", "rest" and so on. It responds to changes in nearby regions by switching
between these states. For example when the player approaches the monsters will run at the
player. 


---Required Elements---
a. Creativity/Complexity/Overall quality: see the section above.

b. Hierarchical objects with at least three levels: the ogre's arms.

c. Camera tracking: the camera always follows the player.

d. Polygonal objects: see shapes.js. Notable examples include the trapezoid prism
and the pyramid.

e. Textures: the Goblets are textured.

f. Real-time speed: all motions are multiplied by graphics_state.animation_delta_time.

g. Display the frame rate: it is on the right hand side of the control panel, 
under the canvas. 
