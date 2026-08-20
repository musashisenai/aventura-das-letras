/**
 * Design reminder — Livro-Mapa Encantado: a rota inicial é inteiramente uma
 * aventura em tela cheia, sem moldura de aplicativo convencional.
 */

import ErrorBoundary from "./components/ErrorBoundary";
import GameCanvas from "./components/GameCanvas";

export default function App() {
  return <ErrorBoundary><GameCanvas /></ErrorBoundary>;
}
