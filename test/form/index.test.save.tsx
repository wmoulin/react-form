import * as Enzyme from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

import * as React from 'react';
import Form from '../../src/index';

import { create } from 'react-test-renderer';
import * as schema from "./schema.json";
import { shallow, mount, render as renderEnzime } from 'enzyme';
//import { render } from 'enzyme';
//import { mount } from 'enzyme';

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

  // fill out the form
  /*fireEvent.change(screen.getByLabelText(/username/i), {
    target: {value: 'chuck'},
  })
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: {value: 'norris'},
  })*/

  fireEvent.click(container.querySelector('button'));
  fireEvent.submit(container.querySelector('form'))

  // just like a manual tester, we'll instruct our test to wait for the alert
  // to show up before continuing with our assertions.
  //const alert = await screen.findByRole('alert')
  await new Promise(resolve => setTimeout(resolve, 1000));
  //console.log(container);
  expect(container.querySelectorAll('div.fielderror-container')).toHaveLength(0);
  expect(container.querySelectorAll('div.container-field-error')).toHaveLength(1);

  // .toHaveTextContent() comes from jest-dom's assertions
  // otherwise you could use expect(alert.textContent).toMatch(/congrats/i)
  // but jest-dom will give you better error messages which is why it's recommended

});

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

test('test submit with snapshot render', async () => {
  const form = render(<div>
  <Form schema={schema} id={"myform"}>
    <label htmlFor={"input-id"}>mon label</label>
    <span>
      <input id={"input-id"} type="text" name="input"></input>
    </span>
    <button type="submit">submit</button>
  </Form></div>);


  expect(form).toMatchSnapshot();
  fireEvent.click(form.baseElement.querySelector('button'));
  fireEvent.submit(form.baseElement.querySelector('form'))

  await new Promise(resolve => setTimeout(resolve, 1000));

  expect(form).toMatchSnapshot();
  
});