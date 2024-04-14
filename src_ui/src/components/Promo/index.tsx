import React from 'react';
import rpc from 'utils/rpc';
import GradientButton from 'components/Common/gradient-button';
import PrimaryTitle from 'components/Common/primary-title';

export default function Promo() {
  return (
    <div className='promo'>
      <div className='promo_container'>
        <PrimaryTitle className='promo_title'>Prvi koraci</PrimaryTitle>

        <div className='promo_remark'>
          Za potpuni doživljaj, ne zaboravite uključiti zvuk u igri.
        </div>

        <div className='promo_video'>
          <iframe
            title='Ghetto RolePlay'
            src='https://www.youtube.com/embed/PBnjkfUZ2vs'
          ></iframe>
        </div>

        <GradientButton onClick={() => rpc.callServer('Character-ShowCreator')}>
          Započni avanturu
        </GradientButton>
      </div>
    </div>
  );
}
