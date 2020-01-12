import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Form } from "src/index";
import * as schema from "../schema.json";
import "src/sass/test.scss";
import { InputField } from 'src/temp/input-field';
import { useFormField } from 'src/hooks/use-form-field';
import { RegisterField } from 'src/hoc/register-field-fc';

function App() {
  const { register } = useFormField();
  const InputFieldRegisterField = RegisterField(InputField, {id: "test-input", label:"input component", disabled: false});
  const InputField1RegisterField = RegisterField(InputField, {id: "test-input1", label:"input component", disabled: false, name: "InputField1"});

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
          <span>
            <InputFieldRegisterField/>
          </span>
          <span>
            <InputField1RegisterField/>
          </span>
          <button type="submit">submit</button>
        </Form>
      </body>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("app"));

export default App;
