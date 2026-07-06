import type * as THREE from "three";

import type { PickHit } from "../types/viewer";
import { ThreePickQuery } from "./ThreePickQuery";
import type { PickQuery, PickSource, SceneRay } from "./PickQuery";

export class CppCorePickQuery implements PickQuery {
  private readonly fallbackQuery = new ThreePickQuery();
  private source: PickSource | null = null;

  setMesh(mesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]> | null): void {
    this.fallbackQuery.setMesh(mesh);
  }

  setSource(source: PickSource | null): void {
    this.source = source;
    this.fallbackQuery.setSource(source);
  }

  async pick(ray: SceneRay): Promise<PickHit | null> {
    if (!this.source || this.source.format !== "STL" || !this.source.payloadBase64) {
      return this.fallbackQuery.pick(ray);
    }

    try {
      const response = await fetch("/api/raycast-stl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          stlBase64: this.source.payloadBase64,
          ray
        })
      });

      if (!response.ok) {
        return this.fallbackQuery.pick(ray);
      }

      const result = (await response.json()) as {
        hit: boolean;
        triangleIndex: number;
        distance: number;
        position: { x: number; y: number; z: number };
      };

      if (!result.hit) {
        return null;
      }

      return {
        position: result.position,
        triangleIndex: result.triangleIndex,
        distance: result.distance
      };
    } catch {
      return this.fallbackQuery.pick(ray);
    }
  }
}
