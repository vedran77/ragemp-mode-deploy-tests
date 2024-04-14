import React from 'react';
import { trim } from 'lodash';
import { Formik, Form, FormikValues, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import rpc from 'utils/rpc';
import { showNotification } from 'utils/notifications';
import GradientButton from 'components/Common/gradient-button';
import OutlineButton from 'components/Common/outline-button';
import PrimaryTitle from 'components/Common/primary-title';
import Field from './field';
import images from 'utils/images';

type Props = {
  toLogin: () => void;
};

export default function Forgot({ toLogin }: Props) {
  const [codeSended, setCodeSended] = React.useState(false);

  async function onSubmit(
    values: FormikValues,
    { setFieldError }: FormikHelpers<any>
  ) {
    const data = {
      email: trim(values.email).toLowerCase(),
      password: trim(values.password),
      code: trim(values.code),
    };

    try {
      await rpc.callServer('Auth-ResetPassword', data);

      toLogin();
    } catch (err: any) {
      setFieldError(err.field, err.message);
    }
  }

  return (
    <div className='auth-wrapper right'>
      <div className='character character-left'>
        <img
          src={images.getImage('characters/niko.png')}
          alt='Ghetto Rava'
        />
      </div>

      <div className='auth_login'>
        <PrimaryTitle className='auth_title'>Zaboravljena šifra</PrimaryTitle>

        <div className='auth_login-container'>
          <Formik
            initialValues={{
              email: '',
              password: '',
              passwordConfirm: '',
              code: '',
            }}
            validationSchema={Yup.object({
              email: Yup.string()
                .email('Neispravan e-mail')
                .required('Popunite polje'),
              password: Yup.string()
                .min(4, 'Min. dužina 4 znaka')
                .max(32, 'Max. dužina 32 znaka')
                .required('Popunite polje'),
              passwordConfirm: Yup.string()
                .required('Nepodudaranje lozinke')
                .oneOf([Yup.ref('password'), null], 'Nepodudaranje lozinke'),
              code: Yup.string().required('Popunite polje'),
            })}
            onSubmit={onSubmit}
          >
            {(formik) => (
              <Form className='auth_form'>
                {!codeSended ? (
                  <>
                    <Field
                      title='E-mail'
                      type='email'
                      name='email'
                      placeholder='john.doe@ghetto-rp.com'
                    />

                    <div className='buttons'>
                      <OutlineButton
                        className='auth_back-btn'
                        onClick={toLogin}
                      >
                        Nazad
                      </OutlineButton>

                      <GradientButton
                        type='button'
                        color='green'
                        onClick={() => {
                          if (formik.values.email && !formik.errors.email)
                            rpc
                              .callServer(
                                'Auth-GetResetCode',
                                trim(formik.values.email).toLowerCase()
                              )
                              .then(() => {
                                showNotification(
                                  'info',
                                  'Proverite vaš e-mail'
                                );

                                setCodeSended(true);
                              })
                              .catch(() =>
                                formik.setFieldError(
                                  'email',
                                  'Account nije pronađen'
                                )
                              );
                        }}
                      >
                        Pošalji Kod
                      </GradientButton>
                    </div>
                  </>
                ) : (
                  <>
                    <Field
                      title='Kod za potvrdu'
                      type='text'
                      name='code'
                      placeholder='Proverite svoj e-mail'
                    />

                    <div className='auth_form-group'>
                      <Field
                        title='Nova lozinka'
                        type='password'
                        name='password'
                        placeholder='********'
                      />
                      <Field
                        title='Lozinka'
                        type='password'
                        name='passwordConfirm'
                        placeholder='********'
                      />
                    </div>

                    <div className='buttons'>
                      <OutlineButton
                        className='auth_back-btn'
                        onClick={() => setCodeSended(false)}
                      >
                        Nazad
                      </OutlineButton>

                      <GradientButton type='submit'>Potvrdi</GradientButton>
                    </div>
                  </>
                )}
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
