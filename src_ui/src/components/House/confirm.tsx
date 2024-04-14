import React from 'react';
import PrimaryTitle from 'components/Common/primary-title';
import OutlineButton from 'components/Common/outline-button';
import GradientButton from 'components/Common/gradient-button';

type Props = {
  submit: () => void;
  cancel: () => void;
};

export default function HouseConfirm({ submit, cancel }: Props) {
  return (
    <div className='house_confirm'>
      <div className='house_confirm-container'>
        <PrimaryTitle className='house_confirm-title'>
          Prodaja kuće
        </PrimaryTitle>

        <p className='house_confirm-remark'>
          Da li zaista želite da <b>prodate kuću državi</b>?
        </p>

        <div className='house_confirm-buttons'>
          <OutlineButton onClick={cancel}>Zatvori</OutlineButton>
          <GradientButton onClick={submit}>Prodaj</GradientButton>
        </div>
      </div>
    </div>
  );
}
