#extension GL_OES_standard_derivatives:enable

varying vec2 v_uv;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_explosion;

varying vec3 v_position;

#define Color1 vec3(0.)
#define Color2 vec3(1.)

#define Frequency 10.

void main()
{
    vec3 AvgColor=vec3(0.,0.,0.);
    vec3 color;
    
    vec2 TexCoord=v_position.xy;
    // Determine the width of the projection of one pixel into s-t space
    vec2 fw=fwidth(TexCoord);
    
    // Determine the amount of fuzziness
    // vec2 fuzz = fw * Frequency * 2.0;
    vec2 fuzz=fw*10.*2.;
    
    float fuzzMax=max(fuzz.s,fuzz.t);
    
    // Determine the position in the checkerboard pattern
    vec2 checkPos=fract(TexCoord*Frequency);
    
    if(fuzzMax<.5)
    {
        
        // If the filter width is small enough, compute the pattern color
        vec2 p=smoothstep(vec2(.5),fuzz+vec2(.5),checkPos)+
        (1.-smoothstep(vec2(0.),fuzz,checkPos));
        
        color=mix(Color1,Color2,p.x*p.y+(1.-p.x)*(1.-p.y));
        
        // Fade in the average color when we get close to the limit
        color=mix(color,AvgColor,smoothstep(.125,.5,fuzzMax));
    }
    else
    {
        // Otherwise, use only the average color
        color=AvgColor;
    }
    
    gl_FragColor=vec4(color,1.);
}