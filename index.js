var firework_colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'silver', 'white'];
class Color {
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
        this.color_str = 'rgba(' + this.r.toString() + ',' + this.g.toString() + ',' + this.b.toString() + ',' + this.a.toString() + ')';
    }
    change_a(a) {
        this.a = a;
        this.color_str = 'rgba(' + this.r.toString() + ',' + this.g.toString() + ',' + this.b.toString() + ',' + this.a.toString() + ')';
    }
}
var exp_color = [new Color(238, 75, 43, 1), new Color(255, 165, 0, 1), new Color(255, 255, 0, 1),
    new Color(170, 255, 0, 1), new Color(0, 150, 255, 1), new Color(191, 64, 191, 1),
    new Color(124, 130, 136, 1), new Color(253, 254, 255, 1)
];

function gen_int(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}
class Firework {
    constructor(particle, color_index, firework_sound_takeoff, firework_sound_exp, firework_sound_particle, x_start, y_start, x_end, y_end) {
        this.x_start = x_start;
        this.y_start = y_start;
        this.x_end = x_end;
        this.y_end = y_end;
        this.x_current = x_start;
        this.y_current = y_start;
        this.particle = particle;
        this.color_index = color_index;
        this.current_step = 0;
        this.sound_takeoff = firework_sound_takeoff;
        this.sound_exp = firework_sound_exp;
        this.sound_particle = firework_sound_particle;
    }
}

function mouse_click_firework(x, y) {
    if (mouse_click_firework_status) {
        if (current_sound_index === max_sound_index) {
            current_sound_index = 0;
        }
        let firework_obj = new Firework(false, gen_int(0, firework_colors.length),
            firework_sound_takeoff[current_sound_index], firework_sound_exp[current_sound_index],
            firework_sound_particle[current_sound_index],
            gen_int(10, canvas_width - 20),
            gen_int(canvas_height / 1.5, canvas_height - 10),
            x,
            y);
        fireworks.push(firework_obj);
        mouse_click_firework_status = false;
    }
}

function draw() {
    let remove_index = 0;
    context.clearRect(0, 0, canvas_width, canvas_height);
    for (let i = 0; i < fireworks.length; ++i) {
        let firework = fireworks[i];
        if (!firework.particle && firework.current_step === 0) {
            firework.sound_takeoff.pause();
            firework.sound_takeoff.currentTime = 0;
            firework.sound_takeoff.play();
        }
        if (firework.x_current !== firework.x_end && firework.y_current !== firework.y_end) {
            let x_inc = (firework.x_end - firework.x_start) / rate;
            let y_inc = (firework.y_end - firework.y_start) / rate;
            let x_next = firework.x_current + x_inc;
            if ((Math.sign(firework.x_end - firework.x_start) === 1 && x_next > firework.x_end) ||
                (Math.sign(firework.x_end - firework.x_start) === -1 && x_next < firework.x_end)) {
                x_next = firework.x_end;
            }
            let y_next = firework.y_current + y_inc;
            if ((Math.sign(firework.y_end - firework.y_start) === 1 && y_next > firework.y_end) ||
                (Math.sign(firework.y_end - firework.y_start) === -1 && y_next < firework.y_end)) {
                y_next = firework.y_end;
            }
            if (!firework.particle) {
                context.strokeStyle = firework_colors[firework.color_index];
            } else {
                let temp = exp_color[firework.color_index];
                temp.change_a((1 - firework.current_step * (1 / rate)));
                context.strokeStyle = temp.color_str;
            }
            context.beginPath();
            context.moveTo(firework.x_current, firework.y_current);
            // uncomment to debug
            //if (firework.x_start === firework.x_current) {
            //    context.fillStyle = 'red';
            //} else {
            //    context.fillStyle = 'orange';
            //}
            //context.fillRect(firework.x_current, firework.y_current, 5, 5);
            context.lineTo(x_next, y_next);
            // uncomment to debug
            //context.fillStyle = 'blue';
            //context.fillRect(x_next, y_next, 5, 5);
            context.stroke();
            fireworks[i].x_current = x_next;
            fireworks[i].y_current = y_next;
            ++fireworks[i].current_step;
            if (current_sound_index < firework_sound_takeoff.length) {
                ++current_sound_index;
            } else {
                current_sound_index = 0;
            }
        } else {
            if (!firework.particle) {
                firework.sound_exp.pause();
                firework.sound_exp.currentTime = 0;
                firework.sound_exp.play();
                let particle_num = gen_int(min_particles, max_particles);
                for (let i = 0; i < particle_num; ++i) {
                    // x2 + y2 = particle_max_distance2
                    // y2 = particle_max_distance2 - x2
                    // y = +-sqrt(particle_max_distance2 - x2)
                    let particle_x_dist = gen_int(-1 * particle_max_distance, particle_max_distance + 1);
                    let temp = Math.sqrt(particle_max_distance * particle_max_distance - particle_x_dist * particle_x_dist);
                    let particle_y_dist = gen_int(-1 * temp, temp + 1);
                    fireworks.push(new Firework(true, firework.color_index, firework.sound_takeoff, firework.sound_exp, firework.sound_particle,
                        firework.x_current, firework.y_current,
                        firework.x_current + particle_x_dist, firework.y_current + particle_y_dist));
                }
                firework.sound_particle.pause();
                firework.sound_particle.currentTime = 0;
                firework.sound_particle.play();
            }
            fireworks.splice(i - remove_index, 1);
            ++remove_index;
        }
    }
    if (index % firework_creation_rate === 0) {
        if (current_sound_index === max_sound_index) {
            current_sound_index = 0;
        }
        let firework_obj = new Firework(false, gen_int(0, firework_colors.length),
            firework_sound_takeoff[current_sound_index], firework_sound_exp[current_sound_index],
            firework_sound_particle[current_sound_index],
            gen_int(10, canvas_width - 20),
            gen_int(canvas_height / 1.5, canvas_height - 10),
            gen_int(particle_max_distance, canvas_width - particle_max_distance),
            gen_int(particle_max_distance, canvas_height / 2));
        fireworks.push(firework_obj);
    }
    if (index % mouse_click_firework_rate === 0) {
        mouse_click_firework_status = true;
    }
    ++index;
    requestAnimationFrame(draw);
}
document.addEventListener('click', function (event) {
    mouse_click_firework(event.clientX, event.clientY);
});
var canvas_id = 'canvas_main';
var canvas = document.getElementById(canvas_id);
if (canvas.getContext) {
    var context = canvas.getContext('2d');
    let dpr = window.devicePixelRatio || 1;
    let rect = canvas.getBoundingClientRect();
    // Give the canvas pixel dimensions of their CSS
    // size * the device pixel ratio.
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    // Get the size of the canvas in CSS pixels.
    context.scale(dpr, dpr);
    context.fillStyle = "rgba(0, 0, 0, 0)"; // black
    var canvas_width = canvas.width / dpr;
    var canvas_height = canvas.height / dpr;
    var mouse_click_firework_status = true;
    var mouse_click_firework_rate = 40;
    var firework_exp_sound_path = "firework.wav";
    var firework_takeoff_sound_path = "firework_takeoff.wav";
    var firework_particle_sound_path = "firework_particle.wav";
    var firework_sound_exp = [];
    var firework_sound_takeoff = [];
    var firework_sound_particle = [];
    var current_sound_index = 0;
    var max_sound_index = 10;
    for (let i = 0; i < max_sound_index; ++i) {
        let temp = new Audio(firework_takeoff_sound_path);
        temp.volume = 0.03; // takeoff volume
        firework_sound_takeoff.push(temp);
        temp = new Audio(firework_exp_sound_path);
        temp.volume = 0.5; // explosion volume
        firework_sound_exp.push(temp);
        temp = new Audio(firework_particle_sound_path);
        temp.volume = 0.2; // particle volume
        firework_sound_particle.push(temp);
    }
    var fireworks = [];
    var firework_creation_rate = 40;
    var min_particles = 50;
    var max_particles = 500;
    var particle_max_distance = 100;
    var rate = 50;
    var index = 0;
    requestAnimationFrame(draw);
} else {
    document.write('Sorry');
}