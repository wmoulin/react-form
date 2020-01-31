import * as React from 'react';
import Form from '../../src/index';

import { create } from 'react-test-renderer';
import * as schema from "./schema.json";

import '@testing-library/jest-dom/extend-expect'

test('test submit with snapshot', async () => {
  const form = create(<div>
  <Form schema={schema} id={"myform"}>
    <label htmlFor={"input-id"}>mon label</label>
    <span>
      <input id={"input-id"} type="text" name="input"></input>
    </span>
    <button type="submit">submit</button>
  </Form></div>);

  let tree = form.toJSON();
  expect(tree).toMatchSnapshot();
  
});
