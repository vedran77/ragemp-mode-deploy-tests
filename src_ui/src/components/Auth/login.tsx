import React from 'react';
import rpc from 'utils/rpc';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import GradientButton from 'components/Common/gradient-button';
import PrimaryTitle from 'components/Common/primary-title';
import Field from './field';
import OutlineButton from 'components/Common/outline-button';
import images from 'utils/images';

type Props = {
	setEmail: (email: string) => void;
	openForm: (name: any) => void;
	email: string;
};

export default function Login({ setEmail, openForm, email = '' }: Props) {
	return (
		<div className="auth-wrapper right">
			<div className="character character-left">
				<img src={images.getImage('characters/rava.png')} alt="Ghetto Rava" />
			</div>

			<div className="auth_login">
				<PrimaryTitle>Login</PrimaryTitle>

				<div className="auth_login-container">
					<Formik
						initialValues={{ email, password: '' }}
						validationSchema={Yup.object({
							email: Yup.string().email('Neispravan e-mail').required('Popunite polje'),
							password: Yup.string().required('Popunite polje'),
						})}
						onSubmit={(values, actions) => {
							rpc.callServer('Auth-SignIn', Object.values(values))
								.then(() => rpc.callClient('Auth-SuccessLogin', values.email))
								.catch((err: any) => {
									if (err.confirm) {
										setEmail(values.email);
										return openForm('confirm');
									}

									actions.setFieldError(err.field, err.message);
								});
						}}
					>
						<Form className="auth_form">
							<Field title="E-mail" type="email" name="email" placeholder="john.doe@ghetto-rp.com" />
							<Field title="Lozinka" type="password" name="password" placeholder="********" />

							<a className="auth_login-forgot" onClick={() => openForm('forgot')}>
								Zaboravljena lozinka?
							</a>

							<div className="buttons">
								<OutlineButton
									type="button"
									className="auth_back-btn"
									onClick={() => openForm('register')}
								>
									Kreiraj nalog
								</OutlineButton>
								<GradientButton type="submit" color="green">
									Login
								</GradientButton>
							</div>
						</Form>
					</Formik>
				</div>
			</div>
		</div>
	);
}
