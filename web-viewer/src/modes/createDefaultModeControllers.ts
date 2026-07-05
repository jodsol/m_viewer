import { MeasureModeController } from "./MeasureModeController";
import type { ModeController } from "./ModeController";
import { InspectModeController } from "./InspectModeController";
import { MeasurementTool } from "../tools/MeasurementTool";
import { PickingTool } from "../tools/PickingTool";
import type { MeasurementInfo, PickInfo } from "../types/viewer";
import type * as THREE from "three";

export function createDefaultModeControllers(options: {
  camera: THREE.PerspectiveCamera;
  canvas: HTMLCanvasElement;
  scene: THREE.Scene;
  onPickChange: (pickInfo: PickInfo | null) => void;
  onMeasurementChange: (measurementInfo: MeasurementInfo | null) => void;
}): ModeController[] {
  const pickingTool = new PickingTool({
    camera: options.camera,
    canvas: options.canvas,
    scene: options.scene,
    onPickChange: options.onPickChange
  });

  const measurementTool = new MeasurementTool({
    camera: options.camera,
    canvas: options.canvas,
    scene: options.scene,
    onMeasurementChange: options.onMeasurementChange
  });

  return [
    new InspectModeController(pickingTool),
    new MeasureModeController(measurementTool)
  ];
}
