import React, { Component } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import rpc from 'utils/rpc';
import PrimaryTitle from 'components/Common/primary-title';
import GradientButton from 'components/Common/gradient-button';
import OutlineButton from 'components/Common/outline-button';

type State = {
  recipient?: string;
};

export default class PlayerCash extends Component<{}, State> {
  readonly state: State = {
    recipient: '',
  };

  componentDidMount() {
    rpc.register('Player-ShowCashMenu', (name) => {
      this.setState(() => ({ recipient: name }));
    });
  }

  componentWillUnmount() {
    rpc.unregister('Player-ShowCashMenu');
  }

  async giveMoney(value: number) {
    await rpc.callServer('Player-GiveCash', value);

    this.closeMenu();
  }

  closeMenu() {
    this.setState(() => ({ recipient: undefined }));
  }

  render() {
    const { recipient } = this.state;

    return recipient ? (
      <div className='player-cash'>
        <PrimaryTitle className='player-cash_title'>
          Prenos gotovine
        </PrimaryTitle>

        <div className='player-cash_container'>
          <div className='player-cash_section'>
            <h4>Primalac</h4>
            <span>{recipient}</span>
          </div>

          <div className='player-cash_section'>
            <h4>Suma</h4>

            <Formik
              initialValues={{ sum: 0 }}
              validationSchema={Yup.object({
                sum: Yup.number().min(1).max(10000000).required(),
              })}
              onSubmit={(values) => this.giveMoney(values.sum)}
            >
              <Form
                id='cash'
                className='player-cash_form'
              >
                <Field
                  className='outline-input'
                  type='text'
                  name='sum'
                />
              </Form>
            </Formik>
          </div>
        </div>

        <div className='player-cash_footer'>
          <OutlineButton onClick={this.closeMenu.bind(this)}>
            Odustani
          </OutlineButton>
          <GradientButton form='cash'>Prenos</GradientButton>
        </div>
      </div>
    ) : null;
  }
}
