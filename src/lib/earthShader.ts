import * as THREE from "three";

const VERTEX = `
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vSunDir;
uniform vec3 sunPosition;
void main() {
  vUv = uv;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vNormal = normalize(mat3(modelMatrix) * normal);
  vSunDir = normalize(sunPosition - worldPosition.xyz);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAGMENT = `
uniform sampler2D dayTexture;
uniform sampler2D nightTexture;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vSunDir;
void main() {
  float intensity = max(dot(vNormal, vSunDir), 0.0);
  vec4 dayColor = texture2D(dayTexture, vUv);
  vec4 nightColor = texture2D(nightTexture, vUv) * 0.55;
  gl_FragColor = mix(nightColor, dayColor, intensity);
}
`;

export function makeEarthDayNightMaterial(
  dayMap: THREE.Texture,
  nightMap: THREE.Texture,
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      dayTexture: { value: dayMap },
      nightTexture: { value: nightMap },
      sunPosition: { value: new THREE.Vector3(12, 4, 8) },
    },
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
  });
}
