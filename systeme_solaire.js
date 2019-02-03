"use strict"

var color_vert=`#version 300 es
precision highp float;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
in vec3 position_in;


in vec2 texcoord_in;
out vec2 tc;

void main()
{
  tc = texcoord_in;
  gl_PointSize = 8.0;
  gl_Position = projectionMatrix*viewMatrix*vec4(position_in, 1.0);
}
`;

var color_frag=`#version 300 es
precision highp float;
uniform sampler2D TU0;   
in vec2 tc;             
vec3 color; 
out vec4 frag_out;

void main()
{
	vec3 c1 = texture(TU0,tc).rgb;
	frag_out = vec4(c1,1);
}
`;

var texture_sun = null;
var meshSphere_rend = null;



var prg_s = null;

function init_wgl()
{
	

    prg_s = ShaderProgram(color_vert,color_frag,'color1');
    
    let meshSphere = Mesh.Sphere(50);
    
    meshSphere_rend = meshSphere.renderer(true,false,true);

	texture_sun = Texture2d();
	texture_sun.load("MySun.jpg",gl.RGBA8,gl.RGBA,true).then(update_wgl);
 
    scene_camera.set_scene_radius(meshSphere.BB.radius);
	scene_camera.set_scene_center(meshSphere.BB.center);
    
}


function draw_wgl()
{
	gl.clearColor(0,0,0,1);
	gl.enable(gl.DEPTH_TEST);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);  

    const projection_matrix = scene_camera.get_projection_matrix();
	const view_matrix = scene_camera.get_view_matrix();

    prg_s.bind();

    update_uniform('projectionMatrix', projection_matrix)
	update_uniform('viewMatrix', view_matrix);


	//-------Soleil------

	texture_sun.bind(0,'TU0');

    update_uniform('viewMatrix',view_matrix);

    meshSphere_rend.draw(gl.TRIANGLES);
    
    unbind_texture2d();
	unbind_shader();
	unbind_vao();
}

launch_3d();