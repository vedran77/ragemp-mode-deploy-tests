import moment from 'moment';
import React from 'react';
import images from 'utils/images';

export const Date = ({ value }: { value: string }) => {
  return (
    <div className='hud_map_date'>
      <img
        className='two_fields_row_text_icon'
        src={images.getImage('hud_clock.svg')}
      />
      <div className='two_fields_row_text'>
        <p>{moment(value).format('DD.MM.YYYY')}</p>
        <h4>{moment(value).format('HH:mm')}</h4>
      </div>
    </div>
  );
};
