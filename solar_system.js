"use strict"

var tex_vert=`#version 300 es
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
in vec3 normal_in;
uniform mat3 normalMatrix;

in vec3 position_in;
in vec2 texcoord_in;

out vec2 tc;
out vec3 N;
out vec3 P;

void main()
{
	gl_Position = projectionMatrix * viewMatrix * vec4(position_in,1);
	tc = vec2(texcoord_in.x, 1.0 - texcoord_in.y);
	vec4 P4 = viewMatrix * vec4(position_in, 1.0);
	P = P4.xyz;
	N = normalMatrix * normal_in;
}`;


var tex_frag=`#version 300 es
precision highp float;
uniform sampler2D TU0;
in vec2 tc;
out vec4 frag_out;

void main()
{
	vec3 col = texture(TU0,tc).rgb;
	frag_out = vec4(col,1.0);
}`;

var color_vert=`#version 300 es
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
in vec3 position_in;
void main()
{
	gl_PointSize = 8.0;
	gl_Position = projectionMatrix*viewMatrix*vec4(position_in, 1.0);
}
`;

var color_frag=`#version 300 es
precision highp float;
vec3 color;
out vec4 frag_out;

void main()
{
	color = vec3(1.0,1.0,1.0);
	frag_out = vec4(color, 1.0);
}
`;

var illum_vert=`#version 300 es
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;
uniform sampler2D TU0;
out vec2 tc;
vec3 color;
vec3 color_back;
float specness;
float shininess;
vec3 light_pos;
in vec2 texcoord_in;
in vec3 position_in;
in vec3 normal_in;
out vec3 col;

void main()
{
	tc = vec2(texcoord_in.x, 1.0 - texcoord_in.y);
	color = texture(TU0,tc).rgb;
	color_back = vec3(0,0,0);
	specness = 66.0;
	shininess = 0.5;
	light_pos=vec3(0,0,0);
	vec4 Po4 = viewMatrix * vec4(position_in,1);
	vec3 Po = Po4.xyz;
	gl_Position = projectionMatrix * Po4;

	vec3 N = normalize( normalMatrix * normal_in);
	vec3 L = normalize(light_pos-Po);
	
	float lamb = 0.15+0.85*max(dot(N,L),0.0);
	vec3 E = normalize(-Po);
	vec3 R = reflect(-L, N);
	float spec = pow( max(dot(R,E), 0.0), specness);
	vec3 specol = mix(color, vec3(1.0),shininess);
	col = mix(color*lamb,specol,spec);
}`;

var illum_frag=`#version 300 es
precision highp float;
in vec3 col;
out vec4 frag_out;

void main()
{
	frag_out = vec4(col,1);
}`;


var b=0;
var i;
var BB = null;
var animation = null;
var animationd = null;
var prg_tex = null;
var prg_illum = null;
var prg_s = null;
var vao1 = null;
var tsun = null;
var tmer = null;
var tven = null;
var tear = null;
var tmoo = null;
var tmar = null;
var tjup = null;
var tsat = null;
var tura = null;
var tnep = null;
var tsat_ring = null;
var meshsun_rend = null;
var meshring_rend = null;

var sl_lp;
var sca=0;
var Resolution = 100;
var Rad;
var mode = 0;
var orb =0;
var Tlaps;
var sl_tl=30;

var Rmer=15;
var Rven=18;
var Rear=20;
var Rmoo=0.4;
var Rmar=23;
var Rjup=30;
var Rsat=40;
var Rura=50;
var Rnep=70;


var Ssun =14;
var Smer=0.05;
var Sven=0.12;
var Sear=0.12;
var Smoo=0.03;
var Smar=0.06;
var Sjup=1.43;
var Ssat=1.21;
var Sura=0.51;
var Snep=0.49;
let zoom = 20;


function onkey_wgl(k)
{
    switch (k) {
        
        case 'ArrowLeft':
            BB.center.x -= zoom/10;
            break;
        case 'ArrowRight':
            BB.center.x += zoom/10;
            break;
        case 'ArrowUp':
            BB.center.y += zoom/10;
            break;
        case 'ArrowDown':
            BB.center.y -= zoom/10;
            break;
        case '+':
        	BB.radius -= zoom/150;
            break;
        case '-':
        	BB.radius += zoom/200;
            break;
        default:
        	return false;
            break;
    }
    update_wgl();
}


function init_wgl()
{
	UserInterface.begin(); // name of html id
	UserInterface.use_field_set('V','Render');

	UserInterface.add_check_box('Orbit ',false, (c)=>
	{
		if (c)
		{
			orb=1;
			update_wgl();
		}
		else
		{
			orb=0;
			update_wgl();
		}
	});

	UserInterface.add_check_box('Animate ',false, (c)=>
	{
		if (c)
		{
			animation = setInterval( () => { b += sl_tl.value/100; update_wgl(); }, Tlaps);
		}
		else
		{
			window.clearInterval(animation);
			animation = null;
		}
	});

	UserInterface.add_check_box('Follow_earth ',false, (c)=>
	{
		if(c)
		{
			    animationd=setInterval( ()=> {BB.center.x=Rear*Math.cos(1.6*b*2*Math.PI/360);
    			BB.center.y=Rear*Math.sin(1.6*b*2*Math.PI/360);
    			update_wgl();
    		},Tlaps);
		}
		else
		{
			BB=meshsun.BB;
			window.clearInterval(animationd);
			animationd = null;
		}

	});

	UserInterface.add_check_box('Illum',false, (c) =>
	{
		if (c)
		{
			mode=1;
			update_wgl();
		}
		else
		{
			mode=0;
			update_wgl();
		}
	});

	sl_tl=UserInterface.add_slider('time_speed',1,500,100,update_wgl);
    UserInterface.use_field_set('V',"Touches");
    UserInterface.add_label("fleches: déplacements");
    UserInterface.add_label("+/-: zoom");
    UserInterface.end_use();
	UserInterface.end_use();
	UserInterface.adjust_width();
	prg_s = ShaderProgram(color_vert,color_frag,'color1');
	prg_tex = ShaderProgram(tex_vert,tex_frag,'tex_solar_syst');
	prg_illum = ShaderProgram(illum_vert,illum_frag,'illum');


	let meshsun = Mesh.Sphere(50);
	let meshring = Mesh.Tore(50);
	BB = meshsun.BB;
	meshsun_rend = meshsun.renderer(true,true,true);
	meshring_rend = meshring.renderer(true,true,true);



	tsun = Texture2d();
	tsun.load("sun.jpg",gl.RGBA8,gl.RGBA,true).then(update_wgl);
	tmer = Texture2d();
	tmer.load("mercury.jpg",gl.RGBA8,gl.RGBA,true).then(update_wgl);
	tven = Texture2d();
	tven.load("venus.jpg",gl.RGBA8,gl.RGBA,true).then(update_wgl);
	tear = Texture2d();
	tear.load("earth.jpg",gl.RGBA8,gl.RGBA,true).then(update_wgl);
	tmoo = Texture2d();
	tmoo.load("moon.jpg",gl.RGBA8,gl.RGBA,true).then(update_wgl);
	tmar = Texture2d();
	tmar.load("mars.jpg",gl.RGBA8,gl.RGBA,true).then(update_wgl);
	tjup = Texture2d();
	tjup.load("jupiter.jpg",gl.RGBA8,gl.RGBA,true).then(update_wgl);
	tsat = Texture2d();
	tsat.load("saturne.jpg",gl.RGBA8,gl.RGBA,true).then(update_wgl);
	tura = Texture2d();
	tura.load("uranus.jpg",gl.RGBA8,gl.RGBA,true).then(update_wgl);
	tnep = Texture2d();
	tnep.load("neptune.jpg",gl.RGBA8,gl.RGBA,true).then(update_wgl);
	tsat_ring = Texture2d();
	tsat_ring.load("saturne_ring.jpg",gl.RGBA8,gl.RGBA,true).then(update_wgl);


	let C = new Float32Array(3*Resolution);
	Rad = new Float32Array([Rmer,Rven,Rear,Rmar,Rjup,Rsat,Rura,Rnep]);

	for (i=0;i<3*Resolution;i+=3){
		C[i]=Math.cos((i/3)*(360/Resolution)*2*Math.PI/360);
		C[i+1]=Math.sin((i/3)*(360/Resolution)*2*Math.PI/360);
		C[i+2]=0;
	}
	let vbo_c=VBO(C,3);

	vao1= VAO([POSITION_ATTRIB,vbo_c]);

}


function draw_wgl()
{
	gl.clearColor(0,0,0,1);
	gl.enable(gl.DEPTH_TEST);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	const projection_matrix = scene_camera.get_projection_matrix();
	const view_matrix = scene_camera.get_view_matrix();

	scene_camera.set_scene_radius(BB.radius+35);
	scene_camera.set_scene_center(BB.center);



	switch(orb){
		case 0:
			break;
		case 1:
			prg_s.bind();
			update_uniform('projectionMatrix', projection_matrix)
			update_uniform('viewMatrix', view_matrix);

			vao1.bind();

			for (let a=0; a<8; ++a)
			{
		        const vm = scale(Rad[a],Rad[a],1);
		        update_uniform('viewMatrix',view_matrix.mult(vm));
				gl.drawArrays(gl.LINE_LOOP, 0, Resolution);
			}
			break;
		default:
			break;
	}
	
	

	switch (mode) {
		case 0:
			prg_tex.bind();
			break;
		case 1:
			prg_illum.bind();
			break;
		default:
			prg_tex.bind();
			break;
		}

	update_uniform('projectionMatrix', projection_matrix)
	update_uniform('viewMatrix', view_matrix);


	//-------Soleil------

	tsun.bind(0,'TU0');

    update_uniform('viewMatrix',view_matrix.mult(scale(Ssun)));

	meshsun_rend.draw(gl.TRIANGLES);

	//------Mercure------
	
	tmer.bind(0,'TU0');
	sca=0.1;
	let vm = mmult(rotateZ(6.8*b), translate(Rmer,0,0), rotateZ(-6.8*b),scale(Smer),rotateZ(2*b));
    update_uniform('viewMatrix',view_matrix.mult(vm));

    meshsun_rend.draw(gl.TRIANGLES);

    //-----Venus-----

    tven.bind(0,'TU0');
    sca=0.2;
    vm = mmult(rotateZ(2.7*b), translate(Rven,0,0), rotateZ(-2.7*b),scale(Sven),rotateZ(2*b));
    update_uniform('viewMatrix',view_matrix.mult(vm));
    meshsun_rend.draw(gl.TRIANGLES);

    //-----Terre-------
    sca=0.3;
    tear.bind(0,'TU0');
    let vmt= mmult(scale(Sear),rotateZ(2*b));
    vm = mmult(rotateZ(1.6*b), translate(Rear,0,0), rotateZ(-1.6*b));
    update_uniform('viewMatrix',view_matrix.mult(vm.mult(vmt)));
	meshsun_rend.draw(gl.TRIANGLES);

	//-----Lune------
	switch (orb){
		case 0:
			break;

		case 1:
			vao1.bind();

		    let vmmc = vm.mult(scale(Rmoo,Rmoo,1));
		    update_uniform('viewMatrix',view_matrix.mult(vmmc));
			gl.drawArrays(gl.LINE_LOOP, 0, Resolution);
			break;
		default:
			break;
		}

    let vmm=mmult(vm,rotateZ(10*b), translate(Rmoo,0,0), rotateZ(-10*b))
    tmoo.bind(0,'TU0');
    update_uniform('viewMatrix',mmult(view_matrix,vmm,scale(Smoo),rotateZ(10*b+180)));
	meshsun_rend.draw(gl.TRIANGLES);


    //------Mars------
    sca=0.15;
	tmar.bind(0,'TU0');
    vm = mmult(rotateZ(1.5*b), translate(Rmar,0,0), rotateZ(-1.5*b),scale(Smar),rotateZ(2*b));
    update_uniform('viewMatrix',view_matrix.mult(vm));

    meshsun_rend.draw(gl.TRIANGLES);

    //-----Jupiter-------
    sca=0.7;
    tjup.bind(0,'TU0');
    vm = mmult(rotateZ(0.15*b), translate(Rjup,0,0),rotateZ(-0.15*b),scale(Sjup),rotateZ(2*b));
    update_uniform('viewMatrix',view_matrix.mult(vm));

    meshsun_rend.draw(gl.TRIANGLES);

    //-----Saturne-------
    sca=0.6;
    tsat.bind(0,'TU0');
    vm = mmult(rotateZ(0.05*b), translate(Rsat,0,0), rotateZ(-0.05*b),scale(Ssat),rotateZ(2*b));
    update_uniform('viewMatrix',view_matrix.mult(vm));

    meshsun_rend.draw(gl.TRIANGLES);

    tsat_ring.bind(0,'TU0');
	vm = mmult(rotateZ(0.05*b), translate(Rsat,0,0), rotateZ(-0.05*b),scale(Ssat+1,Ssat+1,0.1),rotateZ(2*b));
	update_uniform('viewMatrix',view_matrix.mult(vm));
    meshring_rend.draw(gl.TRIANGLES);

    //------Uranus-------
    sca=0.4;
    tura.bind(0,'TU0');
    vm = mmult(rotateZ(0.02*b), translate(Rura,0,0), rotateZ(-0.02*b),scale(Sura),rotateZ(2*b));
    update_uniform('viewMatrix',view_matrix.mult(vm));

    meshsun_rend.draw(gl.TRIANGLES);

    //------Neptune---------

    tnep.bind(0,'TU0');
    sca=0.4;
    vm = mmult(rotateZ(0.01*b), translate(Rnep,0,0), rotateZ(-0.01*b),scale(Snep),rotateZ(2*b));
    update_uniform('viewMatrix',view_matrix.mult(vm));

    meshsun_rend.draw(gl.TRIANGLES);

	unbind_texture2d();
	unbind_shader();
	unbind_vao();


}

launch_3d();