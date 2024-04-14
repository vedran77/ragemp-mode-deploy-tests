import React, { Component } from 'react';
import rpc from 'utils/rpc';
import withRotation from 'components/Common/with-rotation';
import Hint from 'components/Common/hint';
import Page from './page';
import Body from './body';
import Face from './face';
import Appearance from './appearance';
import Clothes from './clothes';
import Information from './information';
import images from 'utils/images';

type State = {
	activePage: string;
	disableNext: boolean;
};

const pages: { [name: string]: string } = {
	information: 'Informacije',
	body: 'Telo',
	face: 'Faca',
	appearance: 'Izgled',
	clothes: 'Odeća',
};

class Character extends Component<{}, State> {
	readonly state: State = {
		activePage: 'information',
		disableNext: false,
	};

	openPage(name: string) {
		rpc.callClient('CharCreator-ChangeCamera', name);

		this.setState(() => ({ activePage: name }));
	}

	getPageComponent() {
		const { activePage } = this.state;

		switch (activePage) {
			case 'information':
				return (
					<Information
						setDisableNext={(value) =>
							this.setState({
								disableNext: value,
							})
						}
					/>
				);

			case 'body':
				return <Body />;

			case 'face':
				return <Face />;

			case 'clothes':
				return <Clothes />;

			default:
				return <Appearance />;
		}
	}

	switchPage(increase: boolean) {
		const items = Object.keys(pages);
		const pageIndex = items.indexOf(this.state.activePage);

		if (increase && pageIndex === items.length - 1) return this.create();

		this.openPage(increase ? items[pageIndex + 1] : items[pageIndex - 1]);
	}

	create() {
		rpc.callClient('CharCreator-Submit');
	}

	render() {
		const { activePage, disableNext } = this.state;

		return (
			<div className="character">
				<Page items={pages} current={activePage} open={this.openPage.bind(this)} />

				<div className="character_tabs">
					<div className="tab" onClick={() => this.setState({ activePage: 'information' })}>
						<img src={images.getLocalImage('dna.svg')} alt="DNA" />
						<p>Info</p>
					</div>
					<div className="tab" onClick={() => this.setState({ activePage: 'body' })}>
						<img src={images.getLocalImage('man.svg')} alt="Body" />
						<p>Telo</p>
					</div>
					<div className="tab" onClick={() => this.setState({ activePage: 'face' })}>
						<img src={images.getLocalImage('tshirt.svg')} alt="Face" />
						<p>Stil</p>
					</div>
					<div className="tab" onClick={() => this.setState({ activePage: 'clothes' })}>
						<img src={images.getLocalImage('clothes.svg')} alt="Clothes" />
						<p>Odeća</p>
					</div>
					<div className="tab" onClick={() => this.setState({ activePage: 'appearance' })}>
						<img src={images.getLocalImage('tattoo.svg')} alt="Appearance" />
						<p>Izgled</p>
					</div>
				</div>

				<div className="character_container">
					{this.getPageComponent()}

					<div className="character_btns">
						<button
							className="character_btn"
							onClick={this.switchPage.bind(this, true)}
							disabled={disableNext}
						>
							Dalje
						</button>

						{Object.keys(pages)[0] !== activePage && Object.keys(pages)[1] !== activePage && (
							<button
								className="character_btn"
								disabled={Object.keys(pages)[0] === activePage || Object.keys(pages)[1] === activePage}
								onClick={this.switchPage.bind(this, false)}
							>
								Nazad
							</button>
						)}
					</div>
				</div>

				<Hint className="character_hint" action="drag">
					Rotiranje karaktera
				</Hint>
			</div>
		);
	}
}

export default withRotation(Character);
