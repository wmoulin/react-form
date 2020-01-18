import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Form } from "../src/index";
import * as schema from "./schema.json";
import "src/sass/test.scss";
import { InputField } from './components/input-field';
import { GroupField } from './components/group-field';
import { RegisterField } from '../src/hoc/register-field';
import { TabList } from './components/tabs/tab-list.js';
import { TabPanel } from './components/tabs/tab-panel.js';
import { TabPanels } from './components/tabs/tab-panels.js';
import { TabListItem } from './components/tabs/tab-list-item.js';
import { TabsLite } from './components/tabs/tabs-lite.js';

function App() {

  const InputFieldRegisterField = RegisterField(InputField, {id: "test-input", label:"input component", disabled: false, name: "InputField"});
  const InputField1RegisterField = RegisterField(InputField, {id: "test-input1", label:"input component", disabled: false, name: "InputField1"});
  const InputField2RegisterField = RegisterField(InputField, {id: "test-input-2", label:"input component 2", disabled: false, name: "InputField2"});
  const InputField3RegisterField = RegisterField(InputField, {id: "test-input-3", label:"input component 3", disabled: false, name: "InputField3"});

  return (
    <div className="App">
      <header className="App-header">
      </header>
      <body>
        <Form schema={schema}>
          <GroupField id={"group-1"} label={"mon groupe"}>
            <label htmlFor={"input-id"}>mon label</label>
            <span>
              <input id={"input-id"} type="text" name="input"></input>
            </span>
            <span>
              <InputFieldRegisterField/>
            </span>
          </GroupField>
          <span>
            <InputField1RegisterField/>
          </span>
          <TabsLite>
          <TabList>
              <TabListItem>
                <label>onglet 1</label>
              </TabListItem>
              <TabListItem>
                <label>onglet 2</label>
              </TabListItem>
            </TabList>
            <TabPanels>
              <TabPanel>
                <span>
                  <InputField2RegisterField/>
                </span>
              </TabPanel>
              <TabPanel>
                <span>
                  <InputField3RegisterField/>
                </span>
              </TabPanel>
            </TabPanels>
          </TabsLite>
          <button type="submit">submit</button>
        </Form>
      </body>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("app"));

export default App;
