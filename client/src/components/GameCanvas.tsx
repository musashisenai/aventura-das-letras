/**
 * Design reminder — Livro-Mapa Encantado: o canvas é a paisagem de papel;
 * a interface é uma trilha grande, tátil e sempre encorajadora.
 */

import { useEffect, useRef, useState } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { GameController, type GameState } from "@/game/GameController";
import { createGameScene, type GameHandle } from "@/game/scene";
import GameUI from "./GameUI";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startedRef = useRef(false);
  const controllerRef = useRef<GameController | null>(null);
  if (!controllerRef.current) {
    const params = new URLSearchParams(window.location.search);
    controllerRef.current = new GameController(params.has("demo"), params.has("menu"));
  }
  const controller = controllerRef.current;
  const [state, setState] = useState<GameState>(() => controller.getState());

  useEffect(() => {
    const unsubscribe = controller.subscribe(setState);
    return () => { unsubscribe(); };
  }, [controller]);

  useEffect(() => {
    if (!state.profile) return;
    void controller.pullTeacherDecision();
    const timer = window.setInterval(() => void controller.pullTeacherDecision(), 5000);
    return () => window.clearInterval(timer);
  }, [controller, state.profile?.studentId]);

  useEffect(() => {
    if (!state.profile?.sessionToken) return;
    void controller.keepStudentSession();
    const timer = window.setInterval(() => void controller.keepStudentSession(), 30000);
    const release = () => controller.releaseStudentSession();
    window.addEventListener("pagehide", release);
    return () => { window.clearInterval(timer); window.removeEventListener("pagehide", release); };
  }, [controller, state.profile?.studentId, state.profile?.sessionToken]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || startedRef.current) return;
    startedRef.current = true;
    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, adaptToDeviceRatio: true });
    let handle: GameHandle | null = null;
    let alive = true;

    createGameScene(engine, canvas).then((created) => {
      if (!alive) {
        created.dispose();
        return;
      }
      handle = created;
      engine.runRenderLoop(() => created.scene.render());
    });

    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);
    return () => {
      alive = false;
      window.removeEventListener("resize", onResize);
      handle?.dispose();
      engine.dispose();
      startedRef.current = false;
    };
  }, []);

  return (
    <div className="game-stage">
      <canvas ref={canvasRef} className="game-canvas" aria-label="Cenário da Aventura das Letras" />
      <GameUI state={state} controller={controller} />
    </div>
  );
}
