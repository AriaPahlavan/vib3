import {
  CameraHelper,
  Color,
  Fog,
  FogExp2,
  PerspectiveCamera,
  Scene,
  WebGLCapabilities,
  WebGLRenderer,
} from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { WebGLRendererParameters } from 'three/src/renderers/WebGLRenderer';

export type CameraSupplier = (timeS: number, timeMs: number) => number;
export type Animation = (timeS: number, timeMs: number) => void;

interface Views {
  mainView: HTMLElement;
  secondView: HTMLElement;
  secondCamera: PerspectiveCamera;
}

export class Vib3 {
  private _scene: Scene;
  private _renderer: WebGLRenderer;
  private _cameras = [];
  private _cameraHelpers: CameraHelper[] = [];
  private _animations: Animation[] = [];
  private _curCamSupplier: CameraSupplier;
  private _resizeRenderer = true;
  private _views: Views;
  private _mainCameraOrbitalControls: OrbitControls;

  private constructor(params: WebGLRendererParameters = {}) {
    this._renderer = new WebGLRenderer(params);
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    const rendererElem = this._renderer.domElement;
    rendererElem.style.width = '100%';
    rendererElem.style.height = '100%';
    rendererElem.style.display = 'block';
    document.body.appendChild(rendererElem);
    this._scene = new Scene();
    return this;
  }

  private get curCamSupplier(): CameraSupplier {
    return this._curCamSupplier;
  }

  private set curCamSupplier(value: CameraSupplier) {
    this._curCamSupplier = value;
  }

  private get orbitalControls() {
    return this._mainCameraOrbitalControls;
  }

  private set orbitalControls(controls: OrbitControls) {
    this._mainCameraOrbitalControls = controls;
  }

  private get views() {
    return this._views;
  }

  private set views(v: Views) {
    this._views = v;
  }

  /**
   * Renderer
   */
  get renderer(): WebGLRenderer {
    return this?._renderer;
  }

  /**
   * Canvas element for this renderer
   */
  get canvas() {
    return this.renderer?.domElement;
  }

  /**
   * Scene for this renderer
   */
  get scene(): Scene {
    return this?._scene;
  }

  /**
   * All cameras to be used in the scene
   * (excluding secondary camera if split view is enabled)
   */
  get cameras() {
    return this?._cameras;
  }

  /**
   * All camera helpers to be used in the scene
   * (excluding secondary camera helper if split view is enabled)
   */
  get cameraHelpers(): CameraHelper[] {
    return this?._cameraHelpers;
  }

  /**
   * Primary view when split view is enabled
   */
  get primaryView() {
    return this.views?.mainView || this.canvas;
  }

  /**
   * Secondary view when split view is enabled
   */
  get secondaryView() {
    return this.views?.secondView;
  }

  /**
   * Secondary camera when split view is enabled
   */
  get secondaryCamera() {
    return this.views?.secondCamera;
  }

  /**
   * Background color of the scene
   */
  get backgroundColor() {
    const bg = this.scene.background;
    if (bg && bg.constructor.name.toLowerCase().includes('color')) {
      return (bg as Color).getHex();
    } else if (bg === null) {
      return 0x000;
    } else {
      return null;
    }
  }

  /**
   * All animations added to be rendered
   */
  get animations(): Animation[] {
    return this?._animations;
  }

  /**
   * Check if split view is enabled
   */
  get splitViewEnabled() {
    return !!this.views;
  }

  /**
   * Configured renderer capabilities
   */
  get capabilities(): WebGLCapabilities {
    return this.renderer.capabilities;
  }

  /**
   * Initialize three.js with specified parameters
   */
  static init = (webGLRendererParameters?: WebGLRendererParameters) => {
    return new Vib3(webGLRendererParameters);
  };

  /**
   * Start the animation loop
   */
  animate(scene = this.scene, allCams = this.cameras) {
    const render = time => {
      if (this.resizeRendererToDisplaySize(this.renderer)) {
        allCams.forEach(cam => this.updateCameraAspect(cam, this.renderer));
      }
      this.animations.forEach(x => x(time * 0.001, time));

      if (this.splitViewEnabled) {
        this.renderer.setScissorTest(true);
        const curCam = this.getCurCam(time) as any;
        const curCamHelper = (this.getCurCamHelper(time) || {}) as any;
        {
          const aspect = this.setScissorForElement(this.primaryView);
          if (curCam.constructor.name.includes('PerspectiveCamera')) {
            curCam.aspect = aspect;
          } else {
            curCam.left = -aspect;
            curCam.right = aspect;
          }
          curCam.updateProjectionMatrix();
          if (curCamHelper.update) {
            curCamHelper.update();
          }
          curCamHelper.visible = false;
          this.renderer.render(scene, curCam);
        }
        {
          const secondCam = this.secondaryCamera;
          secondCam.aspect = this.setScissorForElement(this.secondaryView);
          secondCam.updateProjectionMatrix();
          curCamHelper.visible = true;
          const sceneColor = this.scene.background;
          const sceneFog = this.scene.fog;
          this.disableFog();
          this.scene.background = new Color(0x000040);
          this.renderer.render(scene, secondCam);
          this.scene.background = sceneColor;
          this.scene.fog = sceneFog;
        }
      } else {
        this.renderer.render(scene, this.getCurCam(time));
      }
      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
    return this;
  }

  /**
   * Add camera to the list of all cameras
   *
   * A camera supplier can be provided to switch between the cameras programmatically
   */
  addCamera(camera) {
    this.cameras.push(camera);
    return this;
  }

  /**
   * Add an animation to the animation loop
   */
  addAnimation(...animation: Animation[]) {
    this.animations.push(...animation);
    return this;
  }

  withRendererSize(width, height, updateStyle?) {
    this.renderer.setSize(width, height, updateStyle);

    return this;
  }

  /**
   * Add a list of cameras to the list of all cameras
   *
   * A camera supplier can be provided to switch between the cameras programmatically
   */
  withCameras(...cameras) {
    this.cameras.push(...cameras);
    return this;
  }

  /**
   * Add a list of camera helpers to the list of all camera helpers
   */
  withCameraHelpers(...cameraHelpers: CameraHelper[]) {
    cameraHelpers.forEach(x => this.scene.add(x));
    this.cameraHelpers.push(...cameraHelpers);
    return this;
  }

  /**
   * Add a camera index supplier to switch between all cameras programmatically
   */
  withCameraSupplier(supplier: CameraSupplier) {
    this.curCamSupplier = supplier;
    return this;
  }

  /**
   * Update the scene background color
   */
  withSceneColor(color) {
    this.scene.background = color;

    return this;
  }

  /**
   * Enable renderer shadow
   */
  enableShadow() {
    this.renderer.shadowMap.enabled = true;
    return this;
  }

  /**
   * Enable renderer Physically Correct Lights
   */
  enablePhysicallyCorrectLights() {
    this.renderer.physicallyCorrectLights = true;
    return this;
  }

  /**
   * Enable split view
   */
  enableSplitView() {
    const split = document.createElement('div') as HTMLDivElement;
    const v1 = document.createElement('div') as HTMLDivElement;
    const v2 = document.createElement('div') as HTMLDivElement;

    split.style.position = 'absolute';
    split.style.left = `${this.canvas.clientLeft}`;
    split.style.top = `${this.canvas.clientTop}`;
    split.style.width = `${this.canvas.clientWidth}px`;
    split.style.height = `${this.canvas.clientWidth}px`;
    split.style.display = 'flex';

    v1.style.width = '100%';
    v1.style.height = '100%';

    v2.style.width = '100%';
    v2.style.height = '100%';

    split.appendChild(v1);
    split.appendChild(v2);

    document.body.appendChild(split);

    this.views = {
      mainView: v1,
      secondView: v2,
      secondCamera: this.scissorCamera(v2),
    };

    const controls = this.orbitalControls;
    if (controls) {
      const t = controls.target;
      this.enableOrbitalControlsFor(controls.object, [t.x, t.y, t.z], v1);
      controls.dispose();
    }

    return this;
  }

  /**
   * Enable scene Fog
   *
   * Note: matches its color with the scene color
   */
  enableFog(color = 0xf2f8f7, near?, far?) {
    this.scene.fog = new Fog(color, near, far);
    this.matchSceneAndFogColors();

    return this;
  }

  /**
   * Enable scene FogExp2
   *
   * Note: matches its color with the scene color
   */
  enableFogExp2(color = this.backgroundColor || 0xf2f8f7, density = 0.1) {
    this.scene.fog = new FogExp2(color, density);
    this.matchSceneAndFogColors();
    return this;
  }

  /**
   * Disable scene fog
   */
  disableFog() {
    this.scene.fog = null;
    return this;
  }

  /**
   * Enable Orbital Controls for the specified camera
   */
  enableOrbitalControlsFor(
    camera,
    target = [0, 0, 0],
    view = this.primaryView
  ) {
    const controls = new OrbitControls(camera, view);

    // @ts-ignore
    controls.target.set(...target);
    controls.update();

    this.orbitalControls = controls;
    return this;
  }

  /**
   * Initialize RectAreaLightUniformsLib
   */
  initRectAreaLightUniformsLib() {
    RectAreaLightUniformsLib.init();
    return this;
  }

  /**
   * Disables renderer resize, which is essential for responsiveness
   */
  disableRendererResize() {
    this._resizeRenderer = false;
    return this;
  }

  /**
   * If fog is enabled, matches the scene background color with the fog color
   */
  matchSceneAndFogColors() {
    if (this.scene.fog) {
      this.scene.background = this.scene.fog.color;
    }
    return this;
  }

  private resizeRendererToDisplaySize = renderer => {
    if (!this._resizeRenderer) {
      return false;
    }
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const elemWidth = (canvas.clientWidth * pixelRatio) | 0;
    const elemHeight = (canvas.clientHeight * pixelRatio) | 0;
    const renderWidth = canvas.width;
    const renderHeight = canvas.height;
    const needResize = renderWidth !== elemWidth || renderHeight !== elemHeight;
    if (needResize) {
      renderer.setSize(elemWidth, elemHeight, false);
    }
    return needResize;
  };

  private updateCameraAspect = (camera, renderer: WebGLRenderer) => {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  };

  private getCurCam(time) {
    if (this.curCamSupplier) {
      const i = this.curCamSupplier(time * 0.001, time);
      return this.cameras[i];
    } else {
      return this.cameras[0];
    }
  }

  private getCurCamHelper(time) {
    if (this.cameraHelpers.length === 0) {
      return undefined;
    } else if (this.curCamSupplier) {
      const i = this.curCamSupplier(time * 0.001, time);
      return this.cameraHelpers[i];
    } else {
      return this.cameraHelpers[0];
    }
  }

  private scissorCamera(secondView: HTMLElement): PerspectiveCamera {
    const camera = new PerspectiveCamera(60, 2, 0.1, 500);
    camera.position.set(40, 10, 30);
    camera.lookAt(0, 5, 0);

    const controls = new OrbitControls(camera, secondView);
    controls.target.set(0, 5, 0);
    controls.update();

    return camera;
  }

  private setScissorForElement(
    elem: HTMLElement,
    renderer = this.renderer,
    canvas = this.canvas
  ) {
    const canvasRect = canvas.getBoundingClientRect();
    const elemRect = elem.getBoundingClientRect();

    const pixelRatio = window.devicePixelRatio;

    const elemRight = elemRect.right * pixelRatio;
    const elemLeft = elemRect.left * pixelRatio;
    const elemBottom = elemRect.bottom * pixelRatio;
    const elemTop = elemRect.top * pixelRatio;

    const canvasRight = canvasRect.right * pixelRatio;
    const canvasLeft = canvasRect.left * pixelRatio;
    const canvasBottom = canvasRect.bottom * pixelRatio;
    const canvasTop = canvasRect.top * pixelRatio;

    const canvasWidth = canvasRect.width * pixelRatio;
    const canvasHeight = canvasRect.height * pixelRatio;

    const right = Math.min(elemRight, canvasRight) - canvasLeft;
    const left = Math.max(0, elemLeft - canvasLeft);
    const bottom = Math.min(elemBottom, canvasBottom) - canvasTop;
    const top = Math.max(0, elemTop - canvasTop);

    const width = Math.min(canvasWidth, right - left);
    const height = Math.min(canvasHeight, bottom - top);

    const positiveYUpBottom = canvasHeight - bottom;
    renderer.setScissor(left, positiveYUpBottom, width, height);
    renderer.setViewport(left, positiveYUpBottom, width, height);

    return width / height;
  }
}
