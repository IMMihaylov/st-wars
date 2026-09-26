import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

@Component({
  selector: 'app-vader-figure',
  template: `
    <canvas
      #canvas
      class="absolute inset-0 h-full w-full cursor-grab touch-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary active:cursor-grabbing"
      role="img"
      aria-label="Interactive Darth Vader figure. Drag to rotate, or use the left and right arrow keys."
      tabindex="0"
      (keydown)="onKeydown($event)"
    ></canvas>
  `,
  host: {
    class:
      'relative order-2 block h-[48vh] min-h-[320px] overflow-hidden xl:sticky xl:top-0 xl:order-none xl:h-[82vh] xl:min-h-[480px] xl:max-h-[900px]',
  },
})
export class VaderFigureComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) private readonly canvas!: ElementRef<HTMLCanvasElement>;

  private readonly zone = inject(NgZone);
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private controls: OrbitControls | null = null;
  private figure: THREE.Group | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private animationFrame = 0;
  private introCancelled = false;

  private readonly render = () => {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  private readonly stopIntro = () => {
    this.introCancelled = true;
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    this.animationFrame = 0;
  };

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => this.initializeScene());
  }

  ngOnDestroy() {
    this.stopIntro();
    this.resizeObserver?.disconnect();
    this.controls?.removeEventListener('start', this.stopIntro);
    this.controls?.removeEventListener('change', this.render);
    this.controls?.dispose();

    this.scene?.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.geometry.dispose();
      if (Array.isArray(object.material)) {
        object.material.forEach((material) => material.dispose());
      } else {
        object.material.dispose();
      }
    });

    this.renderer?.dispose();
    this.renderer?.forceContextLoss();
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.controls = null;
    this.figure = null;
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    this.stopIntro();
    this.controls?.rotateLeft(event.key === 'ArrowLeft' ? 0.22 : -0.22);
    this.controls?.update();
  }

  private initializeScene() {
    const canvas = this.canvas.nativeElement;
    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
      });
    } catch (error) {
      console.warn('WebGL is unavailable; the Start page will remain usable without the figure.', error);
      return;
    }

    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    this.scene = new THREE.Scene();
    this.scene.add(new THREE.HemisphereLight(0xe6eeff, 0x25232a, 2.1));

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(-4, 7, 7);
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x91baff, 2.6);
    rimLight.position.set(4, 5, -4);
    this.scene.add(rimLight);

    const redLight = new THREE.PointLight(0xb80d20, 18, 6);
    redLight.position.set(2.1, 3.25, 1.2);
    this.scene.add(redLight);

    this.figure = this.createFigure();
    this.figure.rotation.y = -0.18;
    this.scene.add(this.figure);

    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    this.camera.position.set(0, 3.25, 12.5);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.target.set(0, 3.05, 0);
    this.controls.enableDamping = false;
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    this.controls.rotateSpeed = 0.55;
    this.controls.minPolarAngle = Math.PI / 2 - 0.38;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.38;
    this.controls.addEventListener('start', this.stopIntro);
    this.controls.addEventListener('change', this.render);
    this.controls.update();

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.resize();
    this.render();
    this.playIntroTurn();
  }

  private resize() {
    if (!this.renderer || !this.camera || !this.figure) return;
    const canvas = this.canvas.nativeElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;

    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.figure.position.x = 0;
    this.figure.scale.setScalar(width < 480 ? 0.84 : 1);
    this.render();
  }

  private playIntroTurn() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !this.figure) return;

    const startedAt = performance.now();
    const startingAngle = this.figure.rotation.y;
    const angle = -0.1;
    const duration = 1450;
    const step = (now: number) => {
      if (!this.figure || this.introCancelled) return;
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.figure.rotation.y = startingAngle + angle * eased;
      this.render();
      if (progress < 1) this.animationFrame = requestAnimationFrame(step);
      else this.animationFrame = 0;
    };
    this.animationFrame = requestAnimationFrame(step);
  }

  private createFigure(): THREE.Group {
    const figure = new THREE.Group();
    const armor = this.material(0x15191f, 0.52, 0.3);
    const helmet = this.material(0x090c11, 0.7, 0.22);
    const cape = this.material(0x11151b, 0.22, 0.48, THREE.DoubleSide);
    const capeFold = this.material(0x242a32, 0.25, 0.42, THREE.DoubleSide);
    const darkMetal = this.material(0x303740, 0.72, 0.28);
    const silver = this.material(0x9ca6b1, 0.72, 0.24);
    const black = this.material(0x05070a, 0.25, 0.34);
    const red = this.material(0xc51228, 0.2, 0.24);
    const blue = this.material(0x2478d0, 0.2, 0.28);
    const white = this.material(0xdfe4ea, 0.2, 0.3);

    const capeShape = new THREE.Shape();
    capeShape.moveTo(-0.62, 4.62);
    capeShape.quadraticCurveTo(-1.08, 4.55, -1.16, 4.03);
    capeShape.lineTo(-1.55, 0.16);
    capeShape.quadraticCurveTo(0, -0.02, 1.55, 0.16);
    capeShape.lineTo(1.16, 4.03);
    capeShape.quadraticCurveTo(1.08, 4.55, 0.62, 4.62);
    capeShape.closePath();
    this.addMesh(figure, new THREE.ShapeGeometry(capeShape, 1), cape, [0, 0, -0.4]);

    for (const side of [-1, 1]) {
      const fold = new THREE.Shape();
      fold.moveTo(side * 0.57, 4.48);
      fold.lineTo(side * 0.9, 4.25);
      fold.lineTo(side * 1.27, 0.24);
      fold.lineTo(side * 1.02, 0.2);
      fold.closePath();
      this.addMesh(figure, new THREE.ShapeGeometry(fold), capeFold, [0, 0, -0.38]);
    }

    this.addMesh(
      figure,
      new THREE.CylinderGeometry(0.5, 0.67, 1.55, 8),
      armor,
      [0, 3.55, 0],
    );
    this.addMesh(
      figure,
      new THREE.SphereGeometry(1, 10, 7),
      armor,
      [0, 4.25, 0],
      [0.9, 0.29, 0.45],
    );

    this.addMesh(figure, new THREE.BoxGeometry(0.84, 0.64, 0.12), silver, [0, 3.72, 0.52]);
    this.addMesh(figure, new THREE.BoxGeometry(0.72, 0.52, 0.12), black, [0, 3.72, 0.6]);
    for (let index = 0; index < 3; index++) {
      this.addMesh(
        figure,
        new THREE.BoxGeometry(0.38, 0.055, 0.035),
        white,
        [0, 3.9 - index * 0.13, 0.68],
      );
    }
    this.addMesh(figure, new THREE.BoxGeometry(0.19, 0.07, 0.04), blue, [0.19, 3.99, 0.69]);
    this.addMesh(figure, new THREE.BoxGeometry(0.19, 0.07, 0.04), red, [0.19, 3.85, 0.69]);

    this.addMesh(figure, new THREE.CylinderGeometry(0.16, 0.16, 0.2, 8), black, [0, 4.62, 0]);
    this.addMesh(
      figure,
      new THREE.SphereGeometry(0.56, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.62),
      helmet,
      [0, 5.42, 0],
    );
    this.addMesh(figure, new THREE.CylinderGeometry(0.58, 0.82, 0.2, 12), helmet, [0, 5.12, 0]);

    const faceShape = new THREE.Shape();
    faceShape.moveTo(-0.43, 0.16);
    faceShape.lineTo(-0.34, 0.38);
    faceShape.lineTo(0.34, 0.38);
    faceShape.lineTo(0.43, 0.16);
    faceShape.lineTo(0.27, -0.3);
    faceShape.lineTo(0, -0.5);
    faceShape.lineTo(-0.27, -0.3);
    faceShape.closePath();
    this.addMesh(figure, new THREE.ShapeGeometry(faceShape), black, [0, 4.91, 0.49]);

    for (const side of [-1, 1]) {
      const eye = this.addMesh(
        figure,
        new THREE.BoxGeometry(0.2, 0.075, 0.065),
        darkMetal,
        [side * 0.21, 5.12, 0.56],
      );
      eye.rotation.z = side * -0.12;
      const ear = this.addMesh(
        figure,
        new THREE.CylinderGeometry(0.16, 0.16, 0.13, 8),
        darkMetal,
        [side * 0.59, 5.16, 0],
      );
      ear.rotation.z = Math.PI / 2;
    }

    const nose = this.addMesh(
      figure,
      new THREE.ConeGeometry(0.13, 0.27, 3),
      silver,
      [0, 4.99, 0.59],
    );
    nose.rotation.z = Math.PI;
    this.addMesh(figure, new THREE.BoxGeometry(0.3, 0.12, 0.06), darkMetal, [0, 4.72, 0.57]);
    for (let index = 0; index < 3; index++) {
      this.addMesh(
        figure,
        new THREE.BoxGeometry(0.035, 0.11, 0.025),
        silver,
        [-0.08 + index * 0.08, 4.72, 0.615],
      );
    }

    this.addMesh(figure, new THREE.BoxGeometry(1.12, 0.25, 0.2), black, [0, 2.76, 0.22]);
    this.addMesh(figure, new THREE.BoxGeometry(0.45, 0.14, 0.055), silver, [0, 2.76, 0.34]);
    for (const side of [-1, 1]) {
      this.addMesh(figure, new THREE.BoxGeometry(0.1, 0.09, 0.055), red, [side * 0.38, 2.76, 0.34]);
      this.addBetween(figure, [side * 0.31, 2.7, 0], [side * 0.36, 1.48, 0.02], 0.23, 0.19, armor);
      this.addBetween(figure, [side * 0.36, 1.48, 0.02], [side * 0.38, 0.35, 0.12], 0.2, 0.16, darkMetal);
      this.addMesh(
        figure,
        new THREE.BoxGeometry(0.48, 0.34, 0.7),
        black,
        [side * 0.38, 0.22, 0.23],
      );

      this.addBetween(figure, [side * 0.56, 4.21, 0], [side * 0.84, 3.35, 0.04], 0.27, 0.21, armor);
      this.addBetween(figure, [side * 0.84, 3.35, 0.04], [side * 0.86, 2.55, 0.18], 0.22, 0.15, darkMetal);
      this.addMesh(figure, new THREE.SphereGeometry(0.19, 8, 6), black, [side * 0.86, 2.42, 0.2]);
    }

    this.addBetween(figure, [-0.73, 2.39, 0.34], [-1.12, 2.56, 0.34], 0.09, 0.09, silver);
    this.addBetween(figure, [-1.1, 2.55, 0.34], [-2.22, 3.24, 0.34], 0.035, 0.025, red);

    return figure;
  }

  private material(
    color: number,
    metalness: number,
    roughness: number,
    side: THREE.Side = THREE.FrontSide,
  ) {
    return new THREE.MeshStandardMaterial({ color, metalness, roughness, side, flatShading: true });
  }

  private addMesh(
    group: THREE.Group,
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    position: [number, number, number],
    scale?: [number, number, number],
  ) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    if (scale) mesh.scale.set(...scale);
    group.add(mesh);
    return mesh;
  }

  private addBetween(
    group: THREE.Group,
    start: [number, number, number],
    end: [number, number, number],
    startRadius: number,
    endRadius: number,
    material: THREE.Material,
  ) {
    const from = new THREE.Vector3(...start);
    const to = new THREE.Vector3(...end);
    const direction = to.clone().sub(from);
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(startRadius, endRadius, direction.length(), 8),
      material,
    );
    mesh.position.copy(from).add(to).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    group.add(mesh);
    return mesh;
  }
}
