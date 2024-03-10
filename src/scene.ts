import GUI, { Controller } from 'lil-gui';
import {
  AmbientLight,
  AnimationAction,
  AnimationMixer,
  AxesHelper,
  Clock,
  Color,
  DirectionalLight,
  Fog,
  GridHelper,
  Group,
  HemisphereLight,
  LoadingManager,
  Mesh,
  MeshPhongMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  PointLightHelper,
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
let pointLight: PointLight;
let directionalLight: DirectionalLight;
let camera: PerspectiveCamera;
let cameraControls: OrbitControls;
let axesHelper: AxesHelper;
let pointLightHelper: PointLightHelper;
let stats: Stats;
let gui: GUI;

const crossFadeControls: Controller[] = [];

let idleAction: AnimationAction,
  walkAction: AnimationAction,
  runAction: AnimationAction;
let idleWeight: number, walkWeight: number, runWeight: number;
let actions: AnimationAction[];
let settings: any;

let singleStepMode = false;
let sizeOfNextStep = 0;

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

  // ===== 🖼️ CANVAS, RENDERER, & SCENE =====
  {
    canvas = document.querySelector(`canvas#${CANVAS_ID}`)!;
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    scene = new Scene();

    scene.background = new Color(0xa0a0a0);
    scene.fog = new Fog(0xa0a0a0, 10, 50);
  }

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

  // ===== 💡 LIGHTS =====
  {
    ambientLight = new AmbientLight('white', 0.4);
    directionalLight = new DirectionalLight(0xffffff, 3);
    directionalLight.position.set(-3, 10, -10);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.top = 2;
    directionalLight.shadow.camera.bottom = -2;
    directionalLight.shadow.camera.left = -2;
    directionalLight.shadow.camera.right = 2;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 40;
    hemisphereLight = new HemisphereLight(0xffffff, 0x8d8d8d, 3);
    hemisphereLight.position.set(0, 20, 0);
    pointLight = new PointLight('#ffdca8', 1.2, 100);
    pointLight.position.set(-2, 3, 3);
    pointLight.castShadow = true;
    pointLight.shadow.radius = 4;
    pointLight.shadow.camera.near = 0.5;
    pointLight.shadow.camera.far = 4000;
    pointLight.shadow.mapSize.width = 2048;
    pointLight.shadow.mapSize.height = 2048;
    scene.add(ambientLight);
    scene.add(directionalLight);
    scene.add(hemisphereLight);
    scene.add(pointLight);
  }

  // ===== 📦 OBJECTS =====
  {
    const mesh = new Mesh(
      new PlaneGeometry(100, 100),
      new MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: false }),
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;

    scene.add(mesh);
  }

  // ===== 🎳 LOAD GLTF MODEL =====

  {
    const loader = new GLTFLoader(loadingManager);
    loader.load(
      'models/blob.glb',
      (gltf) => {
        model = gltf.scene;
        scene.add(model);

        model.traverse(
          (child: { castShadow: boolean; receiveShadow: boolean }) => {
            if (child instanceof Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          },
        );

        skeleton = new SkeletonHelper(model);
        skeleton.visible = false;
        scene.add(skeleton);

        const animations = gltf.animations;
        console.log(animations);
        mixer = new AnimationMixer(model);

        walkAction = mixer.clipAction(animations[0]);
      },
      (xhr) => {
        console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
      },
      (error) => {
        console.log('❌ error while loading gltf model');
        console.error(error);
      },
    );
    const loader2 = new GLTFLoader(loadingManager);
    loader2.load('models/Soldier.glb', (gltf) => {
      const animations2 = gltf.animations;

      idleAction = mixer.clipAction(animations2[0]);
      runAction = mixer.clipAction(animations2[1]);

      actions = [idleAction, walkAction, runAction];

      activateAllActions();
      animate();
    });
  }

  // ===== 🎥 CAMERA =====
  {
    camera = new PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      100,
    );
    camera.position.set(2, 3, -5);
    camera.lookAt(0, 1, 0);
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

    pointLightHelper = new PointLightHelper(pointLight, undefined, 'orange');
    pointLightHelper.visible = false;
    scene.add(pointLightHelper);

    const gridHelper = new GridHelper(20, 20, 'teal', 'darkgray');
    gridHelper.position.y = -0.01;
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
    const activationFolder = gui.addFolder('Activation/Deactivation');
    const pausingFolder = gui.addFolder('Pausing/Stepping');
    const crossfadingFolder = gui.addFolder('Crossfading');
    const blendWeightsFolder = gui.addFolder('Blend Weights');
    const speedFolder = gui.addFolder('General Speed');
    const musicFolder = gui.addFolder('Music');

    settings = {
      'show model': true,
      'show skeleton': false,
      'deactivate all': deactivateAllActions,
      'activate all': activateAllActions,
      'pause/continue': pauseContinue,
      'make single step': toSingleStepMode,
      'modify step size': 0.05,
      'from walk to idle': function () {
        prepareCrossFade(walkAction, idleAction, 1.0);
      },
      'from idle to walk': function () {
        prepareCrossFade(idleAction, walkAction, 0.5);
      },
      'from walk to run': function () {
        prepareCrossFade(walkAction, runAction, 2.5);
      },
      'from run to walk': function () {
        prepareCrossFade(runAction, walkAction, 5.0);
      },
      'use default duration': true,
      'set custom duration': 3.5,
      'modify idle weight': 0.0,
      'modify walk weight': 1.0,
      'modify run weight': 0.0,
      'modify time scale': 1.0,
      'play music': false,
      'modify music volume': 0.5,
    };

    visibilityFolder.add(settings, 'show model').onChange(showModel);
    visibilityFolder.add(settings, 'show skeleton').onChange(showSkeleton);

    activationFolder.add(settings, 'deactivate all');
    activationFolder.add(settings, 'activate all');

    pausingFolder.add(settings, 'pause/continue');
    pausingFolder.add(settings, 'make single step');
    pausingFolder.add(settings, 'modify step size', 0.01, 1, 0.01);

    crossFadeControls.push(
      crossfadingFolder.add(settings, 'from walk to idle'),
    );
    crossFadeControls.push(
      crossfadingFolder.add(settings, 'from idle to walk'),
    );
    crossFadeControls.push(crossfadingFolder.add(settings, 'from walk to run'));
    crossFadeControls.push(crossfadingFolder.add(settings, 'from run to walk'));

    crossfadingFolder.add(settings, 'use default duration');
    crossfadingFolder.add(settings, 'set custom duration', 0, 10, 0.01);

    blendWeightsFolder
      .add(settings, 'modify idle weight', 0.0, 1.0, 0.01)
      .listen()
      .onChange(function (weight: any) {
        setWeight(idleAction, weight);
      });
    blendWeightsFolder
      .add(settings, 'modify walk weight', 0.0, 1.0, 0.01)
      .listen()
      .onChange(function (weight: any) {
        setWeight(walkAction, weight);
      });
    blendWeightsFolder
      .add(settings, 'modify run weight', 0.0, 1.0, 0.01)
      .listen()
      .onChange(function (weight: any) {
        setWeight(runAction, weight);
      });

    speedFolder
      .add(settings, 'modify time scale', 0.1, 2, 0.01)
      .onChange(modifyTimeScale);

    musicFolder.add(settings, 'play music').onChange(playMusic);
    musicFolder
      .add(settings, 'modify music volume', 0.0, 1.0, 0.01)
      .onChange(modifyVolume);

    visibilityFolder.open();
    activationFolder.open();
    pausingFolder.open();
    crossfadingFolder.open();
    blendWeightsFolder.open();
    speedFolder.open();
    musicFolder.open();

    const lightsFolder = gui.addFolder('Lights');
    lightsFolder.add(pointLight, 'visible').name('point light');
    lightsFolder.add(ambientLight, 'visible').name('ambient light');

    const helpersFolder = gui.addFolder('Helpers');
    helpersFolder.add(axesHelper, 'visible').name('axes');
    helpersFolder.add(pointLightHelper, 'visible').name('pointLight');

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

function deactivateAllActions() {
  actions.forEach(function (action) {
    action.stop();
  });
}

function activateAllActions() {
  setWeight(idleAction, settings['modify idle weight']);
  setWeight(walkAction, settings['modify walk weight']);
  setWeight(runAction, settings['modify run weight']);
  actions.forEach(function (action) {
    action.play();
  });
}

function pauseContinue() {
  if (singleStepMode) {
    singleStepMode = false;
    unPauseAllActions();
  } else {
    if (idleAction.paused) {
      unPauseAllActions();
    } else {
      pauseAllActions();
    }
  }
}

function pauseAllActions() {
  actions.forEach(function (action) {
    action.paused = true;
  });
}

function unPauseAllActions() {
  actions.forEach(function (action) {
    action.paused = false;
  });
}

function toSingleStepMode() {
  unPauseAllActions();
  singleStepMode = true;
  sizeOfNextStep = settings['modify step size'];
}

function prepareCrossFade(
  startAction: any,
  endAction: any,
  defaultDuration: any,
) {
  const duration = setCrossFadeDuration(defaultDuration);

  singleStepMode = false;
  unPauseAllActions();

  if (startAction === walkAction) {
    executeCrossFade(startAction, endAction, duration);
  } else {
    synchronizeCrossFade(startAction, endAction, duration);
  }
}

function setCrossFadeDuration(defaultDuration: any) {
  if (settings['use default duration']) {
    return defaultDuration;
  } else {
    return settings['set custom duration'];
  }
}

function synchronizeCrossFade(startAction: any, endAction: any, duration: any) {
  mixer.addEventListener('loop', onLoopFinished);
  function onLoopFinished(event: any) {
    if (event.action === startAction) {
      mixer.removeEventListener('loop', onLoopFinished);
      executeCrossFade(startAction, endAction, duration);
    }
  }
}

function executeCrossFade(startAction: any, endAction: any, duration: any) {
  setWeight(endAction, 1);
  endAction.time = 0;
  startAction.crossFadeTo(endAction, duration, true);
}

function setWeight(action: any, weight: any) {
  action.enabled = true;
  action.setEffectiveTimeScale(1);
  action.setEffectiveWeight(weight);
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

function updateWeightSliders() {
  settings['modify idle weight'] = idleWeight;
  settings['modify walk weight'] = walkWeight;
  settings['modify run weight'] = runWeight;
}

function updateCrossFadeControls() {
  if (idleWeight === 1 && walkWeight === 0 && runWeight === 0) {
    crossFadeControls[0].disable();
    crossFadeControls[1].enable();
    crossFadeControls[2].disable();
    crossFadeControls[3].disable();
  }

  if (idleWeight === 0 && walkWeight === 1 && runWeight === 0) {
    crossFadeControls[0].enable();
    crossFadeControls[1].disable();
    crossFadeControls[2].enable();
    crossFadeControls[3].disable();
  }

  if (idleWeight === 0 && walkWeight === 0 && runWeight === 1) {
    crossFadeControls[0].disable();
    crossFadeControls[1].disable();
    crossFadeControls[2].disable();
    crossFadeControls[3].enable();
  }
}

function animate() {
  requestAnimationFrame(animate);

  idleWeight = idleAction.getEffectiveWeight();
  walkWeight = walkAction.getEffectiveWeight();
  runWeight = runAction.getEffectiveWeight();

  updateWeightSliders();

  updateCrossFadeControls();

  let mixerUpdateDelta = clock.getDelta();

  if (singleStepMode) {
    mixerUpdateDelta = sizeOfNextStep;
    sizeOfNextStep = 0;
  }

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
