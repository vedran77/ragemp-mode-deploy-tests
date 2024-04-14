import React from 'react';
import rpc from 'utils/rpc';
import Select from 'react-select';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { showNotification } from 'utils/notifications';
import GradientButton from 'components/Common/gradient-button';

const classes = [
  {
    value: 'low',
    label: 'Nisko',
  },
  {
    value: 'average',
    label: 'Srednje',
  },
  {
    value: 'premium',
    label: 'Visoko',
  },
];

export default function AdminHouseCreator() {
  async function createHouse(type: string) {
    await rpc.callServer('Admin-CreateHouse', type);
    showNotification('success', 'Kuća je kreirana');
  }

  return (
    <Formik
      initialValues={{ type: '' }}
      validationSchema={Yup.object({
        type: Yup.string().required(),
      })}
      onSubmit={(values) => createHouse(values.type)}
    >
      {(formik) => (
        <Form>
          <Select
            className='admin_select'
            classNamePrefix='admin_select'
            placeholder='Tip kuće'
            options={classes}
            noOptionsMessage={() => 'Nije pronadjena'}
            onChange={(option) => formik.setFieldValue('type', option?.value)}
          />

          <GradientButton type='submit'>Kreiraj</GradientButton>
        </Form>
      )}
    </Formik>
  );
}
