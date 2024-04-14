import React, { Component } from 'react';
import rpc from 'utils/rpc';
import { showNotification } from 'utils/notifications';
import Group from '../partials/group';
import Button from '../partials/button';
import Description from '../partials/description';
import Form from './form';

type State = {
  code: string;
  income: number;
  bonus: number;
  referrals: {
    total: number;
    confirmed: number;
  };
  confirmLevel: number;
};

export default class Referral extends Component<{}, State> {
  readonly state: State = {
    code: 'NONE',
    income: 0,
    bonus: 0,
    referrals: {
      total: 0,
      confirmed: 0,
    },
    confirmLevel: 0,
  };

  componentDidMount() {
    rpc
      .callServer('Referral-GetInfo')
      .then((data: any) => this.setState(() => data));
  }

  async useCode(code: string) {
    try {
      await rpc.callServer('Referral-UseCode', code);

      showNotification('success', 'Promotivni kod je uspeo aktiviran');
    } catch (err: any) {
      if (err.msg) showNotification('error', err.msg);
    }
  }

  render() {
    const { code, bonus, income, referrals, confirmLevel } = this.state;

    return (
      <div className='referral'>
        <Group className='referral_info'>
          <Button current={code}>Kod</Button>
          <Button current={referrals.total.toString()}>Aktiviran</Button>
          <Button current={referrals.confirmed.toString()}>Bonus</Button>
        </Group>

        <Description>{`Nakon što igrač dostigne ${confirmLevel} level, on će dobiti ${bonus}$, a vi ${income}$.`}</Description>

        <Form submit={this.useCode.bind(this)} />
      </div>
    );
  }
}
