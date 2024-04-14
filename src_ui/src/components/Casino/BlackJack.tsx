import React from 'react';
import images from 'utils/images';
import rpc from 'utils/rpc';

class BlackJack extends React.Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {
			me: 0,
			diller: 0,
			minBet: 0,
			currBet: 0,
			sec: '00',
			start: false,
		};
	}

	componentDidMount() {
		rpc.register('BlackJack-SetCards', (me, diller) => {
			this.setState({ me, diller });
		});
		rpc.register('BlackJack-SetBets', (currBet, minBet) => {
			this.setState({ minBet, currBet });
		});
		rpc.register('BlackJack-SetTime', (sec) => {
			this.setState({ sec: sec });
		});
		rpc.register('BlackJack-SetStart', (value) => this.setState({ start: value }));
	}

	render() {
		const { me, diller, currBet, minBet, start, sec } = this.state;
		return (
			<main className="blackjack" v-if="active">
				<div className="bgleft"></div>
				<div className="bgright"></div>
				<div className="infoiller">
					<img src={images.getImage('casino-blackjack/cardbg.png')} className="cardbg" />
					<div className="bj_info_me">
						<div className="name_me">U DZEPU</div>
						<div className="count_me">
							{me}
							<img src={images.getImage('casino-blackjack/card.png')} className="card" />
						</div>
					</div>
					<div
						style={{
							marginTop: '9.5vh',
						}}
						className="bj_info_me"
					>
						<div className="count_me">
							-
							<img src={images.getImage('casino-blackjack/card.png')} className="card" />
						</div>
					</div>
					<div
						style={{
							marginTop: '18vh',
						}}
						className="bj_info_me"
					>
						<div className="name_me">DILER</div>
						<div className="count_me">
							{diller}
							<img src={images.getImage('casino-blackjack/card.png')} className="card" />
						</div>
					</div>
				</div>
				<div className="infostavka">
					<div className="block_stavka">
						<div className="nameblock">MIMINALNO ULAGANJE</div>
						<div className="count">
							{minBet}
							<img src={images.getImage('casino-blackjack/chip1.png')} className="chip" />
						</div>
					</div>
					<div
						style={{
							marginTop: '10vh',
						}}
						className="block_stavka"
					>
						<div className="nameblock">TRENUTNO</div>
						<div className="count">
							{currBet}
							<img src={images.getImage('casino-blackjack/chip1.png')} className="chip" />
						</div>
					</div>
					<div
						style={{
							marginTop: '10vh',
							marginLeft: '11vh',
						}}
						className="block_stavka"
					>
						<div className="nameblock">POTENCIONALNI DOBITAK</div>
						<div className="count">
							{currBet * 2}
							<img src={images.getImage('casino-blackjack/chip1.png')} className="chip" />
						</div>
					</div>
				</div>
				{!start ? (
					<div className="help_block">
						<div className="help1">
							<div className="block1">
								<img src={images.getImage('casino-blackjack/Arrow.svg')} className="arrow" />
							</div>
							<div
								style={{
									marginLeft: '5vh',
								}}
								className="block1"
							>
								<img
									src={images.getImage('casino-blackjack/Arrow.svg')}
									style={{
										transform: 'rotate(180deg)',
									}}
									className="arrow"
								/>
							</div>
							<div className="namehe">RAZMER</div>
						</div>
						<div style={{ marginTop: '5vh' }} className="help1">
							<div
								style={{
									width: '6vh',
								}}
								className="block1"
							>
								<img src={images.getImage('casino-blackjack/arR.svg')} className="arrow2" />
							</div>
							<div
								style={{
									left: '8vh',
								}}
								className="namehe"
							>
								KLADI SE
							</div>
						</div>
						<div
							style={{
								marginTop: '10vh',
							}}
							className="help1"
						>
							<div className="block1">V</div>
							<div
								style={{
									left: '6vh',
								}}
								className="namehe"
							>
								KAMERA
							</div>
						</div>
					</div>
				) : (
					<div className="help_block">
						<div style={{ marginTop: '5vh' }} className="help1">
							<div
								style={{
									width: '6vh',
								}}
								className="block1"
							>
								<img src={images.getImage('casino-blackjack/space.svg')} className="arrow3" />
							</div>
							<div
								style={{
									left: '8vh',
								}}
								className="namehe"
							>
								Dovoljno
							</div>
						</div>
						<div
							style={{
								marginTop: '10vh',
							}}
							className="help1"
						>
							<div
								style={{
									width: '6vh',
								}}
								className="block1"
							>
								<img src={images.getImage('casino-blackjack/arR.svg')} className="arrow2" />
							</div>
							<div
								style={{
									left: '8vh',
								}}
								className="namehe"
							>
								VISE
							</div>
						</div>
					</div>
				)}
				{sec !== '00' && (
					<div className="alltimers">
						<div className="time1">00:{sec}</div>
						<div className="time2">00:{sec}</div>
					</div>
				)}
			</main>
		);
	}
}

export default BlackJack;
