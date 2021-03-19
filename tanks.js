import {defs, tiny} from './examples/common.js';

// Pull these names into this module's scope for convenience:
const {vec3, vec4, color, hex_color, Mat4, Light, Shape, Material, Shader, Texture, Scene} = tiny;
const {Triangle, Square, Tetrahedron, Windmill, Cube, Subdivision_Sphere} = defs;

export class Tanks extends Scene {
    constructor() {                  // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();
        this.hover = this.swarm = false;
        // At the beginning of our program, load one of each of these shape
        // definitions onto the GPU.  NOTE:  Only do this ONCE per shape it
        // would be redundant to tell it again.  You should just re-use the
        // one called "box" more than once in display() to draw multiple cubes.
        // Don't define more than one blueprint for the same thing here.
        this.shapes = {
            'cube': new Cube(),
            'sphere': new Subdivision_Sphere(4),
        };

        this.projectiles = [];
        this.tanks = [new Tank(0, 0, 0, Math.PI/3), new Tank(5, 5, 0, Math.PI/3)];
        this.currentTank = 0;
        this.explosions = [];

        // *** Materials: *** Define a shader, and then define materials that use
        // that shader.  Materials wrap a dictionary of "options" for the shader.
        // Here we use a Phong shader and the Material stores the scalar
        // coefficients that appear in the Phong lighting formulas so that the
        // appearance of particular materials can be tweaked via these numbers.
        const phong = new defs.Phong_Shader();
        this.materials = {
            plastic: new Material(phong,
                {ambient: .2, diffusivity: .8, specularity: .5, color: color(.9, .5, .9, 1)}),
            metal: new Material(phong,
                {ambient: .2, diffusivity: .8, specularity: .8, color: color(.9, .5, .9, 1)}),
            explosion: new Material(phong,
                {ambient: 50, specularity: 50}),
            ground: new Material(phong,
                 {ambient: 0.2, diffusivity: 1, specularity: 0, color: hex_color("#fff09c")})
        };

        //this.tankX = 0;
        //this.tankY = 0;
        //this.turretAngle = 0;
        //this.barrelAngle = Math.PI/3;
        
    }

    make_control_panel() {
        // make_control_panel(): Sets up a panel of interactive HTML elements, including
        // buttons with key bindings for affecting this scene, and live info readouts.
        //this.control_panel.innerHTML += "Dragonfly rotation angle: ";
        // The next line adds a live text readout of a data member of our Scene.
        //this.live_string(box => {
        //    box.textContent = (this.hover ? 0 : (this.t % (2 * Math.PI)).toFixed(2)) + " radians"
        //});
        //this.new_line();
        //this.new_line();F
        // Add buttons so the user can actively toggle data members of our Scene:
        this.live_string(box => {
           box.textContent = "Current player: " + (this.currentTank+1);
        });
        this.new_line()
        this.live_string(box => {
            box.textContent = "Current projectile for Tank 1: " + (this.tanks[0].projectileType+1);
        });
        this.new_line()
        
        this.live_string(box => {
            box.textContent = "Current power for Tank 1: " + (this.tanks[0].power);
        });
        this.new_line()
        this.live_string(box => {
            box.textContent = "Current health for Tank 1: " + (this.tanks[0].health);
        });
        this.new_line()
        this.live_string(box => {
            box.textContent = "Current power for Tank 2: " + (this.tanks[1].power);
        });
        this.new_line()
        this.live_string(box => {
            box.textContent = "Current projectile for Tank 2: " + (this.tanks[1].projectileType+1);
        });
        this.new_line()
        this.live_string(box => {
            box.textContent = "Current health for Tank 2: " + (this.tanks[1].health);
        });
        this.new_line()

        this.key_triggered_button("Fire projectile", ["x"], function () {

            //console.log("X, y x:" +  this.barrelFinal[0][3] + "," + this.barrelFinal[1][3] + "," + this.barrelFinal[2][3]);
            //console.log("x, y:" + this.tankX + "," + this.tankY);
            this.projectiles.push(new Projectile(this.tanks[this.currentTank].tankX, this.tanks[this.currentTank].tankY, this.tanks[this.currentTank].power, this.tanks[this.currentTank].projectileType, this.tanks[this.currentTank].turretAngle, this.tanks[this.currentTank].barrelAngle));
            this.currentTank++;
            if(this.currentTank == this.tanks.length){
                this.currentTank = 0;
            }
        })
        this.new_line()
        this.key_triggered_button("north", ["i"], () => { 
            //this.tankX++ 
            this.tanks[this.currentTank].tankX++;
        });
        this.key_triggered_button("south", ["k"], () => {this.tanks[this.currentTank].tankX--});
        this.key_triggered_button("east", ["l"], () => {this.tanks[this.currentTank].tankY--});
        this.key_triggered_button("west", ["j"], () => {this.tanks[this.currentTank].tankY++});

        this.new_line()
        this.key_triggered_button("turrret", ["c"], () => { this.tanks[this.currentTank].turretAngle+=(Math.PI/180)});
        this.key_triggered_button("turret", ["v"], () => {this.tanks[this.currentTank].turretAngle-=(Math.PI/180)});
        
        this.new_line()
        this.key_triggered_button("barrel up", ["u"], () => { 
             if (!(this.tanks[this.currentTank].barrelAngle < 0)){
                 this.tanks[this.currentTank].barrelAngle-=(Math.PI/360);
             }
        });
        this.key_triggered_button("barrel down", ["y"], () => {
             if (!(this.tanks[this.currentTank].barrelAngle > Math.PI/2)){
                 this.tanks[this.currentTank].barrelAngle+=(Math.PI/360);
             }
       });
       this.new_line();
       this.key_triggered_button("Switch projectile", ["m"], () => {
           this.tanks[this.currentTank].projectileType++;
           if(this.tanks[this.currentTank].projectileType == 3){
               this.tanks[this.currentTank].projectileType = 0;
           }
       });
       this.new_line();
       this.key_triggered_button("Power Down", ["-"], () => {
           if(this.tanks[this.currentTank].power > 0){
                this.tanks[this.currentTank].power--;              
           }
       });
       this.key_triggered_button("Power Up", ["+"], () => {this.tanks[this.currentTank].power++});

    }


    display(context, program_state) {
        // display():  Called once per frame of animation.  We'll isolate out
        // the code that actually draws things into Transfolljrms_Sandbox, a
        // subclass of this Scene.  Here, the base class's display only does
        // some initial setup.

        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());

            // Define the global camera and projection matrices, which are stored in program_state.  The camera
            // matrix follows the usual format for transforms, but with opposite values (cameras exist as
            // inverted matrices).  The projection matrix follows an unusual format and determines how depth is
            // treated when projecting 3D points onto a plane.  The Mat4 functions perspective() and
            // orthographic() automatically generate valid matrices for one.  The input arguments of
            // perspective() are field of view, aspect ratio, and distances to the near plane and far plane.
            program_state.set_camera(Mat4.translation(0, 0, -100));
        }
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        let model_transform = Mat4.identity();

        // *** Lights: *** Values of vector or point lights.  They'll be consulted by
        // the shader when coloring shapes.  See Light's class definition for inputs.
        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        const angle = Math.sin(t);
        const light_position = Mat4.identity().times(vec4(0, -1, 1, 0));
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        for(var i = 0; i < this.projectiles.length; i++){
            let projectile = this.projectiles[i];
            projectile.updatePosition(dt);
            if(projectile.position[2][3] <= 0){
                let x = projectile.position[0][3];
                let y = projectile.position[1][3];
                this.explosions.push(new Explosion(x, y, projectile.radius, 0.05, projectile.color));
                for(var j = 0; j < this.tanks.length; j++){
                    let dx = x - this.tanks[j].tankX;
                    let dy = y - this.tanks[j].tankY;
                    let distance = Math.sqrt((dx*dx)+(dy*dy));
                    console.log(this.tanks[j])
                    console.log("pxy: " + x + "," + y);
                    console.log("txy: " + this.tanks[j].tankX + "," + this.tanks[j].tankY)
                    console.log("d:" + distance)
                    console.log(projectile.radius)
                    if(distance < (projectile.radius+2)){
                        this.tanks[j].health -= projectile.damage;
                    }
                }
                this.projectiles.splice(i, 1);
                i--;
            } else {
                this.shapes.sphere.draw(context, program_state, projectile.position, this.materials.plastic.override({color:projectile.color}))
            }
        }
        
        //console.log(this.explosions);

        for(var i = 0; i < this.explosions.length; i++){
            //console.log("here");
            let explosion = this.explosions[i];
            explosion.growRadius(dt)
            let explosionMatrix = Mat4.identity().times(
                Mat4.scale(explosion.radius, explosion.radius, explosion.radius)).times(
                Mat4.translation(explosion.x/explosion.radius, explosion.y/explosion.radius, 0));
            this.shapes.sphere.draw(context, program_state, explosionMatrix, this.materials.explosion.override({color:explosion.color}));
            explosion.timeLeft = explosion.timeLeft - dt;
            if(explosion.timeLeft <= 0){
                this.explosions.splice(i, 1);
                i--;
            }
        }

        //this.shapes.sphere.draw(context, program_state, model_transform, this.materials.plastic)

        for(var i = 0; i < this.tanks.length; i++){
            model_transform = Mat4.identity();        
            let tankSize = Mat4.scale(2, 2, 1); 
            let turretSize = Mat4.scale(1.4/2, 1.4/2, 1.4); 
            let barrelSize = Mat4.scale(.2/1.4, .2/1.4, 1.4/1.4); 
            let tankOffset = Mat4.translation(this.tanks[i].tankX/2, this.tanks[i].tankY/2, 0); //relaative to tankSize
            let turretOffset = Mat4.translation(0, 0, 1/1.4); //relative to turretSize
            let barrelOffset = Mat4.translation(0,0,2/(1.4*1.4)); //relaative to barrelSize
            let turretRotation = Mat4.rotation(this.tanks[i].turretAngle, 0, 0, 1); 
            let barrelRotation = Mat4.rotation(this.tanks[i].barrelAngle, 0, 1, 0);

            let tankFinal = model_transform.times(tankSize).times(tankOffset);
            let turretFinal = tankFinal.times(turretRotation).times(turretSize).times(turretOffset);
            let barrelFinal = turretFinal.times(barrelRotation).times(barrelSize).times(barrelOffset);


            this.shapes.sphere.draw(context, program_state, turretFinal, this.materials.plastic)
            this.shapes.cube.draw(context, program_state, tankFinal, this.materials.plastic);
            this.shapes.cube.draw(context, program_state, barrelFinal, this.materials.plastic);
//        let tankMatrices = this.tanks[this.currentTank].getTankMatrices()
        //this.shapes.sphere.draw(context, program_state, tankMatrices[0], this.materials.plastic)
        //this.shapes.cube.draw(context, program_state, tankMatrices[1], this.materials.plastic);
        //this.shapes.cube.draw(context, program_state, tankMatrices[2], this.materials.plastic)
        }

        let groundMatrix = Mat4.identity().times(Mat4.scale(100, 100, 1)).times(
            Mat4.translation(0, 0, -3));
        this.shapes.cube.draw(context, program_state, groundMatrix, this.materials.ground);

    }
        
}

class Projectile {
    constructor(tankX, tankY, initial_velocity, projectileType, flat_angle, verticle_angle){
        console.log(verticle_angle)
        verticle_angle = (Math.PI/2) - verticle_angle;
        console.log(verticle_angle)
        this.position = Mat4.identity().times(Mat4.scale(0.5, 0.5, 0.5)).
            times(Mat4.translation(tankX*2, tankY*2, 2.2)).
            times(Mat4.translation(Math.cos(verticle_angle)*Math.cos(flat_angle)*4.8, Math.cos(verticle_angle)*Math.sin(flat_angle)*4.8, Math.sin(verticle_angle)*4.8));
        this.z_velocity = Math.sin(verticle_angle)*initial_velocity;
        this.x_velocity = Math.cos(verticle_angle)*Math.cos(flat_angle)*initial_velocity;
        this.y_velocity = Math.cos(verticle_angle)*Math.sin(flat_angle)*initial_velocity;
        /*console.log(Math.cos(verticle_angle))
        console.log(Math.sin(verticle_angle))
        console.log("X_V: " + this.x_velocity)
        console.log("Y_V: " + this.y_velocity)
        console.log("Z_V: " + this.z_velocity)*/
     

        if(projectileType == 1) {
            this.radius = 1;
            this.damage = 15;
            this.color = hex_color("#FFA500");
        } else if(projectileType == 2) {
            this.radius = 2;
            this.damage = 10;
            this.color = hex_color("#FFFF00");
        } else {
            this.radius = 0.5;
            this.damage = 20;
            this.color = hex_color("#FF0000");
        }

    }

    updatePosition(dt){
        let dx = 2*dt*this.x_velocity;
        let dy = 2*dt*this.y_velocity;
        let dz = 2*dt*this.z_velocity;
        this.position = this.position.times(Mat4.translation(dx, dy, dz));
        this.z_velocity = this.z_velocity - (dt*9.81);
     }


}

class Tank {
    constructor(tankX, tankY, turretAngle, barrelAngle){
        this.tankX = tankX;
        this.tankY = tankY;
        this.turretAngle = turretAngle;
        this.barrelAngle = barrelAngle;
        this.projectileType = 0;
        this.power = 15;
        this.health = 100;
    }
}

class Explosion {
    constructor(x, y, finalRadius, time, color){
        this.x = x;
        this.y = y;
        this.radius = 0.5;
        this.growthRate = finalRadius/time;
        this.timeLeft = time;
        this.color = color;
    }

    growRadius(dt){
        this.radius += dt*this.growthRate;
    }
}