import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import rpc from 'utils/rpc';
import PrimaryTitle from 'components/Common/primary-title';
import OutlineButton from 'components/Common/outline-button';
import GradientButton from 'components/Common/gradient-button';
import Selector from 'components/Common/selector';
import Spec from '../spec';
import Bottom from '../bottom';

const types = ['low', 'average', 'premium'];

type State = {
  houses: number[];
  selectedHouse: number;

  price: number;
  seller: string;

  type: string;
  garage: number;
  safe: number;
  govPrice: number;
};
type Props = {} & RouteComponentProps<
  {},
  {},
  { seller: string; price: number; houses: number[] }
>;

export default class HouseSale extends Component<Props, State> {
  readonly state: State = {
    houses: [],
    selectedHouse: 0,

    seller: '',
    price: 0,

    type: 'low',
    govPrice: 0,
    garage: 0,
    safe: 0,
  };

  componentDidMount() {
    const data = this.props.location.state;
    this.setState(() => data);
    this.selectHouse(data.houses[0]);
  }

  async selectHouse(index: number) {
    const data = await rpc.callServer('HouseTrade-GetData', index);
    this.setState(() => ({ ...data, selectedHouse: index }));
  }

  changePrice(value: number) {
    this.setState(() => ({ price: value }));
  }

  sell() {
    const { price, selectedHouse } = this.state;

    rpc.callClient('HouseTrade-SendOffer', [selectedHouse, price]);
  }

  buy() {
    rpc.callClient('HouseTrade-ConfirmOffer');
  }

  refuse() {
    rpc.callClient('HouseTrade-RefuseOffer');
  }

  render() {
    const {
      houses,
      selectedHouse,
      price,
      type,
      garage,
      safe,
      seller,
      govPrice,
    } = this.state;

    return (
      <div className='trading trading--house'>
        <div className='trading_top'>
          <PrimaryTitle className='trading_title'>
            {`${seller ? 'Kupovina' : 'Prodaja'} kuće`}
          </PrimaryTitle>

          <Selector
            className='trading_selector'
            items={houses}
            value={selectedHouse}
            customValue={`Kuća ${selectedHouse}`}
            onChange={this.selectHouse.bind(this)}
          />

          <div className='trading_info'>
            <div className='trading_info-items'>
              <p className='trading_info-item'>
                Cena: <b>{govPrice}$</b>
              </p>
            </div>

            <Spec
              type='house'
              items={{
                star: types.indexOf(type.split('_')[0]) + 1,
                garage,
                safe,
              }}
            />
          </div>
        </div>

        <Bottom
          seller={seller}
          price={price}
          setPrice={this.changePrice.bind(this)}
        />

        <div className='trading_footer'>
          <OutlineButton onClick={this.refuse}>Zatvori</OutlineButton>

          {seller ? (
            <GradientButton onClick={this.buy}>Kupi</GradientButton>
          ) : (
            <GradientButton onClick={this.sell.bind(this)}>
              Ponuda
            </GradientButton>
          )}
        </div>
      </div>
    );
  }
}
