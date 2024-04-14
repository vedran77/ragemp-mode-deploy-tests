import React, { Component } from 'react';
import { connect } from 'react-redux';
import rpc from 'utils/rpc';
import { showNotification } from 'utils/notifications';
import { setCall } from 'store/phone/actions';
import prettify from 'utils/prettify';
import List from './list';
import Controls from './controls';
import { Formik } from 'formik';
import { IoIosSend } from 'react-icons/io';

type Props = {} & typeof mapDispatchToProps;

type State = {
	phoneNumber: string;
	emergency: boolean;
};

class PhoneKeypad extends Component<Props, State> {
	readonly state: State = {
		phoneNumber: '',
		emergency: false,
	};

	addToNumber(key: string) {
		this.setState((state) => ({
			phoneNumber: state.phoneNumber.concat(key),
		}));
	}

	deleteFromNumber() {
		this.setState((state) => ({
			phoneNumber: state.phoneNumber.slice(0, -1),
		}));
	}

	async call() {
		const { phoneNumber } = this.state;

		if (!phoneNumber) return;

		if (phoneNumber === '911') {
			this.setState({ emergency: true });
			return;
		}

		try {
			if (phoneNumber === '11332') {
				await rpc.callClient('BlackMarket-NewLocation');
				return;
			}

			await rpc.callServer('Phone-Call', phoneNumber);

			this.props.setCall({
				phoneNumber,
				type: 'outgoing',
			});
		} catch (err: any) {
			showNotification('error', 'Pretplatnik je privremeno nedostupan');
		}
	}

	handleEmergencyCall(values: { service: string; description?: string }) {
		if (values.service === 'Police') {
			rpc.callServer('PoliceCalls-Create', values.description).then(() =>
				showNotification('info', 'Vaš poziv je poslat')
			);
			return;
		}

		rpc.callServer('EmsCalls-Create').then(() =>
			showNotification('info', 'Vaš poziv je poslat')
		);
	}

	render() {
		const { phoneNumber } = this.state;

		if (this.state.emergency) {
			return (
				<div className="emergency">
					<div className="emergency-title">Hitna Služba</div>

					<Formik
						initialValues={{
							service: 'Police',
							description: '',
						}}
						onSubmit={this.handleEmergencyCall.bind(this)}
					>
						{({ values, handleChange, handleSubmit }) => (
							<form onSubmit={handleSubmit}>
								<div className="emergency-form">
									<div className="emergency-form-group">
										<label htmlFor="service">Služba</label>
										<input
											name="service"
											value={values.service}
											onClick={(e) => {
												handleChange({
													target: {
														name: 'service',
														value:
															e.currentTarget
																.value ===
															'Police'
																? 'Fire'
																: 'Police',
													},
												});
											}}
											type="button"
										/>
									</div>

									{values?.service === 'Police' && (
										<div className="emergency-form-group">
											<label htmlFor="description">
												Opis
											</label>
											<textarea
												name="description"
												value={values.description}
												onChange={(e) => {
													if (
														e.target.value.length >
														200
													)
														return;

													handleChange({
														target: {
															name: 'description',
															value: e.target
																.value,
														},
													});
												}}
											/>
										</div>
									)}

									<button
										className="emergency-form-submit"
										type="submit"
									>
										<i className="icon">
											<IoIosSend />
										</i>
									</button>
								</div>
							</form>
						)}
					</Formik>
				</div>
			);
		}

		return (
			<div className="phone_keypad">
				<div className="phone_keypad-value">
					{prettify.phoneNumber(phoneNumber)}
				</div>

				<List addToNumber={this.addToNumber.bind(this)} />

				<Controls
					phoneNumber={phoneNumber}
					callNumber={this.call.bind(this)}
					deleteFromNumber={this.deleteFromNumber.bind(this)}
				/>
			</div>
		);
	}
}

const mapDispatchToProps = {
	setCall,
};

export default connect(null, mapDispatchToProps)(PhoneKeypad);
