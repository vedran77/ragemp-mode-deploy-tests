import React, { Component } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import rpc from 'utils/rpc';
import { showNotification } from 'utils/notifications';
import GradientButton from 'components/Common/gradient-button';
import Title from './partials/title';
import Field from './partials/field';

type Props = {
  price: number;
  setAccount: (account: string) => void;
};
type State = {};

export default class BankAccount extends Component<Props, State> {
  async buy(account?: string) {
    try {
      const data = await rpc.callServer('Bank-CreateAccount', account);

      this.props.setAccount(data);
    } catch (err: any) {
      if (err.msg) showNotification('error', err.msg);
    }
  }

  render() {
    return (
      <div className='bank_tab'>
        <Formik
          initialValues={{ account: '' }}
          validationSchema={Yup.object({
            account: Yup.string()
              .trim()
              .required()
              .matches(/^[0-9]+$/)
              .min(6)
              .max(6),
          })}
          onSubmit={(values) => this.buy(values.account)}
        >
          <Form>
            <Title>Otvaranje računa</Title>

            <Field
              type='text'
              name='account'
              placeholder='Željeni broj (opciono)'
              label={`Broj treba da se sastoji od 6 cifara, cena je ${this.props.price}$. Nasumičan broj je besplatan.`}
            />

            <div className='bank_tab-buttons'>
              <GradientButton
                type='button'
                color='purple'
                onClick={this.buy.bind(this, undefined)}
              >
                Nasumičan
              </GradientButton>

              <GradientButton
                type='submit'
                color='orange'
              >
                Željeni
              </GradientButton>
            </div>
          </Form>
        </Formik>
      </div>
    );
  }
}
