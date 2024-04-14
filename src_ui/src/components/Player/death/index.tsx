import React, { Component } from 'react';
import rpc from 'utils/rpc';
import { RouteComponentProps } from 'react-router-dom';
import { showNotification } from 'utils/notifications';
import PrimaryTitle from 'components/Common/primary-title';
import Timer from './timer';

type Props = {} & RouteComponentProps;
type State = {
  duration: number;
  medics: number;
};

export default class Death extends Component<Props, State> {
  readonly state: State = {
    duration: 0,
    medics: 0,
  };

  componentDidMount() {
    this.setState(() => this.props.location.state);
  }

  die() {
    rpc.callClient('Player-ClientDie');
  }

  callMedic() {
    rpc
      .callServer('EmsCalls-Create')
      .then(() => showNotification('info', 'Vaš poziv je poslat'));
  }

  render() {
    const { duration, medics } = this.state;

    return (
      <div className='death'>
        <div className='death_section death_section--danger'>
          <PrimaryTitle className='death_title'>Hitna Pomoć</PrimaryTitle>

          <div className='death_section-container'>
            <button
              className='death_btn'
              onClick={this.die}
            >
              <span>Smrt</span>
            </button>

            <p className='death_descr'>Bićete odvedeni u najbližu bolnicu</p>
          </div>
        </div>

        <Timer duration={duration / 1000} />

        <div className='death_section death_section--safe'>
          <PrimaryTitle className='death_title'>Pomoć</PrimaryTitle>

          <div className='death_section-container'>
            <button
              className='death_btn'
              onClick={this.callMedic}
            >
              <span>Pozovi</span>
            </button>

            <p className='death_descr'>
              Trenutno imamo dostupnih <b>{medics}</b> pripadnika Hitne Pomoći
            </p>
          </div>
        </div>
      </div>
    );
  }
}
