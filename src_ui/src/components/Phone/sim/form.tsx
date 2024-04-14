import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import Button from './button';

type Props = {
  custom: boolean;
  submit: (value: string) => Promise<void>;
  close: () => void;
};

export default function SimForm({ submit, custom, close }: Props) {
  return (
    <Formik
      initialValues={{ phone: '' }}
      validationSchema={
        custom &&
        Yup.object({
          phone: Yup.string()
            .trim()
            .required()
            .matches(/^[0-9]+$/)
            .min(6)
            .max(6),
        })
      }
      onSubmit={(values) => submit(values.phone)}
    >
      <Form className='sim_form'>
        <label className='sim_form-field'>
          <Field
            type='text'
            name='phone'
            placeholder='XXX-XXX'
            disabled={!custom}
          />

          {custom && <span>Unesite broj iznad</span>}
        </label>

        <Button type='submit'>Kupi</Button>
        <Button
          type='button'
          onClick={close}
        >
          Nazad
        </Button>
      </Form>
    </Formik>
  );
}
