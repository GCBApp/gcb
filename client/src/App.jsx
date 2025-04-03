import { useState } from "react";
import "./App.css";
import TableList from "./components/CrudList";

const URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function App() {
  const [showTables, setShowTables] = useState(false);

  return (
    <div className="App">
      <h1>GCB App</h1>
      <br />
      <br />
      {showTables ? (
        <TableList />
      ) : (
        <button onClick={() => setShowTables(true)}>Ver tablas</button>
      )}
    </div>
  );
}

export default App;