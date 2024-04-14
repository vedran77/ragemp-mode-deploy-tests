import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

type Props = {
  onSubmit: (firstName: string, lastName: string) => void;
};

export default function PassportForm({ onSubmit }: Props) {
  return (
    <Formik
      initialValues={{
        firstName: '',
        lastName: '',
      }}
      validationSchema={Yup.object({
        firstName: Yup.string()
          .matches(/^[a-z\s]+$/i, 'Samo latinica')
          .max(32, 'Maksimalna dužina 32 karaktera')
          .required('Popunite polje'),
        lastName: Yup.string()
          .matches(/^[a-z\s]+$/i, 'Samo latinica')
          .max(32, 'Maksimalna dužina 32 karaktera')
          .required('Popunite polje'),
      })}
      onSubmit={(values) => onSubmit(values.firstName, values.lastName)}
    >
      <Form
        className='passport_form'
        id='passport'
      >
        <div className='passport_form-field'>
          <Field
            type='text'
            name='firstName'
            placeholder='Ime'
          />
          <ErrorMessage
            className='passport_form-error'
            component='p'
            name='firstName'
          />
        </div>

        <div className='passport_form-field'>
          <Field
            type='text'
            name='lastName'
            placeholder='Prezime'
          />
          <ErrorMessage
            className='passport_form-error'
            component='p'
            name='lastName'
          />
        </div>
      </Form>
    </Formik>
  );
}
