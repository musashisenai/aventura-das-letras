/**
 * Aventura das Letras — Livro-Mapa Encantado.
 * Babylon desenha um palco calmo de floresta-papel sob a interface pedagógica.
 */

import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";

export type GameHandle = {
  scene: Scene;
  dispose: () => void;
};

export async function createGameScene(engine: Engine, canvas: HTMLCanvasElement): Promise<GameHandle> {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(1, 0.965, 0.87, 1);

  const camera = new FreeCamera("storybook-camera", new Vector3(0, 0, -10), scene);
  camera.setTarget(Vector3.Zero());
  camera.inputs.clear();
  camera.attachControl(canvas, false);

  return {
    scene,
    dispose: () => scene.dispose(),
  };
}
