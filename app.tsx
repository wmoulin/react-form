import React from 'react';
import ReactDOM from 'react-dom';
import { Form } from "src/index.ts";

function App() {
  return (
    <div className="App">
      <header className="App-header">
      </header>
      <body>
        <Form></Form>
      </body>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("app"));

export default App;
