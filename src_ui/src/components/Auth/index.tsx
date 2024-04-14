import React, { Component, Fragment } from 'react';
import { CSSTransition } from 'react-transition-group';
import { RouteComponentProps } from 'react-router-dom';
import images from 'utils/images';
import sounds from 'utils/sounds';
import { FaDiscord, FaFacebook, FaInstagram } from 'react-icons/fa';

import Login from './login';
import Register from './register';
import Forgot from './forgot';
import Confirm from './confirm';

type Props = {} & RouteComponentProps<{}, {}, { email: string }>;

type State = {
	email: string;
	activeForm?: string;
};

export default class Auth extends Component<Props, State> {
	readonly state: State = {
		email: '',
		activeForm: 'login',
	};

	componentDidMount() {
		this.setState(() => this.props.location.state);

		sounds.play('ghetto', 0.3);
	}

	getForm() {
		const { activeForm, email } = this.state;

		switch (activeForm) {
			case 'register':
				return <Register setEmail={this.setEmail.bind(this)} toLogin={this.openForm.bind(this, 'login')} />;

			case 'forgot':
				return <Forgot toLogin={this.openForm.bind(this, 'login')} />;

			case 'confirm':
				return <Confirm email={email} />;

			default:
				return (
					<Login
						setEmail={this.setEmail.bind(this)}
						openForm={this.openForm}
						email={email || this.props.location.state?.email}
					/>
				);
		}
	}

	setEmail(email: string) {
		this.setState(() => ({ email }));
	}

	openForm = (name: string) => {
		this.setState(() => ({ activeForm: undefined }));

		setTimeout(() => this.setState(() => ({ activeForm: name })), 100);
	};

	render() {
		return (
			<div className="auth">
				<CSSTransition in={!!this.state.activeForm} timeout={300} classNames="alert">
					<>
						{this.state.activeForm ? this.getForm() : <Fragment />}

						<div className="logo">
							<img src={images.getImage('logo.png')} alt="GhettoRP logo" />

							<p>
								Dobrodošli na <span>Ghetto RolePlay</span>
							</p>

							<div className="social">
								<a href="https://discord.gg/ghetto-rp" target="_blank" rel="noreferrer">
									<FaDiscord />
								</a>
								<a href="https://www.facebook.com/GhettoRP" target="_blank" rel="noreferrer">
									<FaFacebook />
								</a>
								<a href="https://www.instagram.com/ghetto_rp/" target="_blank" rel="noreferrer">
									<FaInstagram />
								</a>
							</div>
						</div>

						<div className="footer">
							<p>
								&copy; 2024 <span>Ghetto RolePlay</span> | <span>www.ghetto-rp.com</span>
							</p>
						</div>
					</>
				</CSSTransition>
			</div>
		);
	}
}
