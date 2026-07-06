import type * as THREE from "three";

import type { MeasurementInfo, PickHit } from "../types/viewer";
import { CppCorePickQuery } from "../tools/CppCorePickQuery";
import { MeasurementTool } from "../tools/MeasurementTool";
import { PickingTool } from "../tools/PickingTool";
import { InspectModeController } from "./InspectModeController";
import { MeasureModeController } from "./MeasureModeController";
import type { ModeController } from "./ModeController";

export function createDefaultModeControllers(options: {
  camera: THREE.PerspectiveCamera;
  canvas: HTMLCanvasElement;
  scene: THREE.Scene;
  onPickChange: (pickHit: PickHit | null) => void;
  onMeasurementChange: (measurementInfo: MeasurementInfo | null) => void;
}): ModeController[] {
  const sharedPickQuery = new CppCorePickQuery();

  const pickingTool = new PickingTool({
    camera: options.camera,
    canvas: options.canvas,
    scene: options.scene,
    pickQuery: sharedPickQuery,
    onPickChange: options.onPickChange
  });

  const measurementTool = new MeasurementTool({
    camera: options.camera,
    canvas: options.canvas,
    scene: options.scene,
    pickQuery: sharedPickQuery,
    onMeasurementChange: options.onMeasurementChange
  });

  return [
    new InspectModeController(pickingTool),
    new MeasureModeController(measurementTool)
  ];
}
