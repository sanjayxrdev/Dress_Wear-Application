import * as THREE from 'three';
import { UpperBodyLandmarks } from './pose-tracker';

export interface GarmentAnchorPoints {
  neck: [number, number]; // normalized [0-1] coordinates on garment image
  leftShoulder: [number, number];
  rightShoulder: [number, number];
  leftHem: [number, number];
  rightHem: [number, number];
  leftSleeve?: [number, number];
  rightSleeve?: [number, number];
}

export interface GarmentAsset {
  id: string;
  type: '2d_warp' | '3d_gltf';
  url: string;
  anchors?: GarmentAnchorPoints;
  gltfUrl?: string;
  scaleModifier?: number;
}

export class WebGLGarmentRenderer {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.OrthographicCamera | null = null;
  private textureLoader: THREE.TextureLoader;

  private garmentMesh: THREE.Mesh | null = null;
  private garmentGeometry: THREE.PlaneGeometry | null = null;
  private currentAsset: GarmentAsset | null = null;
  private isInitialized = false;

  // Grid subdivisions for 2D mesh warp deformation
  private gridSegmentsX = 16;
  private gridSegmentsY = 20;

  // Performance telemetry
  private frameRenderTimes: number[] = [];
  private currentQualityLevel: 'high' | 'medium' | 'low' = 'high';

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.textureLoader = new THREE.TextureLoader();
    this.initThreeJS();
  }

  private initThreeJS(): void {
    if (typeof window === 'undefined') return;

    try {
      const width = this.canvas.width || 640;
      const height = this.canvas.height || 480;

      this.scene = new THREE.Scene();

      // Orthographic camera mapping 1:1 with video canvas pixel coordinates
      this.camera = new THREE.OrthographicCamera(
        0,
        width,
        0,
        -height,
        -1000,
        1000
      );
      this.camera.position.z = 100;

      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      this.renderer.setSize(width, height, false);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      // Lighting for 3D materials
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
      this.scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
      directionalLight.position.set(0, 1, 2);
      this.scene.add(directionalLight);

      this.isInitialized = true;
    } catch (err) {
      console.warn('WebGL initialization failed, falling back to 2D canvas:', err);
    }
  }

  public setGarment(asset: GarmentAsset): Promise<void> {
    this.currentAsset = asset;

    return new Promise((resolve) => {
      this.textureLoader.load(
        asset.url,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;

          this.setupWarpMesh(texture, asset.anchors);
          resolve();
        },
        undefined,
        (err) => {
          console.warn('Could not load garment texture:', err);
          resolve();
        }
      );
    });
  }

  private setupWarpMesh(texture: THREE.Texture, anchors?: GarmentAnchorPoints): void {
    if (!this.scene) return;

    if (this.garmentMesh) {
      this.scene.remove(this.garmentMesh);
      this.garmentMesh.geometry.dispose();
      (this.garmentMesh.material as THREE.Material).dispose();
      this.garmentMesh = null;
    }

    const segmentsX = this.currentQualityLevel === 'low' ? 8 : this.gridSegmentsX;
    const segmentsY = this.currentQualityLevel === 'low' ? 10 : this.gridSegmentsY;

    this.garmentGeometry = new THREE.PlaneGeometry(1, 1, segmentsX, segmentsY);

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    this.garmentMesh = new THREE.Mesh(this.garmentGeometry, material);
    this.scene.add(this.garmentMesh);
  }

  public render(landmarks: UpperBodyLandmarks): void {
    if (!this.renderer || !this.scene || !this.camera || !this.garmentMesh || !this.garmentGeometry) {
      return;
    }

    const start = performance.now();
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Update camera bounds if viewport changed
    if (this.camera.right !== width || this.camera.bottom !== -height) {
      this.camera.right = width;
      this.camera.bottom = -height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height, false);
    }

    // 1. Warp Vertices to Align with Landmark Keypoints
    this.warpMeshVertices(landmarks);

    // 2. Render Scene
    this.renderer.render(this.scene, this.camera);

    // 3. Telemetry for automatic dynamic performance scaling
    const renderTime = performance.now() - start;
    this.frameRenderTimes.push(renderTime);
    if (this.frameRenderTimes.length > 60) {
      const avg =
        this.frameRenderTimes.reduce((a, b) => a + b, 0) / this.frameRenderTimes.length;
      this.frameRenderTimes = [];

      // If average frame render budget exceeds 28ms, degrade subdivision to keep 30 FPS
      if (avg > 28 && this.currentQualityLevel === 'high') {
        this.currentQualityLevel = 'medium';
      } else if (avg > 35 && this.currentQualityLevel === 'medium') {
        this.currentQualityLevel = 'low';
      }
    }
  }

  private warpMeshVertices(landmarks: UpperBodyLandmarks): void {
    if (!this.garmentGeometry) return;

    const pos = this.garmentGeometry.attributes.position;
    const uv = this.garmentGeometry.attributes.uv;

    // Torso anchor bounds in screen pixels
    const neckX = landmarks.neck.x;
    const neckY = landmarks.neck.y;
    const leftShoulderX = landmarks.leftShoulder.x;
    const leftShoulderY = landmarks.leftShoulder.y;
    const rightShoulderX = landmarks.rightShoulder.x;
    const rightShoulderY = landmarks.rightShoulder.y;
    const leftHipX = landmarks.leftHip.x;
    const leftHipY = landmarks.leftHip.y;
    const rightHipX = landmarks.rightHip.x;
    const rightHipY = landmarks.rightHip.y;

    const shoulderSpan = landmarks.shoulderWidth * 1.15;
    const torsoSpan = landmarks.torsoHeight * 1.1;

    for (let i = 0; i < pos.count; i++) {
      const u = uv.getX(i); // 0 (left) to 1 (right)
      const v = uv.getY(i); // 0 (bottom) to 1 (top)

      // Bilinear interpolation across shoulder and hip anchor points
      // Top boundary (v = 1): interpolates between left shoulder and right shoulder via neck
      const topX = leftShoulderX + (rightShoulderX - leftShoulderX) * u;
      const topY = leftShoulderY + (rightShoulderY - leftShoulderY) * u - (1 - Math.abs(u - 0.5) * 2) * 12;

      // Bottom boundary (v = 0): interpolates between left hip and right hip
      const bottomX = leftHipX + (rightHipX - leftHipX) * u;
      const bottomY = leftHipY + (rightHipY - leftHipY) * u;

      // Vertical blend between bottom (v=0) and top (v=1)
      const currentX = bottomX + (topX - bottomX) * v;
      // In Three.js orthographic coordinates, Y is inverted (negative down)
      const currentY = -(bottomY + (topY - bottomY) * v);

      pos.setXYZ(i, currentX, currentY, 0);
    }

    pos.needsUpdate = true;
  }

  public clear(): void {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.clear();
    }
  }

  public dispose(): void {
    if (this.garmentMesh && this.scene) {
      this.scene.remove(this.garmentMesh);
      this.garmentMesh.geometry.dispose();
      (this.garmentMesh.material as THREE.Material).dispose();
      this.garmentMesh = null;
    }
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }
    this.scene = null;
    this.camera = null;
  }
}
