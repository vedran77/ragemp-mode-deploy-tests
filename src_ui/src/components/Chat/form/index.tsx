import React from 'react';
import { IoIosSend } from 'react-icons/io';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { inputRef } from '../index';

type Props = {
  onSubmit: (text: string) => void;
  message?: string;
};

export default function ChatForm({ onSubmit, message }: Props) {
  return (
    <div className='chat_form'>
      <Formik
        initialValues={{ command: '', message: message || '' }}
        validationSchema={Yup.object({
          message: Yup.string().max(250),
        })}
        onSubmit={(values) => onSubmit(values.message)}
        enableReinitialize
      >
        <Form>
          <div className='chat_form-container'>
            <Field
              className='chat_form-input'
              name='message'
            >
              {({ field }: any) => (
                <input
                  type='text'
                  ref={inputRef}
                  {...field}
                />
              )}
            </Field>
          </div>
        </Form>
      </Formik>
    </div>
  );
}
