import * as THREE from "three";

import type { PickHit } from "../types/viewer";
import type { PickQuery, PickSource, SceneRay } from "./PickQuery";

export class ThreePickQuery implements PickQuery {
  private readonly raycaster = new THREE.Raycaster();
  private mesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]> | null = null;

  setMesh(mesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]> | null): void {
    this.mesh = mesh;
  }

  setSource(_source: PickSource | null): void {}

  async pick(ray: SceneRay): Promise<PickHit | null> {
    if (!this.mesh) {
      return null;
    }

    this.raycaster.set(
      new THREE.Vector3(ray.origin.x, ray.origin.y, ray.origin.z),
      new THREE.Vector3(ray.direction.x, ray.direction.y, ray.direction.z)
    );

    const intersections = this.raycaster.intersectObject(this.mesh, false);
    if (intersections.length === 0) {
      return null;
    }

    const pickedPoint = intersections[0].point;
    return {
      position: {
        x: pickedPoint.x,
        y: pickedPoint.y,
        z: pickedPoint.z
      },
      triangleIndex: intersections[0].faceIndex ?? -1,
      distance: intersections[0].distance
    };
  }
}
