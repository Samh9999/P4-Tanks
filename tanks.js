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

        this.projectiles = []

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
                {ambient: .2, diffusivity: .8, specularity: .8, color: color(.9, .5, .9, 1)})
        };

        this.tankX = 0;
        this.tankY = 0;
        this.turretAngle = 0;
        this.barrelAngle = Math.PI/3;
        
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
        this.key_triggered_button("Fire projectile", ["x"], function () {

            //console.log("X, y x:" +  this.barrelFinal[0][3] + "," + this.barrelFinal[1][3] + "," + this.barrelFinal[2][3]);
            //console.log("x, y:" + this.tankX + "," + this.tankY);
            this.projectiles.push(new Projectile(this.tankX, this.tankY, 15, 1, 1, this.turretAngle, this.barrelAngle))
        })
        this.key_triggered_button("north", ["i"], () => { this.tankX++ });
        this.key_triggered_button("south", ["k"], () => {this.tankX--});
        this.key_triggered_button("east", ["l"], () => {this.tankY--});
        this.key_triggered_button("west", ["j"], () => {this.tankY++});


        this.key_triggered_button("turrret", ["c"], () => { this.turretAngle+=(Math.PI/180)});
        this.key_triggered_button("turret", ["v"], () => {this.turretAngle-=(Math.PI/180)});

        this.key_triggered_button("barrel up", ["u"], () => { 
             if (!(this.barrelAngle < 0)){
                 this.barrelAngle-=(Math.PI/360);
             }
        });
        this.key_triggered_button("barrel down", ["y"], () => {
             if (!(this.barrelAngle > Math.PI/2)){
                 this.barrelAngle+=(Math.PI/360);
             }
       });


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
            if(projectile.getPosition()[2][3] <= 0){
                //handle explostion
                this.projectiles.splice(i, 1);
                i--;
            } else {
                this.shapes.sphere.draw(context, program_state, projectile.getPosition(), this.materials.plastic)
            }
        }

        //this.shapes.sphere.draw(context, program_state, model_transform, this.materials.plastic)

        model_transform = Mat4.identity();        
        let tankSize = Mat4.scale(2, 2, 1); 
        let turretSize = Mat4.scale(1.4/2, 1.4/2, 1.4); 
        let barrelSize = Mat4.scale(.2/1.4, .2/1.4, 1.4/1.4); 
        let tankOffset = Mat4.translation(this.tankX/2, this.tankY/2, 0); //relaative to tankSize
        let turretOffset = Mat4.translation(0, 0, 1/1.4); //relative to turretSize
        let barrelOffset = Mat4.translation(0,0,2/(1.4*1.4)); //relaative to barrelSize
        let turretRotation = Mat4.rotation(this.turretAngle, 0, 0, 1); 
        let barrelRotation = Mat4.rotation(this.barrelAngle, 0, 1, 0);

        let tankFinal = model_transform.times(tankSize).times(tankOffset);
        let turretFinal = tankFinal.times(turretRotation).times(turretSize).times(turretOffset);
        let barrelFinal = turretFinal.times(barrelRotation).times(barrelSize).times(barrelOffset);


        this.shapes.sphere.draw(context, program_state, turretFinal, this.materials.plastic)
        this.shapes.cube.draw(context, program_state, tankFinal, this.materials.plastic);
        this.shapes.cube.draw(context, program_state, barrelFinal, this.materials.plastic)


    }
        
}

class Projectile {
    constructor(tankX, tankY, initial_velocity, damage, radius, flat_angle, verticle_angle){
        console.log(verticle_angle)
        verticle_angle = (Math.PI/2) - verticle_angle;
        console.log(verticle_angle)
        this.position = Mat4.identity().times(Mat4.scale(0.5, 0.5, 0.5)).
            times(Mat4.translation(tankX*2, tankY*2, 2.2)).
            times(Mat4.translation(Math.cos(verticle_angle)*Math.cos(flat_angle)*4.8, Math.cos(verticle_angle)*Math.sin(flat_angle)*4.8, Math.sin(verticle_angle)*4.8));
        this.z_velocity = Math.sin(verticle_angle)*initial_velocity;
        this.damage = damage;
        this.radius = radius;
        this.x_velocity = Math.cos(verticle_angle)*Math.cos(flat_angle)*initial_velocity;
        this.y_velocity = Math.cos(verticle_angle)*Math.sin(flat_angle)*initial_velocity;
        console.log(Math.cos(verticle_angle))
        console.log(Math.sin(verticle_angle))
        console.log("X_V: " + this.x_velocity)
        console.log("Y_V: " + this.y_velocity)
        console.log("Z_V: " + this.z_velocity)
        
    }

    updatePosition(dt){
        let dx = 2*dt*this.x_velocity;
        let dy = 2*dt*this.y_velocity;
        let dz = 2*dt*this.z_velocity;
        this.position = this.position.times(Mat4.translation(dx, dy, dz));
        this.z_velocity = this.z_velocity - (dt*9.81);
     }

     getPosition(){
         return this.position;
     }


}