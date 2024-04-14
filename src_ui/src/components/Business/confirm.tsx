import React from 'react';
import PrimaryTitle from 'components/Common/primary-title';
import OutlineButton from 'components/Common/outline-button';
import GradientButton from 'components/Common/gradient-button';

type Props = {
  submit: () => void;
  cancel: () => void;
};

export default function BusinessConfirm({ submit, cancel }: Props) {
  return (
    <div className='business_confirm'>
      <div className='business_confirm-container'>
        <PrimaryTitle className='business_confirm-title'>
          Prodaja biznisa
        </PrimaryTitle>

        <p className='business_confirm-remark'>
          Da li zaista želite da <b>prodate biznis državi</b>?
        </p>

        <div className='business_confirm-buttons'>
          <OutlineButton onClick={cancel}>Zatvori</OutlineButton>
          <GradientButton onClick={submit}>Prodaj</GradientButton>
        </div>
      </div>
    </div>
  );
}
