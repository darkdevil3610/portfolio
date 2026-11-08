import * as THREE from "./vendor/three.module.js";
import { makeNoise4D } from "./vendor/open-simplex-noise.mjs";

//VARIABLES
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const white = 0xffffff;
const black = 0x000000;
const yellow = 0xffc800;
const red = 0x0000ff;
const purple = 0x0000ff;
const green = 0x03fc2c;
const blue = 0x031cfc;
const cyan = 0x03d3fc;
const pink = 0x031cfc;
const lightYellow = 0x031cfc;


//SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(black);
scene.fog = new THREE.Fog(black, 4, 6);
// const gridHelper = new THREE.GridHelper(200, 50);
// scene.add(gridHelper)

//LIGHT SCENE1
let lightTopColor = new THREE.Color(yellow);
let lightBackColor = new THREE.Color(red);
let rectLightColor = new THREE.Color(purple);

const lightTop = new THREE.PointLight(lightTopColor, 10);
lightTop.position.set(5, 5, 2);
lightTop.castShadow = true;
lightTop.shadow.mapSize.width = lightTop.shadow.mapSize.height = 10000;
lightTop.penumbra = 0.5;

const lightBack = new THREE.SpotLight(lightBackColor, 2);
lightBack.position.set(0, -3, -1);

const rectLight = new THREE.RectAreaLight(rectLightColor, 20, 2, 2);
rectLight.position.set(1, 1, 1);
rectLight.lookAt(0, 0, 0);

scene.add(lightTop, lightBack, rectLight);

//LIGHT SCENE2
const targetScene2 = new THREE.Object3D();
targetScene2.position.set(0, -10, 0);
scene.add(targetScene2);

const lightRight = new THREE.SpotLight(pink, 1);
lightRight.position.set(8, 0, 0);
lightRight.target = targetScene2;

const lightLeft = new THREE.SpotLight(pink, 1);
lightLeft.position.set(-8, 0, 0);
lightLeft.target = targetScene2;

const lightMidSpot = new THREE.SpotLight(lightYellow, 2);
lightMidSpot.position.set(0, -5, 20);
lightMidSpot.target = targetScene2;

const lightMidPoint = new THREE.PointLight(lightYellow, 0.05);
lightMidPoint.position.set(0, 0, -23);

scene.add(lightRight,lightLeft, lightMidSpot, lightMidPoint);


//CAMERA  scene1(-0.3, 0, 5)   scene2(0, -4.5, 10)
let updateCamPos = new THREE.Vector3(-0.3, 0, 5);
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 1, 500);
camera.position.set(-0.3, 0, 5);
scene.add(camera);

//RENDERER
const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
let rendererPixelRatio = Math.min(window.devicePixelRatio, 1.5);
renderer.setPixelRatio(rendererPixelRatio);
renderer.setSize(sizes.width, sizes.height, false);
renderer.setClearAlpha(0);
renderer.shadowMap.enabled = false;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.needsUpdate = true;
// Ensure correct color space for textures
renderer.outputEncoding = THREE.sRGBEncoding;

//SCENE1 OBJECTS
//Space size
function spaceRandom(num = 1) {
  var setNumber = -Math.random() * num + Math.random() * num;
  return setNumber;
}

//Cubes
const cubesGroup = new THREE.Object3D();
scene.add(cubesGroup);
function generateCube() {
  //Init object
  const geometry = new THREE.IcosahedronGeometry(1);
  const material = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.4,
    metalness: 0.5,
  });
  const cube = new THREE.Mesh(geometry, material);
  cube.speedRotation = Math.random() * 0.1;
  cube.positionX = spaceRandom();
  cube.positionY = spaceRandom();
  cube.positionZ = spaceRandom();
  cube.castShadow = true;
  cube.receiveShadow = true;
  //Behavior
  const newScaleValue = spaceRandom(0.3);
  cube.scale.set(newScaleValue, newScaleValue, newScaleValue);
  cube.rotation.x = spaceRandom((180 * Math.PI) / 180);
  cube.rotation.y = spaceRandom((180 * Math.PI) / 180);
  cube.rotation.z = spaceRandom((180 * Math.PI) / 180);
  cube.position.set(cube.positionX, cube.positionY, cube.positionZ);
  cubesGroup.add(cube);
}

//Particles
const particlesGroup = new THREE.Object3D();
scene.add(particlesGroup);
function generateParticle() {
  const geometry = new THREE.CircleGeometry(0.1, 5);
  const material = new THREE.MeshPhysicalMaterial({
    color: white,
    side: THREE.DoubleSide,
  });
  const particle = new THREE.Mesh(geometry, material);
    particle.position.set(spaceRandom(2), spaceRandom(2), spaceRandom(2));
    particle.rotation.set(spaceRandom(), spaceRandom(), spaceRandom());
    const scale = 0.001 + Math.abs(spaceRandom(0.03));
    particle.scale.set(scale, scale, scale);
    particle.speedValue = spaceRandom(1);
    particlesGroup.add(particle);
}

//SCENE2 OBJECTS
//Globe
let wave = new THREE.Vector3();
let noise = makeNoise4D(Date.now());
let clock = new THREE.Clock();

const earthGroup = new THREE.Object3D();
earthGroup.position.set(0, 0, -10);
earthGroup.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI/2));
scene.add(earthGroup);

function generateEarth() {
  const geometry = new THREE.CylinderGeometry(4, 3, 10, 60, 30, true);
  const material = new THREE.MeshStandardMaterial({
    color: 0x00ffb7,
    wireframe: true,
    fog: false,
  });
  geometry.positionData = [];
  for (let i = 0; i < geometry.attributes.position.count; i++){
    wave.fromBufferAttribute(geometry.attributes.position, i);
    geometry.positionData.push(wave.clone());
  }
  const earth = new THREE.Mesh(geometry, material);
  earthGroup.add(earth);
}

//Clouds
function generateCloud() {
  const material = new THREE.MeshStandardMaterial({
    color: 0xffd000,
    transparent: true,
    opacity: 0.5,
    wireframe: true,
    fog: false,
  });
  const cloudGroup = new THREE.Object3D();
  const cloudAmount = Math.floor(Math.random()*3+2);
  for (let i = 0; i < cloudAmount; i++ ) {
    const geometry = new THREE.IcosahedronGeometry(1);
    const cloud = new THREE.Mesh(geometry, material);
    const scale = 0.27/Math.floor(Math.random()*2+1);
    cloud.scale.set(scale, scale, scale);
    cloud.position.set(Math.random()+0.5, -Math.random()/2, Math.random()/3)
    cloud.rotation.set(Math.random()*Math.PI*2, Math.random()*Math.PI*2, Math.random()*Math.PI*2);
    cloudGroup.add(cloud);
  }
  cloudGroup.position.set(0, Math.random()*5+2, Math.random()+4.5);
  cloudGroup.applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI*2*(Math.random()*10)));
  earthGroup.add(cloudGroup);
}

//Stars
const starGroup = new THREE.Object3D();
scene.add(starGroup);
function generateStar() {
  const ranSize = Math.random()*0.01+0.01;
  const geometry = new THREE.SphereGeometry(ranSize, 8, 8);
  const material = new THREE.MeshStandardMaterial({ color: black, fog: false });
  const star = new THREE.Mesh(geometry, material);
  star.position.set(Math.random()*18-9, Math.random()*10-9, Math.random()*20-30);
  starGroup.add(star);
}

//Airplane
let airPlaneNewPos = new THREE.Vector3(0, -5, -5);
let flagVertexCount;

const airPlaneGroup = new THREE.Object3D();
airPlaneGroup.position.set(0, -5, -5);
airPlaneGroup.scale.set(0.35, 0.35, 0.35),
scene.add(airPlaneGroup);

function generateAirPlane() {
  const matWhite = new THREE.MeshStandardMaterial({
    color: white,
    emissive: 0x5e5e5e,
    roughness: 0.5,
    metalness: 1,
    flatShading: true,
    fog: false,
  });
  const matPurple = new THREE.MeshStandardMaterial({
    color: 0x6a00ff,
    emissive: 0x1c0f45,
    roughness: 0.5,
    metalness: 1,
    flatShading: true,
    fog: false,
  });
  const matBlack = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.5,
    metalness: 1,
    flatShading: true,
    fog: false,
  });
  const flagText = new THREE.TextureLoader().load("./images/Flag_of_India.png");
  // Use sRGB encoding for correct color rendering
  flagText.encoding = THREE.sRGBEncoding;
  // Use an unlit material so the flag texture shows true colors
  const matFlag = new THREE.MeshBasicMaterial({
    map: flagText,
    side: THREE.DoubleSide,
    fog: false,
  });

  const fan1Geo = new THREE.BoxGeometry(0.05, 1.2, 0.2);
  const fan1 = new THREE.Mesh(fan1Geo, matWhite);
  fan1.position.set(1.3, 0, 0);
  airPlaneGroup.add(fan1);

  const fan2Geo = new THREE.BoxGeometry(0.05, 0.2, 1.2);
  const fan2 = new THREE.Mesh(fan2Geo, matWhite);
  fan2.position.set(1.3, 0, 0);
  airPlaneGroup.add(fan2);

  const flagGeo = new THREE.PlaneGeometry(1.4, 0.8, 10, 1);
  const flag = new THREE.Mesh(flagGeo, matFlag);
  flag.position.set(-1.45, 0, 0);
  airPlaneGroup.add(flag);
  flagVertexCount = flagGeo.attributes.position.count;

  const headGeo = new THREE.TorusGeometry(0.35, 0.2, 8, 20);
  const head = new THREE.Mesh(headGeo, matWhite);
  head.rotation.set(0, Math.PI/2, 0);
  head.position.set(0.95, 0, 0);
  airPlaneGroup.add(head);

  const bodyGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.5, 20, 1, true);
  const body = new THREE.Mesh(bodyGeo, matPurple);
  body.rotation.set(0, 0, Math.PI/2);
  body.position.set(0.6, 0, 0);
  airPlaneGroup.add(body);

  const tailGeo = new THREE.CylinderGeometry(0.3, 0.5, 0.7, 20, 1, true);
  const tail = new THREE.Mesh(tailGeo, matPurple);
  tail.rotation.set(0, 0, Math.PI/2);
  tail.position.set(0, 0, 0);
  airPlaneGroup.add(tail);

  const endGeo = new THREE.ConeGeometry(0.3, 0.3, 20, 1, true);
  const end = new THREE.Mesh(endGeo, matPurple);
  end.rotation.set(0, 0, Math.PI/2);
  end.position.set(-0.5, 0, 0);
  airPlaneGroup.add(end);

  const fanCenGeo = new THREE.ConeGeometry(0.2, 0.3, 20, 1, true);
  const fanCen = new THREE.Mesh(fanCenGeo, matPurple);
  fanCen.rotation.set(0, 0, -Math.PI/2);
  fanCen.position.set(1.3, 0, 0);
  airPlaneGroup.add(fanCen);

  const wingGeo = new THREE.BoxGeometry( 0.7, 0.06, 3);
  const wing = new THREE.Mesh(wingGeo, matWhite);
  wing.position.set(0.4, 0.15, 0);
  wing.rotation.set(0, 0, Math.PI/20);
  airPlaneGroup.add(wing);

  const wheelGeo = new THREE.TorusGeometry(0.12, 0.13, 10, 10);
  const wheel1 = new THREE.Mesh(wheelGeo, matBlack);
  wheel1.position.set(0.4, -0.4, 0.6);
  airPlaneGroup.add(wheel1);
  const wheel2 = new THREE.Mesh(wheelGeo, matBlack);
  wheel2.position.set(0.4, -0.4, -0.6);
  airPlaneGroup.add(wheel2);

  const pilotGeo = new THREE.SphereGeometry(0.3, 10, 10);
  const pilot = new THREE.Mesh(pilotGeo, matWhite);
  pilot.position.set(0.23, 0.55, 0);
  airPlaneGroup.add(pilot);

  const helmet = new THREE.Mesh(wheelGeo, matBlack);
  helmet.scale.set(1, 1.5, 1);
  helmet.position.set(0.375, 0.65, 0);
  helmet.rotation.set(Math.PI/2, 0, 0);
  airPlaneGroup.add(helmet);
}

//RESIZE WINDOW
let measureFrame = null;
function scheduleMeasureSections() {
  if (measureFrame === null) {
    measureFrame = requestAnimationFrame(() => {
      measureFrame = null;
      measureSections();
    });
  }
}
function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  if (width === sizes.width && height === sizes.height) {
    return;
  }
  sizes.width = width;
  sizes.height = height;
  const pixelRatio = Math.min(window.devicePixelRatio, 1.5);
  if (pixelRatio !== rendererPixelRatio) {
    rendererPixelRatio = pixelRatio;
    renderer.setPixelRatio(pixelRatio);
  }
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  scheduleMeasureSections();
}
window.addEventListener("resize", onWindowResize, { passive: true });

//MOUSE EVENT
const mouse = new THREE.Vector2();
function onMouseMove(event) {
  if (reducedMotion.matches) {
    return;
  }
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = (event.clientY / window.innerHeight) * 2 + 1;
  //Update airplane
  airPlaneNewPos.x = (event.clientX * 3 / window.innerWidth) - 1.5;
  airPlaneNewPos.y = - (event.clientY * 1.6 / window.innerHeight) - 4.2;
  airPlaneGroup.rotation.z = airPlaneGroup.rotation.x = airPlaneNewPos.y - airPlaneGroup.position.y;
}
window.addEventListener("mousemove", onMouseMove, false);

//TOUCH EVENT FOR MOBILE
function onTouchMove(event) {
  if (reducedMotion.matches) {
    return;
  }
  mouse.x = (event.changedTouches[0].clientX / window.innerWidth) * 2 - 1;
  mouse.y = (event.changedTouches[0].clientY / window.innerHeight) * 2 + 1;
  //Update airplane
  airPlaneNewPos.x = (event.changedTouches[0].clientX * 3 / window.innerWidth) - 1.5;
  airPlaneNewPos.y = - (event.changedTouches[0].clientY * 1.6 / window.innerHeight) - 4.2;
  airPlaneGroup.rotation.z = airPlaneGroup.rotation.x = airPlaneNewPos.y - airPlaneGroup.position.y;
}
window.addEventListener("touchmove", onTouchMove, { passive: true });

//SCROLL CHAPTERS
const main = document.querySelector("main");
const sections = main.querySelectorAll("section");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const sectionConfigs = [
  { stars: black, top: yellow, back: red, rect: purple, cam: [-0.3, 0, 5] },
  { stars: black, top: green, back: yellow, rect: purple, cam: [-0.55, 0, 5] },
  { stars: black, top: cyan, back: purple, rect: blue, cam: [-0.1, 0, 5] },
  { stars: black, top: red, back: purple, rect: blue, cam: [-0.1, 0, 5] },
  { stars: 0x101010, top: yellow, back: cyan, rect: purple, cam: [-0.2, 0, 5] },
  { stars: 0x545454, top: black, back: black, rect: black, cam: [0, -4.5, 10] },
].map((config) => ({
  stars: new THREE.Color(config.stars),
  top: new THREE.Color(config.top),
  back: new THREE.Color(config.back),
  rect: new THREE.Color(config.rect),
  cam: new THREE.Vector3(...config.cam),
}));
const starColor = new THREE.Color(black);
let sectionOffsets = [];
let activeSectionIndex = 0;
let activeSectionFrame = null;
let lastScrollTop = 0;
let scrollIdleTimer = null;
const sectionVisibilityObserver = "IntersectionObserver" in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-offscreen", !entry.isIntersecting);
      });
    }, { root: main, rootMargin: "20% 0px", threshold: 0 })
  : null;
if (sectionVisibilityObserver) {
  sections.forEach((section) => sectionVisibilityObserver.observe(section));
}

function measureSections() {
  const mainTop = main.getBoundingClientRect().top;
  sectionOffsets = Array.from(sections, (section) => (
    section.getBoundingClientRect().top - mainTop + main.scrollTop
  ));
  scheduleActiveSectionUpdate();
}

//HOLD THE SCENE WITHIN A CHAPTER, BLEND AT ITS NEXT BOUNDARY
function updateActiveSection() {
  activeSectionFrame = null;
  const viewportHeight = main.clientHeight;
  const scrollTop = main.scrollTop;
  const scrollDirection = Math.sign(scrollTop - lastScrollTop);
  const readingLine = scrollTop + viewportHeight * 0.35;
  const chapterDeadZone = Math.min(viewportHeight * 0.06, 48);
  let nextActiveSectionIndex = 0;
  let sceneIndex = 0;
  sectionOffsets.forEach((offset, index) => {
    if (offset <= readingLine) {
      nextActiveSectionIndex = index;
    }
    if (offset <= scrollTop) {
      sceneIndex = index;
    }
  });
  if (staticSectionNumber === 0) {
    activeSectionIndex = nextActiveSectionIndex;
  } else if (
    nextActiveSectionIndex > activeSectionIndex &&
    scrollDirection >= 0 &&
    readingLine >= sectionOffsets[nextActiveSectionIndex] + chapterDeadZone
  ) {
    activeSectionIndex = nextActiveSectionIndex;
  } else if (
    nextActiveSectionIndex < activeSectionIndex &&
    scrollDirection <= 0 &&
    readingLine <= sectionOffsets[activeSectionIndex] - chapterDeadZone
  ) {
    activeSectionIndex = nextActiveSectionIndex;
  }
  lastScrollTop = scrollTop;
  const nextIndex = Math.min(sceneIndex + 1, sectionConfigs.length - 1);
  const nextTop = sectionOffsets[nextIndex] - scrollTop;
  let progress = nextIndex === sceneIndex ? 0 : THREE.MathUtils.clamp(
    (viewportHeight * 0.8 - nextTop) / (viewportHeight * 0.65), 0, 1
  );
  progress = progress * progress * (3 - 2 * progress);
  const current = sectionConfigs[reducedMotion.matches ? activeSectionIndex : sceneIndex];
  const next = reducedMotion.matches ? current : sectionConfigs[nextIndex];
  updateCamPos.lerpVectors(current.cam, next.cam, progress);
  lightTopColor.lerpColors(current.top, next.top, progress);
  lightBackColor.lerpColors(current.back, next.back, progress);
  rectLightColor.lerpColors(current.rect, next.rect, progress);
  starColor.lerpColors(current.stars, next.stars, progress);

  const sectionNumber = activeSectionIndex + 1;
  if (sectionNumber !== staticSectionNumber) {
    highLightNavLink(sectionNumber);
    highLightHamburger(sectionNumber);
    changeFooter(sectionNumber);
    staticSectionNumber = sectionNumber;
  }
  if (reducedMotion.matches && !document.hidden) {
    animate(performance.now());
  }
}
function scheduleActiveSectionUpdate() {
  if (activeSectionFrame === null) {
    activeSectionFrame = requestAnimationFrame(updateActiveSection);
  }
}
function onMainScroll() {
  document.documentElement.classList.add("is-scrolling");
  clearTimeout(scrollIdleTimer);
  scrollIdleTimer = setTimeout(() => {
    document.documentElement.classList.remove("is-scrolling");
  }, 140);
  scheduleActiveSectionUpdate();
}
main.addEventListener("scroll", onMainScroll, { passive: true });
window.addEventListener("hashchange", scheduleActiveSectionUpdate);
window.addEventListener("load", scheduleMeasureSections);
window.addEventListener("pageshow", scheduleMeasureSections);
if ("ResizeObserver" in window) {
  const sectionObserver = new ResizeObserver(scheduleMeasureSections);
  sections.forEach((section) => sectionObserver.observe(section));
}
if (document.fonts) {
  document.fonts.ready.then(scheduleMeasureSections);
}

//EXPAND NAVBAR HAMBURGER
const hamburger = document.querySelector(".hamburger");
const subMenu = document.querySelector(".subMenu");
const hamburgerLine = hamburger.querySelectorAll(".line");
function setMenuOpen(open) {
  hamburger.classList.toggle("is-active", open);
  hamburger.setAttribute("aria-expanded", String(open));
  subMenu.style.display = open ? "flex" : "";
  highLightHamburger(activeSectionIndex + 1);
}
hamburger.addEventListener("click", function() {
  setMenuOpen(!this.classList.contains("is-active"));
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && hamburger.classList.contains("is-active")) {
    setMenuOpen(false);
    hamburger.focus();
  }
});
window.matchMedia("(max-width: 1000px)").addEventListener("change", (event) => {
  if (!event.matches) {
    setMenuOpen(false);
  }
});
setMenuOpen(false);

//COLLAPSE SUBMENU ON CHOOSE
const navLinks = document.querySelectorAll(".navEach");
navLinks.forEach((each) => {
  each.addEventListener("click", () => setMenuOpen(false));
});

//IMAGE GALLERIES
document.querySelectorAll(".projectGallery").forEach((gallery) => {
  const imageWrap = gallery.querySelector(".imageWrap");
  const pictures = gallery.querySelectorAll(".picture");
  const controls = gallery.querySelector(".imgIndex");
  const imageCount = gallery.querySelector(".imageCount");
  const prevButton = gallery.querySelector(".prevImg");
  const nextButton = gallery.querySelector(".nextImg");
  if (pictures.length < 2 || !imageWrap || !controls || !imageCount || !prevButton || !nextButton) {
    return;
  }
  let currentImage = 0;
  function updateImage() {
    imageWrap.style.transform = `translateX(-${currentImage * 100}%)`;
    imageCount.textContent = `${currentImage + 1} / ${pictures.length}`;
    pictures.forEach((picture, index) => {
      if (index === currentImage) {
        picture.removeAttribute("aria-hidden");
      } else {
        picture.setAttribute("aria-hidden", "true");
      }
    });
  }
  function changeImage(direction) {
    currentImage = (currentImage + direction + pictures.length) % pictures.length;
    updateImage();
    const whoosh = new Audio("./audios/Whoosh.mp3");
    whoosh.play();
  }
  prevButton.addEventListener("click", () => changeImage(-1));
  nextButton.addEventListener("click", () => changeImage(1));
  gallery.addEventListener("keydown", (event) => {
    if (event.target !== prevButton && event.target !== nextButton) {
      return;
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      changeImage(event.key === "ArrowLeft" ? -1 : 1);
    }
  });
  updateImage();
  gallery.classList.add("is-enhanced");
  controls.hidden = false;
});

//SOUND TOGGLE
const backgroundSound = new Audio("./audios/Gratitude_Spiritual-Moment.mp3");
let soundOn = false;
document
  .querySelector(".sound")
  .addEventListener("click", function(event) {
    if (soundOn === true) {
      this.style.opacity = 1;
      backgroundSound.pause();
      this.style.backgroundImage = "url('./icons/icon-mute-96.png')";
      soundOn = false;
    } else {
      this.style.opacity = 0.2;
      backgroundSound.play();
      backgroundSound.volume = 0.5;
      backgroundSound.loop = true;
      this.style.backgroundImage = "url('./icons/icon-sound-96.png')";
    soundOn = true;
    }
});

//WHOOSH SOUND
document.querySelectorAll("a").forEach((each) => {
  each.addEventListener("click", function(event) {
    const whoosh = new Audio("./audios/Whoosh.mp3");
    whoosh.play();
  });
});

//FUNCTIONS FOR ANIMATION
//highlight navlink according to section
let staticSectionNumber = 0;
function highLightNavLink(number) {
  const desktopNavCount = 5;
  navLinks.forEach((each) => {
    each.style.color = "beige";
    each.style.fontStyle = "normal";
    each.classList.remove("is-on");
    each.removeAttribute("aria-current");
  });
  hamburgerLine.forEach((each) => {
    each.style.backgroundColor = "beige";
  });
  if (number > 1) {
    const desktopIndex = number - 2;
    const mobileIndex = desktopIndex + desktopNavCount;
    if (navLinks[desktopIndex]) {
      navLinks[desktopIndex].style.color = "goldenrod";
      navLinks[desktopIndex].style.fontStyle = "italic";
      navLinks[desktopIndex].classList.add("is-on");
      navLinks[desktopIndex].setAttribute("aria-current", "location");
    }
    if (navLinks[mobileIndex]) {
      navLinks[mobileIndex].style.color = "goldenrod";
      navLinks[mobileIndex].style.fontStyle = "italic";
      navLinks[mobileIndex].classList.add("is-on");
      navLinks[mobileIndex].setAttribute("aria-current", "location");
    }
    const lineIndex = Math.min(desktopIndex, hamburgerLine.length - 1);
    if (lineIndex >= 0) {
      hamburgerLine[lineIndex].style.backgroundColor = "goldenrod";
    }
  }
}
//highlight hamburger line
function highLightHamburger(number) {
  hamburgerLine.forEach((each) => {
    each.style.backgroundColor = "beige";
  });
  if (hamburger.classList.contains("is-active")) {
    hamburgerLine[0].style.backgroundColor = "goldenrod";
    hamburgerLine[3].style.backgroundColor = "goldenrod";
    return;
  }
  if (number > 1) {
    const lineIndex = Math.min(number - 2, hamburgerLine.length - 1);
    if (lineIndex >= 0) {
      hamburgerLine[lineIndex].style.backgroundColor = "goldenrod";
    }
  }
}
//change footer according to section
function changeFooter(setting) {
  if (setting === 6) {
    document.querySelector("footer").style.justifyContent = "space-between";
    document.querySelector(".backToTop").style.display = "block";
    document.querySelector(".copyright").style.display = "flex";
    document.querySelector(".moveUp").style.display = "none";
  } else if (setting === 2) {
    document.querySelector("footer").style.justifyContent = "flex-end";
    document.querySelector(".backToTop").style.display = "none";
    document.querySelector(".copyright").style.display = "none";
    document.querySelector(".moveUp").style.display = "block";
  } else {
    document.querySelector("footer").style.justifyContent = "flex-end";
    document.querySelector(".backToTop").style.display = "none";
    document.querySelector(".copyright").style.display = "none";
    document.querySelector(".moveUp").style.display = "none";
  }
}
//ANIMATION
let animationFrame = null;
let previousFrameTime = performance.now();
let geometryFrame = 0;
const animate = (now = performance.now()) => {
  animationFrame = null;
  const deltaTime = Math.min(Math.max((now - previousFrameTime) / 1000, 0), 1 / 30);
  previousFrameTime = now;
  const blend = reducedMotion.matches ? 1 : 1 - Math.exp(-10 * deltaTime);
  geometryFrame += 1;
  const updateGeometry = (
    !document.documentElement.classList.contains("is-scrolling") ||
    geometryFrame % 3 === 0
  );
  if (!reducedMotion.matches) {
  //Scene1
  //Particles spin around
  particlesGroup.rotation.y += 0.004;
  
  //Particles rotate
  const time = performance.now() * 0.0003;
  particlesGroup.children.forEach((each) => {
    each.rotation.x += each.speedValue / 10;
    each.rotation.y += each.speedValue / 10;
    each.rotation.z += each.speedValue / 10;
  })
  
  //Cubes rotate & fly around
  cubesGroup.children.forEach((each) => {
    each.rotation.x += 0.008;
    each.rotation.y += 0.005;
    each.rotation.z += 0.003;
    each.position.x = Math.sin(time * each.positionZ) * each.positionY;
    each.position.y = Math.cos(time * each.positionX) * each.positionZ;
    each.position.z = Math.sin(time * each.positionY) * each.positionX;
  })
  
  //Cube group rotate follow mouse
  cubesGroup.rotation.y -= (mouse.x * 4 + cubesGroup.rotation.y) * 0.1;
  cubesGroup.rotation.x -= (-mouse.y * 4 + cubesGroup.rotation.x) * 0.1;
  
  //Scene2
  //Earth spin around
  earthGroup.rotation.y -= 0.005;
  
  //Earth wave
  if (updateGeometry) {
    earthGroup.children[0].geometry.positionData.forEach((p, idx) => {
      const setNoise = noise(p.x, p.y, p.z, clock.getElapsedTime());
      wave.copy(p).addScaledVector(p, setNoise);
      earthGroup.children[0].geometry.attributes.position.setY(idx, wave.y);
    });
    earthGroup.children[0].geometry.computeVertexNormals();
    earthGroup.children[0].geometry.attributes.position.needsUpdate = true;
  }
  
  //Airplane fan
  airPlaneGroup.children[0].rotation.x += 0.3;
  airPlaneGroup.children[1].rotation.x += 0.3;
  
  //Airplane flag
  if (updateGeometry) {
    for (let i = 0; i < flagVertexCount; i++) {
      const x = airPlaneGroup.children[2].geometry.attributes.position.getX(i);
      const y = airPlaneGroup.children[2].geometry.attributes.position.getY(i);
      const xangle = x + now / 200;
      const xsin = Math.sin(xangle) * 0.6;
      const yangle = y + now / 200;
      const ycos = Math.cos(yangle) * 0.1;
      airPlaneGroup.children[2].geometry.attributes.position.setZ(i, xsin + ycos);
    }
    airPlaneGroup.children[2].geometry.computeVertexNormals();
    airPlaneGroup.children[2].geometry.attributes.position.needsUpdate = true;
  }

  //Move airplane follow mouse
  airPlaneGroup.position.lerp(airPlaneNewPos, 0.1);

  }

  //Update screen
  camera.position.lerp(updateCamPos, blend);
  lightTop.color.lerp(lightTopColor, blend);
  lightBack.color.lerp(lightBackColor, blend);
  rectLight.color.lerp(rectLightColor, blend);
  starGroup.children.forEach((star) => star.material.color.lerp(starColor, blend));

  renderer.render(scene, camera);
  if (!reducedMotion.matches && !document.hidden) {
    animationFrame = requestAnimationFrame(animate);
  }
};
function resumeAnimation() {
  previousFrameTime = performance.now();
  if (!document.hidden && animationFrame === null) {
    animate(previousFrameTime);
  }
}
canvas.addEventListener("webglcontextrestored", resumeAnimation);
reducedMotion.addEventListener("change", () => {
  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
  updateActiveSection();
  if (!reducedMotion.matches) {
    resumeAnimation();
  }
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  } else {
    resumeAnimation();
  }
});

Array(30).fill().forEach(generateCube);
Array(200).fill().forEach(generateParticle);
generateEarth();
Array(60).fill().forEach(generateCloud);
Array(80).fill().forEach(generateStar);
generateAirPlane();
measureSections();
updateActiveSection();
resumeAnimation();