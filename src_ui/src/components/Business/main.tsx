import React, { Component } from 'react';
import prettify from 'utils/prettify';
import PrimaryTitle from 'components/Common/primary-title';
import BusinessInfoItem from './info-item';

type Props = {
  name: string;
  isOwner: boolean;
  owner: string;
  price: number;
  income: number;
  tax: number;
  paid: number;
  paymentTime: number | null;
};
type State = {
  hour: number;
  min: number;
};

class BusinessMain extends Component<Props, State> {
  readonly state: State = {
    hour: 0,
    min: 0,
  };

  private progressInterval?: NodeJS.Timeout;

  componentDidMount() {
    this.runTimer(this.props.paymentTime);
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.paymentTime !== prevProps.paymentTime) {
      this.runTimer(this.props.paymentTime);
    }
  }

  componentWillUnmount() {
    this.stopTimer();
  }

  runTimer(time: number | null) {
    if (!time || time < 0) return;

    this.setState(() => ({
      hour: Math.floor((time / (1000 * 60 * 60)) % 24),
      min: Math.floor((time / 1000 / 60) % 60),
    }));

    this.progressInterval = setInterval(() => {
      const { hour, min } = this.state;
      if (hour === 0 && min === 0) return this.stopTimer();

      if (min > 0) this.setState((state) => ({ min: state.min - 1 }));
      else if (hour > 0)
        this.setState((state) => ({ hour: state.hour - 1, min: 59 }));
    }, 60000);
  }

  stopTimer() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = undefined;
    }
  }

  render() {
    const { isOwner, name, owner, tax, price, income, paid } = this.props;
    const { min, hour } = this.state;

    return (
      <div className='business_main'>
        <PrimaryTitle>{name}</PrimaryTitle>

        <div className='business_info'>
          <BusinessInfoItem title='Vlasnik'>
            {owner || 'Nepoznato'}
          </BusinessInfoItem>
          <BusinessInfoItem title='Profit'>
            {prettify.price(income)}
          </BusinessInfoItem>
          <BusinessInfoItem title='Takse po danu'>
            {prettify.price(tax)}
          </BusinessInfoItem>
          <BusinessInfoItem title={isOwner ? 'Licitacija' : 'Cena'}>
            {prettify.price(price)}
          </BusinessInfoItem>

          {isOwner && (
            <div className='business_info-owned'>
              <BusinessInfoItem title='Otplaćeni dani'>
                {paid.toString()}
              </BusinessInfoItem>
              <BusinessInfoItem title='Profit'>{`${hour
                .toString()
                .padStart(2, '0')}:${min
                .toString()
                .padStart(2, '0')}`}</BusinessInfoItem>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default BusinessMain;
