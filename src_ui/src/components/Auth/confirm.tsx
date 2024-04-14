import React from 'react';
import rpc from 'utils/rpc';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import GradientButton from 'components/Common/gradient-button';
import PrimaryTitle from 'components/Common/primary-title';
import Field from './field';

type Props = {
  email: string;
};

export default function AuthConfirm({ email }: Props) {
  return (
    <div className='auth_confirm'>
      <PrimaryTitle className='auth_title'>Nepoznati uređaj</PrimaryTitle>

      <p className='auth_confirm-remark'>
        Pokušaj prijave sa nepoznatog uređaja.
        <br />
        Potvrdite da ste to vi.
      </p>

      <Formik
        initialValues={{ code: '' }}
        validationSchema={Yup.object({
          code: Yup.string().required('Popunite polje'),
        })}
        onSubmit={(values, { setFieldError }) => {
          rpc
            .callServer('Auth-SignInWithCode', [email, values.code])
            .then(() => rpc.callClient('Auth-SuccessLogin', email))
            .catch(() => setFieldError('code', 'Neispravan kod'));
        }}
      >
        <Form className='auth_form'>
          <Field
            title='Kod za potvrdu'
            type='text'
            name='code'
            placeholder='Potvrdite vaš e-mail'
          />

          <GradientButton type='submit'>Potvrdi</GradientButton>
        </Form>
      </Formik>
    </div>
  );
}
