import React from 'react';
import { capitalize, trim } from 'lodash';
import { Formik, Form, FormikValues, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import rpc from 'utils/rpc';
import { showNotification } from 'utils/notifications';
import GradientButton from 'components/Common/gradient-button';
import OutlineButton from 'components/Common/outline-button';
import PrimaryTitle from 'components/Common/primary-title';
import Field from './field';
import images from 'utils/images';

type Props = {
	setEmail: (email: string) => void;
	toLogin: () => void;
};

export default function Register({ setEmail, toLogin }: Props) {
	async function onSubmit(values: FormikValues, { setFieldError }: FormikHelpers<any>) {
		const data = {
			email: trim(values.email).toLowerCase(),
			password: trim(values.password),
			firstName: capitalize(trim(values.firstName)),
			lastName: capitalize(trim(values.lastName)),
		};

		try {
			await rpc.callServer('Auth-SignUp', data);
			await rpc.callClient('Auth-SuccessRegister', data.email);

			setEmail(data.email);
			toLogin();
		} catch (err: any) {
			setFieldError(err.field, err.message);
		}
	}

	return (
		<div className="auth-wrapper left">
			<div className="auth_login">
				<PrimaryTitle className="auth_title">Kreiranje naloga</PrimaryTitle>

				<div className="auth_login-container">
					<Formik
						initialValues={{
							email: '',
							password: '',
							passwordConfirm: '',
						}}
						validationSchema={Yup.object({
							email: Yup.string().email('Neispravan e-mail').required('Popunite polje'),
							password: Yup.string()
								.min(4, 'Minimalno 4 karaktera')
								.max(32, 'Maksimalno 32 karaktera')
								.required('Popunite polje'),
							passwordConfirm: Yup.string()
								.required('Nepodudaranje lozinke')
								.oneOf([Yup.ref('password'), null], 'Nepodudaranje lozinke'),
						})}
						onSubmit={onSubmit}
					>
						{(formik) => (
							<Form className="auth_form">
								<Field title="E-mail" type="email" name="email" placeholder="john.doe@ghetto-rp.com" />

								<Field title="Lozinka" type="password" name="password" placeholder="********" />
								<Field
									title="Potvrdi lozinku"
									type="password"
									name="passwordConfirm"
									placeholder="********"
								/>

								<div className="buttons">
									<OutlineButton className="auth_back-btn" onClick={toLogin}>
										Nazad
									</OutlineButton>

									<GradientButton type="submit" color="green">
										Registruj se
									</GradientButton>
								</div>
							</Form>
						)}
					</Formik>
				</div>
			</div>

			<div className="character character-right">
				<img src={images.getImage('characters/klosar3.png')} alt="Ghetto Rava" />
			</div>
		</div>
	);
}
