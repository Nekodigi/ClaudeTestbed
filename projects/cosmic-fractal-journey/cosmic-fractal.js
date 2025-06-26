// Cosmic Fractal Journey - Advanced WebGL2 Fractal Explorer
// A professional-grade fractal rendering engine with advanced features

class CosmicFractalEngine {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.gl = null;
        this.program = null;
        this.uniforms = {};
        this.buffers = {};
        
        // Rendering state
        this.frameCount = 0;
        this.lastTime = 0;
        this.fps = 0;
        this.raySteps = 0;
        
        // Camera state
        this.camera = {
            position: new Float32Array([0, 0, -3]),
            rotation: new Float32Array([0, 0]),
            velocity: new Float32Array([0, 0, 0]),
            targetPosition: new Float32Array([0, 0, -3]),
            targetRotation: new Float32Array([0, 0]),
            smoothFactor: 0.1
        };
        
        // Mouse state
        this.mouse = {
            down: false,
            lastX: 0,
            lastY: 0,
            deltaX: 0,
            deltaY: 0
        };
        
        // Keyboard state
        this.keys = new Set();
        
        // Fractal parameters
        this.fractalParams = {
            type: 'mandelbulb',
            power: 8.0,
            iterations: 15,
            detailLevel: 0.001,
            bailout: 2.0,
            juliaC: new Float32Array([0.5, 0.5, 0.5, 0.5]),
            colorScheme: 0,
            animationSpeed: 0.0
        };
        
        // Material parameters
        this.materialParams = {
            type: 'metallic',
            roughness: 0.3,
            metalness: 0.8,
            ior: 1.45,
            absorption: new Float32Array([0.01, 0.02, 0.03]),
            emissionStrength: 0.0,
            emissionColor: new Float32Array([1.0, 0.8, 0.6])
        };
        
        // Lighting parameters
        this.lightingParams = {
            ambientStrength: 0.2,
            sunDirection: new Float32Array([0.7, 0.5, 0.5]),
            sunColor: new Float32Array([1.0, 0.95, 0.8]),
            fogDensity: 0.02,
            fogColor: new Float32Array([0.1, 0.15, 0.2]),
            volumetricStrength: 0.5
        };
        
        // Post-processing parameters
        this.postProcessParams = {
            bloomIntensity: 0.5,
            bloomThreshold: 0.8,
            chromaticAberration: 0.005,
            depthOfField: 0.3,
            focalDistance: 3.0,
            vignette: 0.4,
            motionBlur: 0.0,
            exposure: 1.0,
            gamma: 2.2
        };
        
        // Animation modes
        this.animationMode = {
            autopilot: false,
            cinematic: false,
            cameraPath: [],
            pathIndex: 0,
            pathProgress: 0
        };
        
        // Performance settings
        this.performance = {
            dynamicQuality: true,
            targetFPS: 60,
            currentQuality: 1.0,
            minQuality: 0.25,
            maxQuality: 1.0
        };
        
        // Multi-pass rendering
        this.renderPasses = {
            main: null,
            bloom: null,
            depth: null,
            composite: null
        };
        
        // Initialize everything
        this.init();
    }
    
    async init() {
        // Show loading screen
        this.updateLoadingProgress(10);
        
        // Initialize WebGL2 context
        this.initWebGL();
        this.updateLoadingProgress(20);
        
        // Create shaders and programs
        await this.createShaders();
        this.updateLoadingProgress(40);
        
        // Initialize buffers
        this.initBuffers();
        this.updateLoadingProgress(50);
        
        // Initialize framebuffers for multi-pass rendering
        this.initFramebuffers();
        this.updateLoadingProgress(60);
        
        // Setup event listeners
        this.setupEventListeners();
        this.updateLoadingProgress(70);
        
        // Initialize UI controls
        this.initControls();
        this.updateLoadingProgress(80);
        
        // Load presets
        this.loadPresets();
        this.updateLoadingProgress(90);
        
        // Hide loading screen and start rendering
        this.updateLoadingProgress(100);
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
            this.startRendering();
        }, 500);
    }
    
    initWebGL() {
        this.gl = this.canvas.getContext('webgl2', {
            alpha: false,
            depth: true,
            stencil: false,
            antialias: false,
            premultipliedAlpha: false,
            preserveDrawingBuffer: false,
            powerPreference: 'high-performance'
        });
        
        if (!this.gl) {
            throw new Error('WebGL2 not supported');
        }
        
        // Enable extensions
        this.gl.getExtension('EXT_color_buffer_float');
        this.gl.getExtension('OES_texture_float_linear');
        
        // Set initial viewport
        this.resizeCanvas();
    }
    
    async createShaders() {
        // Vertex shader - simple fullscreen quad
        const vertexShaderSource = `#version 300 es
        precision highp float;
        
        in vec2 a_position;
        out vec2 v_uv;
        
        void main() {
            v_uv = a_position * 0.5 + 0.5;
            gl_Position = vec4(a_position, 0.0, 1.0);
        }`;
        
        // Fragment shader - the main raymarching engine
        const fragmentShaderSource = `#version 300 es
        precision highp float;
        
        in vec2 v_uv;
        out vec4 fragColor;
        
        // Uniforms
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform vec3 u_cameraPos;
        uniform vec2 u_cameraRot;
        uniform int u_frameCount;
        
        // Fractal parameters
        uniform int u_fractalType;
        uniform float u_fractalPower;
        uniform int u_iterations;
        uniform float u_detailLevel;
        uniform float u_bailout;
        uniform vec4 u_juliaC;
        uniform int u_colorScheme;
        uniform float u_animationSpeed;
        
        // Material parameters
        uniform int u_materialType;
        uniform float u_roughness;
        uniform float u_metalness;
        uniform float u_ior;
        uniform vec3 u_absorption;
        uniform float u_emissionStrength;
        uniform vec3 u_emissionColor;
        
        // Lighting parameters
        uniform float u_ambientStrength;
        uniform vec3 u_sunDirection;
        uniform vec3 u_sunColor;
        uniform float u_fogDensity;
        uniform vec3 u_fogColor;
        uniform float u_volumetricStrength;
        
        // Post-processing parameters
        uniform float u_bloomThreshold;
        uniform float u_chromaticAberration;
        uniform float u_depthOfField;
        uniform float u_focalDistance;
        uniform float u_vignette;
        uniform float u_exposure;
        uniform float u_gamma;
        
        // Previous frame for motion blur
        uniform sampler2D u_previousFrame;
        uniform float u_motionBlur;
        
        // Constants
        const float PI = 3.14159265359;
        const float TWO_PI = 6.28318530718;
        const float EPSILON = 0.0001;
        const int MAX_STEPS = 256;
        const float MAX_DIST = 100.0;
        const float MIN_DIST = 0.001;
        
        // Global variables for performance tracking
        int g_raySteps = 0;
        float g_lastDistance = 0.0;
        
        // Rotation matrix functions
        mat3 rotateX(float angle) {
            float c = cos(angle);
            float s = sin(angle);
            return mat3(
                1.0, 0.0, 0.0,
                0.0, c, -s,
                0.0, s, c
            );
        }
        
        mat3 rotateY(float angle) {
            float c = cos(angle);
            float s = sin(angle);
            return mat3(
                c, 0.0, s,
                0.0, 1.0, 0.0,
                -s, 0.0, c
            );
        }
        
        mat3 rotateZ(float angle) {
            float c = cos(angle);
            float s = sin(angle);
            return mat3(
                c, -s, 0.0,
                s, c, 0.0,
                0.0, 0.0, 1.0
            );
        }
        
        // Smooth minimum function for blending SDFs
        float smin(float a, float b, float k) {
            float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
            return mix(b, a, h) - k * h * (1.0 - h);
        }
        
        // Hash functions for procedural noise
        float hash(float n) {
            return fract(sin(n) * 43758.5453123);
        }
        
        float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }
        
        float hash(vec3 p) {
            return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
        }
        
        // 3D noise function
        float noise(vec3 p) {
            vec3 i = floor(p);
            vec3 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            
            float n = i.x + i.y * 57.0 + 113.0 * i.z;
            
            return mix(mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
                          mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y),
                      mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
                          mix(hash(n + 170.0), hash(n + 171.0), f.x), f.y), f.z);
        }
        
        // Fractal noise (FBM)
        float fbm(vec3 p, int octaves) {
            float value = 0.0;
            float amplitude = 0.5;
            float frequency = 1.0;
            
            for (int i = 0; i < octaves; i++) {
                value += amplitude * noise(p * frequency);
                amplitude *= 0.5;
                frequency *= 2.0;
            }
            
            return value;
        }
        
        // Complex number operations for Julia sets
        vec2 complexMul(vec2 a, vec2 b) {
            return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
        }
        
        vec2 complexSqr(vec2 z) {
            return vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y);
        }
        
        // Quaternion operations for 3D fractals
        vec4 quatMul(vec4 a, vec4 b) {
            return vec4(
                a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
                a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
                a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
                a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z
            );
        }
        
        vec4 quatConj(vec4 q) {
            return vec4(-q.xyz, q.w);
        }
        
        vec4 quatSqr(vec4 q) {
            return vec4(
                2.0 * q.w * q.xyz,
                q.w * q.w - dot(q.xyz, q.xyz)
            );
        }
        
        // Distance Estimators for various fractals
        
        // Mandelbulb Distance Estimator
        float deMandelbulb(vec3 pos) {
            vec3 z = pos;
            float dr = 1.0;
            float r = 0.0;
            float power = u_fractalPower + sin(u_time * u_animationSpeed) * 2.0;
            
            for (int i = 0; i < u_iterations; i++) {
                r = length(z);
                if (r > u_bailout) break;
                
                // Convert to spherical coordinates
                float theta = acos(z.z / r);
                float phi = atan(z.y, z.x);
                dr = pow(r, power - 1.0) * power * dr + 1.0;
                
                // Scale and rotate the point
                float zr = pow(r, power);
                theta = theta * power;
                phi = phi * power;
                
                // Convert back to cartesian coordinates
                z = zr * vec3(sin(theta) * cos(phi), sin(theta) * sin(phi), cos(theta));
                z += pos;
            }
            
            return 0.5 * log(r) * r / dr;
        }
        
        // Julia Set Distance Estimator
        float deJulia(vec3 pos) {
            vec4 z = vec4(pos, 0.0);
            vec4 c = u_juliaC + vec4(sin(u_time * u_animationSpeed * 0.5) * 0.1);
            float dr = 1.0;
            float r2 = 0.0;
            
            for (int i = 0; i < u_iterations; i++) {
                r2 = dot(z, z);
                if (r2 > u_bailout * u_bailout) break;
                
                dr = 2.0 * length(z) * dr + 1.0;
                z = quatSqr(z) + c;
            }
            
            float r = length(z);
            return 0.5 * r * log(r) / dr;
        }
        
        // Menger Sponge Distance Estimator
        float deMenger(vec3 pos) {
            float scale = 1.0 + sin(u_time * u_animationSpeed) * 0.2;
            vec3 offset = vec3(1.0);
            
            for (int i = 0; i < u_iterations; i++) {
                pos = abs(pos);
                
                if (pos.x < pos.y) pos.xy = pos.yx;
                if (pos.x < pos.z) pos.xz = pos.zx;
                if (pos.y < pos.z) pos.yz = pos.zy;
                
                pos = pos * 3.0 - offset * (3.0 - 1.0);
                
                if (pos.z < -0.5 * offset.z * (3.0 - 1.0)) {
                    pos.z += offset.z * (3.0 - 1.0);
                }
                
                scale *= 3.0;
            }
            
            return length(pos) / scale;
        }
        
        // IFS (Iterated Function System) Fractal
        float deIFS(vec3 pos) {
            float scale = 2.0;
            vec3 offset = vec3(1.0, 1.0, 1.0);
            float r = length(pos);
            
            for (int i = 0; i < u_iterations; i++) {
                // Fold space
                pos = abs(pos);
                if (pos.x + pos.y < 0.0) pos.xy = -pos.yx;
                if (pos.x + pos.z < 0.0) pos.xz = -pos.zx;
                if (pos.y + pos.z < 0.0) pos.yz = -pos.zy;
                
                // Scale and translate
                pos = pos * scale - offset * (scale - 1.0);
                
                // Add rotation
                float angle = u_time * u_animationSpeed * 0.1;
                pos = rotateY(angle) * pos;
            }
            
            return (length(pos) - 2.0) / pow(scale, float(u_iterations));
        }
        
        // Hybrid fractal combining multiple types
        float deHybrid(vec3 pos) {
            float d1 = deMandelbulb(pos);
            float d2 = deJulia(pos * 0.7) * 1.4;
            float blend = sin(u_time * u_animationSpeed * 0.3) * 0.5 + 0.5;
            return mix(d1, d2, blend);
        }
        
        // Apollonian Gasket
        float deApollonian(vec3 pos) {
            float scale = 1.0;
            float r = length(pos);
            
            for (int i = 0; i < u_iterations; i++) {
                // Sphere inversion
                float r2 = dot(pos, pos);
                pos = pos / r2;
                scale = scale / r2;
                
                // Translations
                pos -= vec3(1.0, 0.0, 0.0);
                
                // Fold
                pos = abs(pos);
                if (pos.x - pos.y < 0.0) pos.xy = pos.yx;
                if (pos.x - pos.z < 0.0) pos.xz = pos.zx;
                if (pos.y - pos.z < 0.0) pos.yz = pos.zy;
            }
            
            return 0.25 * abs(length(pos) - 1.0) / scale;
        }
        
        // Kleinian group limit set
        float deKleinian(vec3 pos) {
            vec3 cSize = vec3(0.92436, 0.90756, 0.92436);
            float size = 1.0;
            vec3 c = vec3(0.0);
            float defactor = 1.0;
            vec3 offset = vec3(0.0);
            
            for (int i = 0; i < u_iterations; i++) {
                pos = 2.0 * clamp(pos, -cSize, cSize) - pos;
                float k = max(0.70968 / dot(pos, pos), 1.0);
                pos *= k;
                defactor *= k;
            }
            
            float rxy = length(pos.xy);
            return max(rxy - 0.92784, abs(rxy * pos.z) / length(pos)) / defactor;
        }
        
        // Main distance function
        float map(vec3 pos) {
            float d = MAX_DIST;
            
            if (u_fractalType == 0) { // Mandelbulb
                d = deMandelbulb(pos);
            } else if (u_fractalType == 1) { // Julia
                d = deJulia(pos);
            } else if (u_fractalType == 2) { // Menger
                d = deMenger(pos);
            } else if (u_fractalType == 3) { // IFS
                d = deIFS(pos);
            } else if (u_fractalType == 4) { // Hybrid
                d = deHybrid(pos);
            } else if (u_fractalType == 5) { // Apollonian
                d = deApollonian(pos);
            } else if (u_fractalType == 6) { // Kleinian
                d = deKleinian(pos);
            }
            
            // Add some domain distortion for organic feel
            if (u_materialType == 3) { // Organic material
                d += fbm(pos * 2.0, 3) * 0.05;
            }
            
            return d;
        }
        
        // Calculate normal vector
        vec3 calcNormal(vec3 pos) {
            vec2 e = vec2(EPSILON, 0.0);
            return normalize(vec3(
                map(pos + e.xyy) - map(pos - e.xyy),
                map(pos + e.yxy) - map(pos - e.yxy),
                map(pos + e.yyx) - map(pos - e.yyx)
            ));
        }
        
        // Ambient occlusion
        float calcAO(vec3 pos, vec3 normal) {
            float ao = 0.0;
            float scale = 1.0;
            for (int i = 0; i < 5; i++) {
                float h = 0.01 + 0.12 * float(i) / 4.0;
                float d = map(pos + h * normal);
                ao += (h - d) * scale;
                scale *= 0.95;
            }
            return clamp(1.0 - 3.0 * ao, 0.0, 1.0);
        }
        
        // Soft shadows
        float calcSoftShadow(vec3 ro, vec3 rd, float mint, float maxt, float k) {
            float res = 1.0;
            float t = mint;
            for (int i = 0; i < 64; i++) {
                float h = map(ro + rd * t);
                res = min(res, k * h / t);
                t += clamp(h, 0.01, 0.2);
                if (h < 0.001 || t > maxt) break;
            }
            return clamp(res, 0.0, 1.0);
        }
        
        // Subsurface scattering approximation
        vec3 calcSubsurface(vec3 pos, vec3 normal, vec3 lightDir, vec3 viewDir) {
            float thickness = 0.0;
            for (int i = 0; i < 8; i++) {
                thickness += map(pos - normal * float(i) * 0.05);
            }
            thickness = 1.0 - clamp(thickness * 0.5, 0.0, 1.0);
            
            float subsurface = pow(max(0.0, dot(viewDir, -lightDir)), 3.0) * thickness;
            return vec3(1.0, 0.3, 0.1) * subsurface * 0.5;
        }
        
        // PBR BRDF
        vec3 BRDF(vec3 normal, vec3 viewDir, vec3 lightDir, vec3 albedo, float roughness, float metalness) {
            vec3 halfDir = normalize(viewDir + lightDir);
            
            float NdotL = max(0.0, dot(normal, lightDir));
            float NdotV = max(0.0, dot(normal, viewDir));
            float NdotH = max(0.0, dot(normal, halfDir));
            float VdotH = max(0.0, dot(viewDir, halfDir));
            
            // Fresnel
            vec3 F0 = mix(vec3(0.04), albedo, metalness);
            vec3 F = F0 + (1.0 - F0) * pow(1.0 - VdotH, 5.0);
            
            // Distribution
            float alpha = roughness * roughness;
            float alpha2 = alpha * alpha;
            float denom = NdotH * NdotH * (alpha2 - 1.0) + 1.0;
            float D = alpha2 / (PI * denom * denom);
            
            // Geometry
            float k = (roughness + 1.0) * (roughness + 1.0) / 8.0;
            float G1L = NdotL / (NdotL * (1.0 - k) + k);
            float G1V = NdotV / (NdotV * (1.0 - k) + k);
            float G = G1L * G1V;
            
            // BRDF
            vec3 numerator = D * G * F;
            float denominator = 4.0 * NdotV * NdotL + 0.001;
            vec3 specular = numerator / denominator;
            
            vec3 kS = F;
            vec3 kD = vec3(1.0) - kS;
            kD *= 1.0 - metalness;
            
            return kD * albedo / PI + specular;
        }
        
        // Ray marching function
        float rayMarch(vec3 ro, vec3 rd, out int steps) {
            float t = 0.0;
            steps = 0;
            
            for (int i = 0; i < MAX_STEPS; i++) {
                vec3 pos = ro + rd * t;
                float d = map(pos);
                
                if (d < u_detailLevel) {
                    g_lastDistance = d;
                    return t;
                }
                
                if (t > MAX_DIST) break;
                
                // Adaptive step size
                t += d * 0.9;
                steps++;
            }
            
            g_raySteps = steps;
            return -1.0;
        }
        
        // Get material properties
        void getMaterial(vec3 pos, vec3 normal, out vec3 albedo, out float roughness, out float metalness, out vec3 emission) {
            albedo = vec3(0.5);
            roughness = u_roughness;
            metalness = u_metalness;
            emission = vec3(0.0);
            
            if (u_materialType == 0) { // Metallic
                albedo = vec3(0.9, 0.9, 0.95);
                metalness = 0.95;
                roughness = u_roughness * 0.5;
            } else if (u_materialType == 1) { // Glass
                albedo = vec3(0.95, 0.98, 1.0);
                metalness = 0.0;
                roughness = 0.05;
            } else if (u_materialType == 2) { // Emissive
                albedo = u_emissionColor;
                emission = u_emissionColor * u_emissionStrength;
                metalness = 0.0;
                roughness = 0.8;
            } else if (u_materialType == 3) { // Organic
                float pattern = fbm(pos * 4.0, 4);
                albedo = mix(vec3(0.2, 0.5, 0.3), vec3(0.8, 0.4, 0.2), pattern);
                roughness = mix(0.6, 0.9, pattern);
                metalness = 0.0;
            } else if (u_materialType == 4) { // Crystal
                float facet = abs(sin(pos.x * 10.0) * sin(pos.y * 10.0) * sin(pos.z * 10.0));
                albedo = mix(vec3(0.3, 0.5, 0.9), vec3(0.9, 0.3, 0.5), facet);
                roughness = 0.1;
                metalness = 0.5;
                emission = albedo * facet * 0.2;
            }
            
            // Add color based on fractal iterations
            if (u_colorScheme == 1) {
                float iterRatio = float(g_raySteps) / float(MAX_STEPS);
                albedo *= mix(vec3(0.1, 0.3, 0.8), vec3(1.0, 0.5, 0.1), iterRatio);
            }
        }
        
        // Volumetric lighting
        vec3 volumetricLighting(vec3 ro, vec3 rd, float maxDist, vec3 lightDir) {
            vec3 volume = vec3(0.0);
            float stepSize = maxDist / 64.0;
            float density = 0.0;
            
            for (int i = 0; i < 64; i++) {
                vec3 pos = ro + rd * (float(i) * stepSize);
                float d = map(pos);
                
                if (d < 0.1) {
                    density += 0.02;
                    float shadow = calcSoftShadow(pos, lightDir, 0.1, 10.0, 16.0);
                    volume += vec3(1.0, 0.9, 0.7) * density * shadow;
                }
            }
            
            return volume * u_volumetricStrength;
        }
        
        // Main rendering function
        vec3 render(vec3 ro, vec3 rd) {
            vec3 color = vec3(0.0);
            int steps = 0;
            
            float t = rayMarch(ro, rd, steps);
            
            if (t > 0.0) {
                vec3 pos = ro + rd * t;
                vec3 normal = calcNormal(pos);
                
                // Get material properties
                vec3 albedo;
                float roughness, metalness;
                vec3 emission;
                getMaterial(pos, normal, albedo, roughness, metalness, emission);
                
                // Lighting calculation
                vec3 lightDir = normalize(u_sunDirection);
                vec3 viewDir = -rd;
                
                // Direct lighting with PBR
                vec3 direct = BRDF(normal, viewDir, lightDir, albedo, roughness, metalness) * u_sunColor;
                float shadow = calcSoftShadow(pos + normal * 0.001, lightDir, 0.001, 10.0, 32.0);
                direct *= shadow;
                
                // Ambient lighting with AO
                float ao = calcAO(pos, normal);
                vec3 ambient = albedo * u_ambientStrength * ao;
                
                // Subsurface scattering for organic materials
                vec3 subsurface = vec3(0.0);
                if (u_materialType == 3) {
                    subsurface = calcSubsurface(pos, normal, lightDir, viewDir);
                }
                
                // Combine lighting
                color = direct + ambient + subsurface + emission;
                
                // Fog
                float fogAmount = 1.0 - exp(-t * u_fogDensity);
                color = mix(color, u_fogColor, fogAmount);
                
                // Store depth for DOF
                g_lastDistance = t;
            } else {
                // Background gradient
                float y = rd.y * 0.5 + 0.5;
                color = mix(vec3(0.05, 0.1, 0.2), vec3(0.1, 0.15, 0.3), y);
                
                // Stars
                vec2 starCoord = rd.xy / rd.z;
                float stars = pow(hash(starCoord * 1000.0), 40.0) * 2.0;
                color += vec3(stars);
                
                g_lastDistance = MAX_DIST;
            }
            
            // Add volumetric lighting
            if (u_volumetricStrength > 0.0 && t > 0.0) {
                vec3 volume = volumetricLighting(ro, rd, min(t, 10.0), normalize(u_sunDirection));
                color += volume;
            }
            
            g_raySteps = steps;
            return color;
        }
        
        // Camera matrix
        mat3 getCameraMatrix(vec3 ro, vec3 ta, float roll) {
            vec3 ww = normalize(ta - ro);
            vec3 uu = normalize(cross(ww, vec3(sin(roll), cos(roll), 0.0)));
            vec3 vv = normalize(cross(uu, ww));
            return mat3(uu, vv, ww);
        }
        
        // Post-processing effects
        vec3 postProcess(vec3 color, vec2 uv) {
            // Chromatic aberration
            if (u_chromaticAberration > 0.0) {
                vec2 caOffset = (uv - 0.5) * u_chromaticAberration;
                // Note: In a real implementation, we'd sample from a texture here
                color.r *= 1.0 + length(caOffset);
                color.b *= 1.0 - length(caOffset);
            }
            
            // Vignette
            float vignette = 1.0 - u_vignette * length(uv - 0.5) * 1.4;
            color *= vignette;
            
            // Exposure and gamma
            color = vec3(1.0) - exp(-color * u_exposure);
            color = pow(color, vec3(1.0 / u_gamma));
            
            return color;
        }
        
        void main() {
            vec2 uv = v_uv;
            vec2 p = (uv - 0.5) * 2.0;
            p.x *= u_resolution.x / u_resolution.y;
            
            // Camera setup
            vec3 ta = vec3(0.0); // Look at origin
            mat3 cam = getCameraMatrix(u_cameraPos, ta, 0.0);
            
            // Apply camera rotation
            cam = rotateY(u_cameraRot.x) * rotateX(u_cameraRot.y) * cam;
            
            // Ray direction with slight lens distortion
            float lensDistortion = 0.1;
            float r2 = dot(p, p);
            p *= 1.0 + lensDistortion * r2;
            
            vec3 rd = cam * normalize(vec3(p, 2.0));
            
            // Depth of field - jitter ray origin
            if (u_depthOfField > 0.0) {
                float angle = hash(float(u_frameCount)) * TWO_PI;
                float radius = hash(float(u_frameCount) + 1.0) * u_depthOfField * 0.01;
                vec2 offset = vec2(cos(angle), sin(angle)) * radius;
                vec3 focusPoint = u_cameraPos + rd * u_focalDistance;
                vec3 newOrigin = u_cameraPos + cam * vec3(offset, 0.0);
                rd = normalize(focusPoint - newOrigin);
            }
            
            // Render
            vec3 color = render(u_cameraPos, rd);
            
            // Apply post-processing
            color = postProcess(color, uv);
            
            // Motion blur with previous frame
            if (u_motionBlur > 0.0 && u_frameCount > 1) {
                vec3 previousColor = texture(u_previousFrame, uv).rgb;
                color = mix(color, previousColor, u_motionBlur);
            }
            
            // Output
            fragColor = vec4(color, 1.0);
            
            // Encode additional data in alpha channel for multi-pass rendering
            fragColor.a = g_lastDistance / MAX_DIST;
        }`;
        
        // Compile shaders
        const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
        
        // Create program
        this.program = this.createProgram(vertexShader, fragmentShader);
        
        // Get uniform locations
        this.getUniformLocations();
        
        // Create additional shader programs for post-processing
        await this.createPostProcessingShaders();
    }
    
    compileShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }
    
    createProgram(vertexShader, fragmentShader) {
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Program linking error:', this.gl.getProgramInfoLog(program));
            this.gl.deleteProgram(program);
            return null;
        }
        
        return program;
    }
    
    getUniformLocations() {
        const uniformNames = [
            'u_time', 'u_resolution', 'u_cameraPos', 'u_cameraRot', 'u_frameCount',
            'u_fractalType', 'u_fractalPower', 'u_iterations', 'u_detailLevel',
            'u_bailout', 'u_juliaC', 'u_colorScheme', 'u_animationSpeed',
            'u_materialType', 'u_roughness', 'u_metalness', 'u_ior', 'u_absorption',
            'u_emissionStrength', 'u_emissionColor',
            'u_ambientStrength', 'u_sunDirection', 'u_sunColor', 'u_fogDensity',
            'u_fogColor', 'u_volumetricStrength',
            'u_bloomThreshold', 'u_chromaticAberration', 'u_depthOfField',
            'u_focalDistance', 'u_vignette', 'u_exposure', 'u_gamma',
            'u_previousFrame', 'u_motionBlur'
        ];
        
        this.uniforms = {};
        uniformNames.forEach(name => {
            this.uniforms[name] = this.gl.getUniformLocation(this.program, name);
        });
    }
    
    async createPostProcessingShaders() {
        // Bloom shader
        const bloomFragmentSource = `#version 300 es
        precision highp float;
        
        in vec2 v_uv;
        out vec4 fragColor;
        
        uniform sampler2D u_texture;
        uniform float u_threshold;
        uniform float u_intensity;
        
        vec3 sampleBox(sampler2D tex, vec2 uv, float delta) {
            vec3 color = vec3(0.0);
            vec2 texelSize = 1.0 / vec2(textureSize(tex, 0));
            
            for (int x = -1; x <= 1; x++) {
                for (int y = -1; y <= 1; y++) {
                    vec2 offset = vec2(float(x), float(y)) * texelSize * delta;
                    color += texture(tex, uv + offset).rgb;
                }
            }
            
            return color / 9.0;
        }
        
        void main() {
            vec3 color = texture(u_texture, v_uv).rgb;
            
            // Extract bright areas
            float brightness = dot(color, vec3(0.2126, 0.7152, 0.0722));
            if (brightness > u_threshold) {
                vec3 bloom = sampleBox(u_texture, v_uv, 2.0) * u_intensity;
                color += bloom;
            }
            
            fragColor = vec4(color, 1.0);
        }`;
        
        // Create bloom program
        const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, `#version 300 es
        precision highp float;
        in vec2 a_position;
        out vec2 v_uv;
        void main() {
            v_uv = a_position * 0.5 + 0.5;
            gl_Position = vec4(a_position, 0.0, 1.0);
        }`);
        
        const bloomShader = this.compileShader(this.gl.FRAGMENT_SHADER, bloomFragmentSource);
        this.renderPasses.bloom = this.createProgram(vertexShader, bloomShader);
    }
    
    initBuffers() {
        // Create fullscreen quad
        const positions = new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
             1,  1
        ]);
        
        const positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
        
        this.buffers.position = positionBuffer;
        
        // Create VAO
        this.vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.vao);
        
        const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
        
        this.gl.bindVertexArray(null);
    }
    
    initFramebuffers() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Main render target
        this.createFramebuffer('main', width, height, true);
        
        // Bloom render targets (lower resolution)
        this.createFramebuffer('bloomExtract', width / 2, height / 2, false);
        this.createFramebuffer('bloomBlur', width / 2, height / 2, false);
        
        // Previous frame for motion blur
        this.createFramebuffer('previous', width, height, false);
    }
    
    createFramebuffer(name, width, height, includeDepth) {
        const framebuffer = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
        
        // Color texture
        const colorTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, colorTexture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA16F, width, height, 0, this.gl.RGBA, this.gl.FLOAT, null);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, colorTexture, 0);
        
        // Depth texture
        let depthTexture = null;
        if (includeDepth) {
            depthTexture = this.gl.createTexture();
            this.gl.bindTexture(this.gl.TEXTURE_2D, depthTexture);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.DEPTH_COMPONENT32F, width, height, 0, this.gl.DEPTH_COMPONENT, this.gl.FLOAT, null);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
            this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.TEXTURE_2D, depthTexture, 0);
        }
        
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        
        this.renderPasses[name] = {
            framebuffer,
            colorTexture,
            depthTexture,
            width,
            height
        };
    }
    
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.onTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.onTouchEnd(e));
        
        // Keyboard events
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        // Prevent context menu
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    initControls() {
        // Toggle controls visibility
        const toggleBtn = document.getElementById('toggleControls');
        const controls = document.getElementById('controls');
        toggleBtn.addEventListener('click', () => {
            controls.classList.toggle('hidden');
        });
        
        // Fractal type
        const fractalType = document.getElementById('fractalType');
        fractalType.addEventListener('change', (e) => {
            const types = ['mandelbulb', 'julia', 'menger', 'ifs', 'hybrid', 'apollonian', 'kleinian'];
            this.fractalParams.type = types.indexOf(e.target.value);
        });
        
        // Fractal parameters
        this.setupSlider('fractalPower', 'fractalPowerValue', (value) => {
            this.fractalParams.power = parseFloat(value);
        });
        
        this.setupSlider('iterations', 'iterationsValue', (value) => {
            this.fractalParams.iterations = parseInt(value);
        });
        
        this.setupSlider('detailLevel', null, (value) => {
            this.fractalParams.detailLevel = parseFloat(value);
        });
        
        // Material parameters
        const materialType = document.getElementById('materialType');
        materialType.addEventListener('change', (e) => {
            const types = ['metallic', 'glass', 'emissive', 'organic', 'crystal'];
            this.materialParams.type = types.indexOf(e.target.value);
        });
        
        this.setupSlider('roughness', null, (value) => {
            this.materialParams.roughness = parseFloat(value);
        });
        
        this.setupSlider('metalness', null, (value) => {
            this.materialParams.metalness = parseFloat(value);
        });
        
        this.setupSlider('ambientLight', null, (value) => {
            this.lightingParams.ambientStrength = parseFloat(value);
        });
        
        // Post-processing parameters
        this.setupSlider('bloomIntensity', null, (value) => {
            this.postProcessParams.bloomIntensity = parseFloat(value);
        });
        
        this.setupSlider('chromaticAberration', null, (value) => {
            this.postProcessParams.chromaticAberration = parseFloat(value);
        });
        
        this.setupSlider('depthOfField', null, (value) => {
            this.postProcessParams.depthOfField = parseFloat(value);
        });
        
        this.setupSlider('vignette', null, (value) => {
            this.postProcessParams.vignette = parseFloat(value);
        });
        
        // Camera controls
        document.getElementById('autopilotToggle').addEventListener('click', () => {
            this.animationMode.autopilot = !this.animationMode.autopilot;
        });
        
        document.getElementById('cinematicMode').addEventListener('click', () => {
            this.animationMode.cinematic = !this.animationMode.cinematic;
        });
        
        this.setupSlider('cameraSpeed', null, (value) => {
            this.camera.smoothFactor = parseFloat(value) * 0.1;
        });
        
        // Preset buttons
        document.querySelectorAll('.preset-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.loadPreset(e.target.dataset.preset);
            });
        });
        
        // Save/Reset buttons
        document.getElementById('saveSettings').addEventListener('click', () => {
            this.saveSettings();
        });
        
        document.getElementById('resetSettings').addEventListener('click', () => {
            this.resetSettings();
        });
    }
    
    setupSlider(sliderId, valueId, callback) {
        const slider = document.getElementById(sliderId);
        const valueInput = valueId ? document.getElementById(valueId) : null;
        
        slider.addEventListener('input', (e) => {
            const value = e.target.value;
            if (valueInput) valueInput.value = value;
            callback(value);
        });
        
        if (valueInput) {
            valueInput.addEventListener('input', (e) => {
                const value = e.target.value;
                slider.value = value;
                callback(value);
            });
        }
    }
    
    loadPresets() {
        this.presets = {
            'cosmic-nebula': {
                fractalType: 'hybrid',
                fractalPower: 8,
                iterations: 20,
                materialType: 'emissive',
                roughness: 0.8,
                metalness: 0.1,
                emissionStrength: 0.5,
                bloomIntensity: 1.2,
                fogDensity: 0.05
            },
            'crystal-cave': {
                fractalType: 'apollonian',
                fractalPower: 4,
                iterations: 15,
                materialType: 'crystal',
                roughness: 0.1,
                metalness: 0.5,
                bloomIntensity: 0.8,
                chromaticAberration: 0.01
            },
            'organic-growth': {
                fractalType: 'ifs',
                fractalPower: 3,
                iterations: 12,
                materialType: 'organic',
                roughness: 0.7,
                metalness: 0.0,
                ambientLight: 0.4,
                volumetricStrength: 0.3
            },
            'metallic-structure': {
                fractalType: 'menger',
                fractalPower: 3,
                iterations: 10,
                materialType: 'metallic',
                roughness: 0.2,
                metalness: 0.95,
                depthOfField: 0.5
            },
            'quantum-realm': {
                fractalType: 'kleinian',
                fractalPower: 2,
                iterations: 25,
                materialType: 'glass',
                roughness: 0.05,
                metalness: 0.0,
                chromaticAberration: 0.02,
                bloomIntensity: 1.5
            }
        };
    }
    
    loadPreset(presetName) {
        const preset = this.presets[presetName];
        if (!preset) return;
        
        // Apply preset values
        if (preset.fractalType) {
            document.getElementById('fractalType').value = preset.fractalType;
            const types = ['mandelbulb', 'julia', 'menger', 'ifs', 'hybrid', 'apollonian', 'kleinian'];
            this.fractalParams.type = types.indexOf(preset.fractalType);
        }
        
        if (preset.fractalPower !== undefined) {
            this.fractalParams.power = preset.fractalPower;
            document.getElementById('fractalPower').value = preset.fractalPower;
            document.getElementById('fractalPowerValue').value = preset.fractalPower;
        }
        
        if (preset.iterations !== undefined) {
            this.fractalParams.iterations = preset.iterations;
            document.getElementById('iterations').value = preset.iterations;
            document.getElementById('iterationsValue').value = preset.iterations;
        }
        
        if (preset.materialType) {
            document.getElementById('materialType').value = preset.materialType;
            const types = ['metallic', 'glass', 'emissive', 'organic', 'crystal'];
            this.materialParams.type = types.indexOf(preset.materialType);
        }
        
        // Apply other parameters
        const paramMap = {
            roughness: ['roughness', this.materialParams],
            metalness: ['metalness', this.materialParams],
            ambientLight: ['ambientStrength', this.lightingParams],
            bloomIntensity: ['bloomIntensity', this.postProcessParams],
            chromaticAberration: ['chromaticAberration', this.postProcessParams],
            depthOfField: ['depthOfField', this.postProcessParams],
            vignette: ['vignette', this.postProcessParams]
        };
        
        Object.entries(paramMap).forEach(([sliderName, [paramName, paramObj]]) => {
            if (preset[sliderName] !== undefined) {
                paramObj[paramName] = preset[sliderName];
                const slider = document.getElementById(sliderName);
                if (slider) slider.value = preset[sliderName];
            }
        });
    }
    
    saveSettings() {
        const settings = {
            fractal: this.fractalParams,
            material: this.materialParams,
            lighting: this.lightingParams,
            postProcess: this.postProcessParams
        };
        localStorage.setItem('cosmicFractalSettings', JSON.stringify(settings));
        console.log('Settings saved');
    }
    
    resetSettings() {
        // Reset to defaults
        this.fractalParams.power = 8.0;
        this.fractalParams.iterations = 15;
        this.fractalParams.detailLevel = 0.001;
        this.materialParams.roughness = 0.3;
        this.materialParams.metalness = 0.8;
        this.lightingParams.ambientStrength = 0.2;
        this.postProcessParams.bloomIntensity = 0.5;
        this.postProcessParams.chromaticAberration = 0.005;
        this.postProcessParams.depthOfField = 0.3;
        this.postProcessParams.vignette = 0.4;
        
        // Update UI
        document.getElementById('fractalPower').value = 8;
        document.getElementById('fractalPowerValue').value = 8;
        document.getElementById('iterations').value = 15;
        document.getElementById('iterationsValue').value = 15;
        document.getElementById('detailLevel').value = 0.001;
        document.getElementById('roughness').value = 0.3;
        document.getElementById('metalness').value = 0.8;
        document.getElementById('ambientLight').value = 0.2;
        document.getElementById('bloomIntensity').value = 0.5;
        document.getElementById('chromaticAberration').value = 0.005;
        document.getElementById('depthOfField').value = 0.3;
        document.getElementById('vignette').value = 0.4;
    }
    
    // Mouse event handlers
    onMouseDown(e) {
        this.mouse.down = true;
        this.mouse.lastX = e.clientX;
        this.mouse.lastY = e.clientY;
    }
    
    onMouseMove(e) {
        if (!this.mouse.down) return;
        
        const deltaX = e.clientX - this.mouse.lastX;
        const deltaY = e.clientY - this.mouse.lastY;
        
        this.mouse.deltaX = deltaX * 0.01;
        this.mouse.deltaY = deltaY * 0.01;
        
        this.mouse.lastX = e.clientX;
        this.mouse.lastY = e.clientY;
    }
    
    onMouseUp(e) {
        this.mouse.down = false;
    }
    
    onWheel(e) {
        e.preventDefault();
        const delta = e.deltaY * 0.001;
        const forward = this.getForwardVector();
        this.camera.targetPosition[0] += forward[0] * delta;
        this.camera.targetPosition[1] += forward[1] * delta;
        this.camera.targetPosition[2] += forward[2] * delta;
    }
    
    // Touch event handlers
    onTouchStart(e) {
        if (e.touches.length === 1) {
            this.mouse.down = true;
            this.mouse.lastX = e.touches[0].clientX;
            this.mouse.lastY = e.touches[0].clientY;
        }
    }
    
    onTouchMove(e) {
        if (e.touches.length === 1 && this.mouse.down) {
            const deltaX = e.touches[0].clientX - this.mouse.lastX;
            const deltaY = e.touches[0].clientY - this.mouse.lastY;
            
            this.mouse.deltaX = deltaX * 0.01;
            this.mouse.deltaY = deltaY * 0.01;
            
            this.mouse.lastX = e.touches[0].clientX;
            this.mouse.lastY = e.touches[0].clientY;
        }
    }
    
    onTouchEnd(e) {
        this.mouse.down = false;
    }
    
    // Keyboard event handlers
    onKeyDown(e) {
        this.keys.add(e.key.toLowerCase());
    }
    
    onKeyUp(e) {
        this.keys.delete(e.key.toLowerCase());
    }
    
    // Camera movement
    updateCamera(deltaTime) {
        // Apply mouse rotation
        if (this.mouse.down) {
            this.camera.targetRotation[0] += this.mouse.deltaX;
            this.camera.targetRotation[1] = Math.max(-Math.PI/2, Math.min(Math.PI/2, 
                this.camera.targetRotation[1] + this.mouse.deltaY));
            
            this.mouse.deltaX = 0;
            this.mouse.deltaY = 0;
        }
        
        // Keyboard movement
        const speed = this.keys.has('shift') ? 2.0 : 1.0;
        const moveSpeed = speed * deltaTime * 0.005;
        
        const forward = this.getForwardVector();
        const right = this.getRightVector();
        
        if (this.keys.has('w')) {
            this.camera.targetPosition[0] += forward[0] * moveSpeed;
            this.camera.targetPosition[1] += forward[1] * moveSpeed;
            this.camera.targetPosition[2] += forward[2] * moveSpeed;
        }
        if (this.keys.has('s')) {
            this.camera.targetPosition[0] -= forward[0] * moveSpeed;
            this.camera.targetPosition[1] -= forward[1] * moveSpeed;
            this.camera.targetPosition[2] -= forward[2] * moveSpeed;
        }
        if (this.keys.has('a')) {
            this.camera.targetPosition[0] -= right[0] * moveSpeed;
            this.camera.targetPosition[1] -= right[1] * moveSpeed;
            this.camera.targetPosition[2] -= right[2] * moveSpeed;
        }
        if (this.keys.has('d')) {
            this.camera.targetPosition[0] += right[0] * moveSpeed;
            this.camera.targetPosition[1] += right[1] * moveSpeed;
            this.camera.targetPosition[2] += right[2] * moveSpeed;
        }
        if (this.keys.has('q')) {
            this.camera.targetPosition[1] -= moveSpeed;
        }
        if (this.keys.has('e')) {
            this.camera.targetPosition[1] += moveSpeed;
        }
        
        // Autopilot mode
        if (this.animationMode.autopilot) {
            const time = performance.now() * 0.0001;
            const radius = 4.0 + Math.sin(time * 0.5) * 2.0;
            this.camera.targetPosition[0] = Math.cos(time) * radius;
            this.camera.targetPosition[1] = Math.sin(time * 0.7) * 2.0;
            this.camera.targetPosition[2] = Math.sin(time) * radius;
            
            // Look towards center with some variation
            const lookOffset = Math.sin(time * 1.3) * 0.5;
            this.camera.targetRotation[0] = Math.atan2(
                -this.camera.targetPosition[2] + lookOffset, 
                -this.camera.targetPosition[0]
            ) + Math.PI;
            this.camera.targetRotation[1] = Math.atan2(
                -this.camera.targetPosition[1], 
                Math.sqrt(
                    this.camera.targetPosition[0] * this.camera.targetPosition[0] + 
                    this.camera.targetPosition[2] * this.camera.targetPosition[2]
                )
            ) * 0.5;
        }
        
        // Smooth camera movement
        const smooth = this.camera.smoothFactor;
        this.camera.position[0] += (this.camera.targetPosition[0] - this.camera.position[0]) * smooth;
        this.camera.position[1] += (this.camera.targetPosition[1] - this.camera.position[1]) * smooth;
        this.camera.position[2] += (this.camera.targetPosition[2] - this.camera.position[2]) * smooth;
        
        this.camera.rotation[0] += (this.camera.targetRotation[0] - this.camera.rotation[0]) * smooth;
        this.camera.rotation[1] += (this.camera.targetRotation[1] - this.camera.rotation[1]) * smooth;
    }
    
    getForwardVector() {
        const yaw = this.camera.rotation[0];
        const pitch = this.camera.rotation[1];
        return [
            Math.cos(yaw) * Math.cos(pitch),
            Math.sin(pitch),
            Math.sin(yaw) * Math.cos(pitch)
        ];
    }
    
    getRightVector() {
        const yaw = this.camera.rotation[0] - Math.PI / 2;
        return [Math.cos(yaw), 0, Math.sin(yaw)];
    }
    
    // Canvas resize
    resizeCanvas() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.canvas.width = width;
        this.canvas.height = height;
        
        this.gl.viewport(0, 0, width, height);
        
        // Update resolution in UI
        document.getElementById('resolution').textContent = `${width}x${height}`;
        
        // Recreate framebuffers with new size
        if (this.renderPasses.main) {
            this.initFramebuffers();
        }
    }
    
    // Loading progress
    updateLoadingProgress(percent) {
        const progress = document.getElementById('loadingProgress');
        if (progress) {
            progress.style.width = percent + '%';
        }
    }
    
    // Start rendering loop
    startRendering() {
        this.render();
    }
    
    // Main render function
    render() {
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Update FPS counter
        this.frameCount++;
        if (this.frameCount % 30 === 0) {
            this.fps = Math.round(1000 / deltaTime);
            document.getElementById('fpsCounter').textContent = `FPS: ${this.fps}`;
        }
        
        // Update camera
        this.updateCamera(deltaTime);
        
        // Update uniforms
        this.updateUniforms(currentTime);
        
        // Render scene
        this.renderScene();
        
        // Update UI info
        this.updateInfo();
        
        // Continue render loop
        requestAnimationFrame(() => this.render());
    }
    
    updateUniforms(time) {
        this.gl.useProgram(this.program);
        
        // Time and resolution
        this.gl.uniform1f(this.uniforms.u_time, time * 0.001);
        this.gl.uniform2f(this.uniforms.u_resolution, this.canvas.width, this.canvas.height);
        this.gl.uniform1i(this.uniforms.u_frameCount, this.frameCount);
        
        // Camera
        this.gl.uniform3fv(this.uniforms.u_cameraPos, this.camera.position);
        this.gl.uniform2fv(this.uniforms.u_cameraRot, this.camera.rotation);
        
        // Fractal parameters
        this.gl.uniform1i(this.uniforms.u_fractalType, this.fractalParams.type);
        this.gl.uniform1f(this.uniforms.u_fractalPower, this.fractalParams.power);
        this.gl.uniform1i(this.uniforms.u_iterations, this.fractalParams.iterations);
        this.gl.uniform1f(this.uniforms.u_detailLevel, this.fractalParams.detailLevel);
        this.gl.uniform1f(this.uniforms.u_bailout, this.fractalParams.bailout);
        this.gl.uniform4fv(this.uniforms.u_juliaC, this.fractalParams.juliaC);
        this.gl.uniform1i(this.uniforms.u_colorScheme, this.fractalParams.colorScheme);
        this.gl.uniform1f(this.uniforms.u_animationSpeed, this.fractalParams.animationSpeed);
        
        // Material parameters
        this.gl.uniform1i(this.uniforms.u_materialType, this.materialParams.type);
        this.gl.uniform1f(this.uniforms.u_roughness, this.materialParams.roughness);
        this.gl.uniform1f(this.uniforms.u_metalness, this.materialParams.metalness);
        this.gl.uniform1f(this.uniforms.u_ior, this.materialParams.ior);
        this.gl.uniform3fv(this.uniforms.u_absorption, this.materialParams.absorption);
        this.gl.uniform1f(this.uniforms.u_emissionStrength, this.materialParams.emissionStrength);
        this.gl.uniform3fv(this.uniforms.u_emissionColor, this.materialParams.emissionColor);
        
        // Lighting parameters
        this.gl.uniform1f(this.uniforms.u_ambientStrength, this.lightingParams.ambientStrength);
        this.gl.uniform3fv(this.uniforms.u_sunDirection, this.lightingParams.sunDirection);
        this.gl.uniform3fv(this.uniforms.u_sunColor, this.lightingParams.sunColor);
        this.gl.uniform1f(this.uniforms.u_fogDensity, this.lightingParams.fogDensity);
        this.gl.uniform3fv(this.uniforms.u_fogColor, this.lightingParams.fogColor);
        this.gl.uniform1f(this.uniforms.u_volumetricStrength, this.lightingParams.volumetricStrength);
        
        // Post-processing parameters
        this.gl.uniform1f(this.uniforms.u_bloomThreshold, this.postProcessParams.bloomThreshold);
        this.gl.uniform1f(this.uniforms.u_chromaticAberration, this.postProcessParams.chromaticAberration);
        this.gl.uniform1f(this.uniforms.u_depthOfField, this.postProcessParams.depthOfField);
        this.gl.uniform1f(this.uniforms.u_focalDistance, this.postProcessParams.focalDistance);
        this.gl.uniform1f(this.uniforms.u_vignette, this.postProcessParams.vignette);
        this.gl.uniform1f(this.uniforms.u_exposure, this.postProcessParams.exposure);
        this.gl.uniform1f(this.uniforms.u_gamma, this.postProcessParams.gamma);
        this.gl.uniform1f(this.uniforms.u_motionBlur, this.postProcessParams.motionBlur);
    }
    
    renderScene() {
        // Clear
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        
        // Bind VAO and render
        this.gl.bindVertexArray(this.vao);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        this.gl.bindVertexArray(null);
    }
    
    updateInfo() {
        // Update render info panel
        const position = this.camera.position;
        document.getElementById('position').textContent = 
            `(${position[0].toFixed(2)}, ${position[1].toFixed(2)}, ${position[2].toFixed(2)})`;
        
        // Ray steps would need to be extracted from the shader
        document.getElementById('raySteps').textContent = '~' + Math.round(this.fps * 2);
        
        // Distance to nearest surface (approximation)
        const distance = Math.sqrt(
            position[0] * position[0] + 
            position[1] * position[1] + 
            position[2] * position[2]
        ) - 2.0;
        document.getElementById('distance').textContent = Math.max(0, distance).toFixed(3);
    }
}

// Initialize the engine when the page loads
window.addEventListener('DOMContentLoaded', () => {
    new CosmicFractalEngine();
});