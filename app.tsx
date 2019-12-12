import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Form } from "src/index";
import * as schema from "./schema.json";

function App() {
  return (
    <div className="App">
      <header className="App-header">
      </header>
      <body>
        <Form schema={schema}>
          <input type="text" name="input"></input><button type="submit">submit</button>
        </Form>
      </body>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("app"));

export default App;
