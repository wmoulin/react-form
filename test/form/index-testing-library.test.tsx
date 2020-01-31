import * as React from 'react';
import Form from '../../src/index';

import * as schema from "./schema.json";

import {render, fireEvent, screen} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect'



test('test submit with @testing-library/react', async () => {

  let { container } = render(<Form schema={schema} id={"myform"}>
  <label htmlFor={"input-id"}>mon label</label>
  <span>
    <input id={"input-id"} type="text" name="input"></input>
  </span>
  <button type="submit">submit</button>
</Form>)

  fireEvent.click(container.querySelector('button'));
  fireEvent.submit(container.querySelector('form'))

  await new Promise(resolve => setTimeout(resolve, 1000));

  expect(container.querySelectorAll('div.fielderror-container')).toHaveLength(0);
  expect(container.querySelectorAll('div.container-field-error')).toHaveLength(1);

});