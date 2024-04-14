import React from 'react';
import { RouteComponentProps } from 'react-router';
import rpc from 'utils/rpc';
import images from 'utils/images';
import { Circle } from 'rc-progress';

type Character = {
	id: string;
	level: number;
	gender: 'male' | 'female';
	experiences: [number, number];
	firstName: string;
	lastName: string;
	money: { cash: number; bank: number };
	playedTime: number;
	arrest?: boolean;
	ban: {
		reason: string;
	};
};

type Props = {} & RouteComponentProps;

export default function SelectCharacter(props: Props) {
	const [error, setError] = React.useState<string | null>(null);
	const [selected, setSelected] = React.useState<string | null>(null);

	const characters: Character[] = props.location?.state?.characters || [
		{
			id: '212',
			gender: 'male',
			level: 2,
			experiences: [100, 600],
			firstName: 'Test',
			lastName: 'Test',
			money: { cash: 10230120120, bank: 310013 },
			playedTime: 100,
			ban: { reason: 'Nema banova' },
		},
	];
	const char = selected && characters.find((c) => c.id === selected);

	return (
		<div className={`select-character ${selected && 'no-bg'}`}>
			{error && <div className="error">GREŠKA: {error}</div>}
			{!selected && (
				<div className="boxes">
					{new Array(3)
						.fill(null)
						.map((item, index, arr) => {
							if (index === 1 && !characters[index + 1]) {
								return null;
							}

							if (index === 2 && !arr[index - 1]) {
								return characters[index - 1];
							}

							return characters[index];
						})
						.map((char, index) => {
							if (index === 1 && !char) {
								return (
									<div
										className="box donate"
										key={index}
										style={{
											backgroundImage: `url('${images.getImage(
												'donate-char.png',
												'characters'
											)}'), linear-gradient(180deg, #a6ff00 0%, #0e1207 100%)`,
										}}
									>
										<h3>
											Slot na
											<br />
											donaciju
										</h3>

										<p>
											Pocnite vas zivot
											<br />
											iz pocetka
										</p>

										<button>
											<span>Kupite slot</span>
										</button>
										<span className={`badge ${char ? 'red' : ''}`}>
											Slot je {char ? 'zauzet' : 'slobodan'}
										</span>
									</div>
								);
							}

							return (
								<div
									className="box"
									key={index}
									style={{
										backgroundImage: `url('${images.getImage(
											'char.png',
											'characters'
										)}'),linear-gradient(180deg, #0e161d 0%, #191e11 100%)`,
									}}
								>
									{char?.firstName && char?.lastName && (
										<h3>
											{char.firstName} <span>{char.lastName}</span>
										</h3>
									)}

									{char?.experiences?.length === 2 && (
										<div className="level_circle">
											<Circle
												className="level_circle-progress"
												strokeWidth={10}
												trailWidth={10}
												trailColor="rgba(166, 255, 0, 0.2)"
												strokeColor="#A6FF00"
												strokeLinecap="round"
												percent={(char?.experiences[0] / char?.experiences[1]) * 100}
											/>

											<div className="content">
												<span>Level</span>
												<span>{char.level}</span>
											</div>
										</div>
									)}

									{char ? (
										<button
											onClick={() => {
												if (!char?.id) return;

												setSelected(char?.id);
												rpc.callClient('Auth-CharacterSelected', [char?.id, true]).catch(
													(err: any) => {
														setError(err.message);
													}
												);
											}}
										>
											Odaberi
										</button>
									) : (
										<button
											onClick={() =>
												rpc.callClient('Auth-CharacterSelected', ['new']).catch((err: any) => {
													setError(err.message);
												})
											}
										>
											Kreiraj
										</button>
									)}
									<span className={`badge ${char ? 'red' : ''}`}>
										Slot je {char ? 'zauzet' : 'slobodan'}
									</span>

									<span className="badge-cnum">KARAKTER SLOT #{index + 1}</span>
								</div>
							);
						})}
				</div>
			)}

			{selected && char && (
				<div className="box-info">
					<div className="head">
						{char?.firstName && char?.lastName && (
							<h3>
								{char.firstName} <span>{char.lastName}</span>
							</h3>
						)}

						<div className="level_circle">
							<Circle
								className="level_circle-progress"
								strokeWidth={10}
								trailWidth={10}
								trailColor="rgba(166, 255, 0, 0.2)"
								strokeColor="#A6FF00"
								strokeLinecap="round"
								percent={(char?.experiences[0] / char?.experiences[1]) * 100}
							/>

							<div className="content">
								<span>Level</span>
								<span>{char.level}</span>
							</div>
						</div>
					</div>

					<div className="body">
						<div className="data">
							<span>Pol</span>
							<span>{char.gender === 'male' ? 'Muško' : 'Žensko'}</span>
						</div>

						<div className="data cash">
							<span>Novac</span>
							<span>{char.money.cash.toLocaleString()} $</span>
						</div>

						<div className="data bankm">
							<span>Banka</span>
							<span>{char.money.bank.toLocaleString()} $</span>
						</div>

						<div className="data ">
							<span>Online</span>
							<span>
								{Math.floor(char.playedTime / 60)}h i {char.playedTime % 60}m
							</span>
						</div>
					</div>

					<div className="footer">
						{char.ban.reason && <div className="ban">Banovani ste</div>}
						{char.ban.reason && (
							<div className="alert">
								Razlog: <span>{char.ban.reason}</span>
							</div>
						)}
						<button onClick={() => setSelected(null)}>Nazad</button>
					</div>
				</div>
			)}

			{selected && (
				<button
					onClick={() =>
						rpc.callClient('Auth-CharacterSelected', [selected]).catch((err: any) => {
							setError(err.message);
						})
					}
				>
					Započni igru
				</button>
			)}
		</div>
	);
}
