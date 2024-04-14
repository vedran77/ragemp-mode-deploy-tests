import React from 'react';
import { Router } from 'framework7/types';
import { Page, Navbar, List, ListInput, ListButton } from 'framework7-react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { showNotification } from 'utils/notifications';
import rpc from 'utils/rpc';

type Props = {
  f7router: Router.Router;
  userId: string;
};

export default function UserArrest({ f7router, userId }: Props) {
  async function submitArrest(term: number, reason: string) {
    try {
      if (!userId) return;

      await rpc.callServer('WantedList-Arrest', [userId, term, reason]);

      f7router.back();
    } catch (err: any) {
      if (err.msg) showNotification('error', err.msg);
    }
  }

  return (
    <Page>
      <Navbar
        title='Hapšenje'
        backLink='Nazad'
      />

      <Formik
        initialValues={{ term: '', reason: '' }}
        validationSchema={Yup.object({
          term: Yup.number().required().min(1).max(100),
          reason: Yup.string().required().min(1).max(100),
        })}
        onSubmit={(values) => submitArrest(+values.term, values.reason)}
      >
        {({ values, handleChange, submitForm }) => (
          <Form>
            <List inset>
              <ListInput
                clearButton
                name='term'
                type='number'
                placeholder='Vreme'
                info='Navedite vreme hapšenja od 1 do 100 minuta'
                value={values.term}
                onChange={handleChange}
                onInputClear={handleChange}
              />

              <ListInput
                clearButton
                name='reason'
                type='text'
                placeholder='Razlog'
                info='Ukratko opišite razlog hapšenja'
                value={values.reason}
                onChange={handleChange}
                onInputClear={handleChange}
              />
            </List>

            <List inset>
              <ListButton
                title='Uhapsi'
                onClick={submitForm}
              />
            </List>
          </Form>
        )}
      </Formik>
    </Page>
  );
}
