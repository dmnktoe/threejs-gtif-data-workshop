import GUI from 'lil-gui';
import {
  AmbientLight,
  AnimationAction,
  AnimationMixer,
  AxesHelper,
  Clock,
  Color,
  Fog,
  GridHelper,
  Group,
  HemisphereLight,
  LoadingManager,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PointLight,
  Scene,
  SkeletonHelper,
  WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import { toggleFullScreen } from './helpers/fullscreen';
import { resizeRendererToDisplaySize } from './helpers/responsiveness';
import './style.css';

const CANVAS_ID = 'scene';

let canvas: HTMLElement;
let renderer: WebGLRenderer;
let model: Group;
let skeleton: SkeletonHelper;
let mixer: AnimationMixer;
let clock: Clock;
let scene: Scene;
let loadingManager: LoadingManager;
let ambientLight: AmbientLight;
let hemisphereLight: HemisphereLight;
let pointlight: PointLight;
let camera: PerspectiveCamera;
let cameraControls: OrbitControls;
let axesHelper: AxesHelper;
let stats: Stats;
let gui: GUI;

let danceAction: AnimationAction;
let settings: any;

const music = new Audio('sounds/fingers-up.mp3');
music.loop = true;

init();

type Dance = {
  creator: string;
  name: string;
  sound: string;
  modelPosition: { x: number; y: number; z: number };
};

function init() {
  const dances: Dance[] = [
    {
      creator: 'Alessandra',
      name: 'Salsa Moves',
      sound: 'sounds/SalsaMoves.mp3',
      modelPosition: { x: 0, y: 0, z: 0 },
    },
    {
      creator: 'bigP',
      name: 'Schnuffeltanz',
      sound: 'sounds/Schnuffeltanz.mp3',
      modelPosition: { x: 0, y: 0, z: 0 },
    },
    {
      creator: 'Feli',
      name: 'MACARAVE',
      sound: 'sounds/MACARAVE.mp3',
      modelPosition: { x: 0, y: 0, z: 0 },
    },
    {
      creator: 'Habeen',
      name: 'Penguin',
      sound: 'sounds/Penguin.mp3',
      modelPosition: { x: 0, y: 0, z: 0 },
    },
    {
      creator: 'Helene',
      name: 'Happytobehere',
      sound: 'sounds/happytobehere.mp3',
      modelPosition: { x: 1, y: 2, z: 0 },
    },
    {
      creator: 'Johanna',
      name: 'Stardance',
      sound: 'sounds/Stardance.mp3',
      modelPosition: { x: 2, y: 1, z: 0 },
    },
    {
      creator: 'Kenyatta',
      name: 'Untitled',
      sound: 'sounds/MilesMoralesDrums.mp3',
      modelPosition: { x: 0, y: 0, z: 0 },
    },
    {
      creator: 'Kevin',
      name: 'Dance Instructor',
      sound: 'sounds/DanceInstructor.mp3',
      modelPosition: { x: 0, y: 0, z: 0 },
    },
    {
      creator: 'Ksen',
      name: 'Chicken Gimme More',
      sound: 'sounds/ChickenGimmeMore.mp3',
      modelPosition: { x: 0, y: 0, z: 0 },
    },
    {
      creator: 'Linus',
      name: 'Der mit dem Wolf Tanz',
      sound: 'sounds/DerMitDemWolfTanz.mp3',
      modelPosition: { x: 0, y: 0, z: 0 },
    },
    {
      creator: 'Luisa',
      name: 'Sound Wiggle',
      sound: 'sounds/SoundWiggle.mp3',
      modelPosition: { x: 0, y: 0, z: 0 },
    },
    {
      creator: 'Maxi',
      name: 'Melbourne Shuffle',
      sound: 'sounds/MelbourneShuffle.mp3',
      modelPosition: { x: 0, y: 0, z: 0 },
    },
    {
      creator: 'Meret',
      name: 'Shake N Turn',
      sound: 'sounds/ShakeNTurn.mp3',
      modelPosition: { x: 0, y: 0, z: 0 },
    },
    {
      creator: 'Mink Yung',
      name: 'Wackelig Schütteln',
      sound: 'sounds/WackeligSchuetteln.mp3',
      modelPosition: { x: 0, y: 0, z: 0 },
    },
    {
      creator: 'Nina',
      name: 'Sonnentanz',
      sound: 'sounds/Sonnentanz.mp3',
      modelPosition: { x: 0, y: 0, z: 0 },
    },
    {
      creator: 'Sophia',
      name: 'Zucken',
      sound: 'sounds/Zucken.mp3',
      modelPosition: { x: 0, y: 0, z: 0 },
    },
  ];

  // ===== 👨🏻‍💼 LOADING MANAGER =====
  {
    loadingManager = new LoadingManager();

    loadingManager.onStart = () => {
      console.log('loading started');
    };
    loadingManager.onProgress = (url, loaded, total) => {
      console.log('loading in progress:');
      console.log(`${url} -> ${loaded} / ${total}`);
    };
    loadingManager.onLoad = () => {
      console.log('loaded!');
    };
    loadingManager.onError = () => {
      console.log('❌ error while loading');
    };
  }

  // ===== 🖼️ CANVAS, RENDERER, & SCENE =====
  {
    canvas = document.querySelector(`canvas#${CANVAS_ID}`)!;
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    scene = new Scene();

    scene.background = new Color(0x000000);
    scene.fog = new Fog(0xffffff, 10, 50);
  }

  // ===== 💡 LIGHTS =====
  {
    ambientLight = new AmbientLight('white', 0.4);
    hemisphereLight = new HemisphereLight(0xffffff, 0x8d8d8d, 1);
    hemisphereLight.position.set(0, 20, 15);
    pointlight = new PointLight('green', 55);
    pointlight.position.set(0, 2, 2);

    scene.add(ambientLight);
    scene.add(hemisphereLight);
    scene.add(pointlight);
  }

  // ===== 📦 BASISKLASSE =====
  {
    const loader = new GLTFLoader(loadingManager);
    loader.load('models/basis-room.glb', (gltf) => {
      model = gltf.scene;
      model.position.set(0, 2.3, 0);
      scene.add(model);
    });
  }

  // ===== 🎳 LOAD GLTF MODEL =====

  {
    const loader = new GLTFLoader(loadingManager);
    loader.load(
      'models/blob.glb',
      (gltf) => {
        model = gltf.scene;
        model.scale.set(0.2, 0.2, 0.2);
        model.position.set(0, 0, 0);
        model.rotation.set(0, 0, 0);
        scene.add(model);

        skeleton = new SkeletonHelper(model);
        skeleton.visible = false;
        scene.add(skeleton);

        const animations = gltf.animations;
        console.log(animations);
        mixer = new AnimationMixer(model);

        danceAction = mixer.clipAction(animations[0]);
        danceAction.play();
        animate();
      },
      (xhr) => {
        console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
      },
      (error) => {
        console.log('❌ error while loading gltf model');
        console.error(error);
      },
    );
  }

  // ===== 🎥 CAMERA =====
  {
    camera = new PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      100,
    );
    camera.position.set(2, 4, -8);
    camera.lookAt(0, 2, 0);
  }

  // ===== 🕹️ CONTROLS =====
  {
    cameraControls = new OrbitControls(camera, canvas);
    cameraControls.enableDamping = true;
    cameraControls.autoRotate = false;
    cameraControls.update();

    // Full screen
    window.addEventListener('dblclick', (event) => {
      if (event.target === canvas) {
        toggleFullScreen(canvas);
      }
    });
  }

  // ===== 🪄 HELPERS =====
  {
    axesHelper = new AxesHelper(4);
    axesHelper.visible = false;
    scene.add(axesHelper);

    const gridHelper = new GridHelper(20, 20, 'teal', 'darkgray');
    gridHelper.position.y = -0.01;
    gridHelper.visible = true;
    scene.add(gridHelper);
  }

  // ===== 📈 STATS & CLOCK =====
  {
    clock = new Clock();
    stats = new Stats();
    document.body.appendChild(stats.dom);
  }

  // ==== 🐞 DEBUG GUI ====
  {
    gui = new GUI({ title: '💃 Dance-Options', width: 300 });

    const danceFolder = gui.addFolder('Dances');
    const danceNames = dances.map((dance) => dance.name);
    const danceSelect = danceFolder.add(
      { dance: danceNames[0] },
      'dance',
      danceNames,
    );

    danceSelect.onChange((selectedDance: string) => {
      console.log('selected dance:', selectedDance);
    });

    const visibilityFolder = gui.addFolder('Visibility');
    const speedFolder = gui.addFolder('General Speed');
    const musicFolder = gui.addFolder('Music');

    settings = {
      'show model': true,
      'show skeleton': false,
      'use default duration': true,
      'modify time scale': 1.0,
      'play music': false,
      'modify music volume': 0.5,
    };

    visibilityFolder.add(settings, 'show model').onChange(showModel);
    visibilityFolder.add(settings, 'show skeleton').onChange(showSkeleton);

    speedFolder
      .add(settings, 'modify time scale', 0.1, 2, 0.01)
      .onChange(modifyTimeScale);

    musicFolder.add(settings, 'play music').onChange(playMusic);
    musicFolder
      .add(settings, 'modify music volume', 0.0, 1.0, 0.01)
      .onChange(modifyVolume);

    visibilityFolder.open();
    speedFolder.open();
    musicFolder.open();

    const helpersFolder = gui.addFolder('Helpers');
    helpersFolder.add(axesHelper, 'visible').name('axes');

    const cameraFolder = gui.addFolder('Camera');
    cameraFolder.add(cameraControls, 'autoRotate');

    // persist GUI state in local storage on changes
    gui.onFinishChange(() => {
      const guiState = gui.save();
      localStorage.setItem('guiState', JSON.stringify(guiState));
    });

    // load GUI state if available in local storage
    const guiState = localStorage.getItem('guiState');
    if (guiState) gui.load(JSON.parse(guiState));

    // reset GUI state button
    const resetGui = () => {
      localStorage.removeItem('guiState');
      gui.reset();
    };
    gui.add({ resetGui }, 'resetGui').name('RESET');

    gui.close();
  }
}

function showModel(visibility: boolean) {
  model.visible = visibility;
}

function showSkeleton(visibility: boolean) {
  skeleton.visible = visibility;
}

function modifyTimeScale(speed: number) {
  mixer.timeScale = speed;
}

function playMusic(play: boolean) {
  if (play) {
    music.play();
  } else {
    music.pause();
  }
}

function modifyVolume(volume: number) {
  music.volume = volume;
}

function animate() {
  requestAnimationFrame(animate);

  const mixerUpdateDelta = clock.getDelta();

  mixer.update(mixerUpdateDelta);

  stats.update();

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  cameraControls.update();

  renderer.render(scene, camera);
}
