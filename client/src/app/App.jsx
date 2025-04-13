import "./App.css";
import { Router } from "../router/Router.jsx";
import { Room } from "../routes/Room.jsx";
import { Home } from "../routes/Home.jsx";

function App() {
  return (
    <>
      <h1 className="red-title center">Red Tetris</h1>
      <Router routes={[{ "/": Home }, { "/:room/:player": Room }]} />
    </>
  );
}

export default App;
