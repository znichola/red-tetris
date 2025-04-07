import "./App.css";
import { Router } from "../router/Router";
import { Room } from "../routes/Room";
import { Home } from "../routes/Home";

function App() {

  return (
    <>
      <h1>Red Tetris</h1>
      <Router
        routes={{
          "/": Home,
          "/room": Room,
        }}
      />
    </>
  );
}

export default App;
