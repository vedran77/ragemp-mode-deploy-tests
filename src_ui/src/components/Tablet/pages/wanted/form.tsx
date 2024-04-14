import React from 'react';
import { Router } from 'framework7/types';
import { Page, Navbar, List, ListInput, ListButton } from 'framework7-react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import rpc from 'utils/rpc';

type Props = {
  f7router: Router.Router;
  userId: string;
};

export default function WantedForm({ f7router, userId }: Props) {
  async function addItem(reason: string, priority: number) {
    await rpc.callServer('WantedList-AddItem', [userId, reason, priority]);

    f7router.back();
  }

  return (
    <Page>
      <Navbar
        title='Prekršaj'
        backLink='Nazad'
      />

      <Formik
        initialValues={{ reason: '', priority: '' }}
        validationSchema={Yup.object({
          reason: Yup.string().required().min(2).max(250),
          priority: Yup.number().required().min(1).max(5),
        })}
        onSubmit={(values) => addItem(values.reason, +values.priority)}
      >
        {({ values, handleChange, submitForm }) => (
          <Form>
            <List inset>
              <ListInput
                clearButton
                name='reason'
                type='textarea'
                placeholder='Razlog'
                info='Opišite prekršaj'
                value={values.reason}
                onChange={handleChange}
                onInputClear={handleChange}
              />
              <ListInput
                clearButton
                name='priority'
                type='number'
                placeholder='Prioritet'
                info='Prioritet od 1 do 5'
                value={values.priority}
                onChange={handleChange}
                onInputClear={handleChange}
              />
            </List>

            <List inset>
              <ListButton
                title='Dodaj'
                onClick={submitForm}
              />
            </List>
          </Form>
        )}
      </Formik>
    </Page>
  );
}
