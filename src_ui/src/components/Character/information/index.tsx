import React, { Component } from 'react';
import rpc from 'utils/rpc';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Field from './field';
import Selector from '../selector';

type Props = {
	setDisableNext: (value: boolean) => void;
};

type State = {
	data: { firstName: string; lastName: string };
	gender: 'male' | 'female';
};

const genderList = {
	male: 'Muški',
	female: 'Ženski',
};

class CharacterInformation extends Component<Props, State> {
	readonly state: State = {
		data: { firstName: '', lastName: '' },
		gender: 'male',
	};

	componentDidMount(): void {
		this.props.setDisableNext(true);
		this.getSavedState();
	}

	componentWillUnmount(): void {
		rpc.callClient('Character-UpdateInformation', [this.state.data]);
	}

	async getSavedState() {
		const { gender, info } = await rpc.callClient('CharCreator-GetState');

		this.setState(() => ({
			gender,
			data: info,
		}));
	}

	async toggleGender(value: string) {
		await rpc.callClient('Character-ChangeGender', value);
		await this.getSavedState();
	}

	render() {
		return (
			<div className="character_item character_item--information">
				<Formik
					initialValues={{
						firstName: this.state.data.firstName,
						lastName: this.state.data.lastName,
					}}
					validationSchema={Yup.object({
						firstName: Yup.string()
							.matches(/^[a-z\s]+$/i, 'Ime mora sadržati samo slova(latinica)')
							.max(32, 'Maksimalno 32 karaktera')
							.required('Popunite polje'),
						lastName: Yup.string()
							.matches(/^[a-z\s]+$/i, 'Prezime mora sadržati samo slova(latinica)')
							.max(32, 'Maksimalno 32 karaktera')
							.required('Popunite polje'),
					})}
					enableReinitialize
					onSubmit={() => {}}
					validateOnBlur
					validateOnChange
				>
					{(formik) => (
						<Form
							onBlur={() => {
								formik.validateForm().then(() => {
									this.props.setDisableNext(Object.keys(formik.errors).length > 0);
								});
							}}
						>
							<Field
								title="Ime"
								type="text"
								name="firstName"
								placeholder="John"
								onChange={(e) => {
									formik.setFieldValue('firstName', e.target.value);
									this.setState({ data: { ...this.state.data, firstName: e.target.value } });
								}}
							/>
							<Field
								title="Prezime"
								type="text"
								name="lastName"
								placeholder="Doe"
								onChange={(e) => {
									formik.setFieldValue('lastName', e.target.value);
									this.setState({ data: { ...this.state.data, lastName: e.target.value } });
								}}
							/>
						</Form>
					)}
				</Formik>

				<Selector
					title="Pol"
					items={Object.keys(genderList)}
					value={this.state.gender}
					customValue={genderList[this.state.gender]}
					onChange={this.toggleGender.bind(this)}
				/>
			</div>
		);
	}
}

export default CharacterInformation;
