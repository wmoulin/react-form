import * as React from 'react';
import Form from '../../src/index';

import * as schema from "./schema.json";

import {render, fireEvent, screen} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect'

import { InputField } from '../../sample/components/input-field';
import { RegisterField } from '../../src/hoc/register-field';

test('test submit with snapshot render', async () => {
  const form = render(
  <Form schema={schema} id={"myform"}>
    <label htmlFor={"input-id"}>mon label</label>
    <span>
      <input id={"input-id"} type="text" name="input"></input>
    </span>
    <button type="submit">submit</button>
  </Form>);


  expect(form).toMatchSnapshot();
  fireEvent.click(form.baseElement.querySelector('button'));
  fireEvent.submit(form.baseElement.querySelector('form'))

  await new Promise(resolve => setTimeout(resolve, 1000));

  expect(form).toMatchSnapshot();
  
});
test('test submit hoc with snapshot render', async () => {
  const InputFieldRegisterField = RegisterField(InputField, {id: "test-input", label:"input component", disabled: false, name: "InputField"});
  const form = render(
  <Form schema={schema} id={"myform"}>
    <label htmlFor={"input-id"}>mon label</label>
    <span>
      <input id={"input-id"} type="text" name="input"></input>
    </span>
    <span>
      <InputFieldRegisterField/>
    </span>
    <button type="submit">submit</button>
  </Form>);


  expect(form).toMatchSnapshot();
  fireEvent.click(form.baseElement.querySelector('button'));
  fireEvent.submit(form.baseElement.querySelector('form'))

  await new Promise(resolve => setTimeout(resolve, 1000));

  expect(form).toMatchSnapshot();
  
});