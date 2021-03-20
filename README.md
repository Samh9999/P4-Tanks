# Tanks

By Sam Hirschhorn (UID: 205196190) and Zack Hirschhorn (UID: 005196191)

We created a game of tanks, where players take turns controlling a tank on opposite sides of a wall and try to hit the other tank with a projectile in order to reduce their health to zero.

Features:
- Our game features tank movement which can be controlled by the i,j,k,l keys.
- The player can move the turret around 360 degrees horizontally and the barrell up and and down vertically.
- There is a tracer extending from the barrell that shows the beggining of a projectiles flight, it can be toggled on or off to show the full projectile motion.
- In order to aim, players can toggle between normal view and tank view, which changes the camera to be right above and behind the tank and pointing in the same direction as the turret.
- In order to display the sky, we had four walls of sky color surrounding the arena. We do not display the close wall in normal view, so the camera can see through, and then we display it in tank view so the sky looks consistent in all directions.
- The player can then choose between three different types of projectiles. The higher number projectiles have larger explosions, but deal less damage.
- The player then adjusts the power and can shoot that projectile. We created a projectile class and calculated the initial velocity in all three directions from the power and angles of the turret/barrel.
- Every time slice we then adjusted the projectiles position using its velocity and its velocity using the acceleration due to gravity.
- When the project collided with a wall, ground, or tank it explodes.
- Explosions are their own objects with max radiuses and a growth rate, it grows quickly to that radius and then is deleted.
- If a tank is within the explosion radius it gets dealt damage and briefly lights up in red, to inidcate it was hit.
- After a projectile is fired, the other players turn starts and the controls start affecting their tank.
- It a tanks health gets to zero or below zero the game resets and players can play again
- Our game can easilty support many projectiles at once, as well as more than three tanks, since all state is stored in lists and rendered independently

Advanced Features:
- The projectile motion is calcualted using physics based simulation, as describes above
- Using the position and shapes of the projectiles, tanks, walls, and ground, collision detection was implemented
