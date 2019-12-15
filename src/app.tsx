import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Form } from "src/index";
import * as schema from "../schema.json";
import "src/sass/test.scss";

function App() {
  return (
    <div className="App">
      <header className="App-header">
      </header>
      <body>
        <Form schema={schema}>
          <label htmlFor={"input-id"}>mon label</label>
          <span>
            <input id={"input-id"} type="text" name="input"></input>
          </span>
          <button type="submit">submit</button>
        </Form>
      </body>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("app"));

export default App;
