const axios = require('axios');
const socket = io.connect('http://localhost:3030/');
const moment = require('moment');

moment.locale('pt-br');

const vm = new Vue({
	el: '#app',
	data: {
		pathUrl:
			'https://my-json-server.typicode.com/filiperaiz/pwa_db/hospital/0',
		config: { headers: { 'Content-Type': 'application/json' } },

		hospital: {},
		user: {},
		lastCalledList: [],
		callUser: false,
		currentTime: null,
		currentDate: null,
		copyright: '© 2019. Hostess. Todos os Direitos Reservados.',

		voiceLang: 'pt-BR',
		voicePitch: 1.2, // Entre [0 - 2], defaults to 1
		voiceRate: 0.8, // Entre [0.1 - 10], defaults to 1
		voiceVolume: 0.1, // Entre [0 - 1], defaults to 1

		fakeApi: [],
		fakeApiActive: false,
		fakeApiTime: 1 * 10000,
		fakeApiCount: 0,
		fakeApiCountLimit: 50,
		fakeSetInterval: null
	},

	computed: {
		lastCalls: function() {
			return this.lastCalledList.slice(0, 4);
		}
	},

	methods: {
		showCallUser(itemCall) {
			this.user = {};
			this.user = itemCall;

			this.callUser = true;

			this.voiceCallUser(itemCall);
		},

		async voiceCallUser(itemCall) {
			let treatment = itemCall.treatment || '';

			treatment = treatment.replace(/Sr\./g, '').replace(/Sra\./g, '');

			let voiceMessage = `${treatment} ${
				itemCall.name
			}, por favor, dirija-se ao ${itemCall.destination}.`;

			voiceMessage = voiceMessage.replace(/  +/g, ' ');

			this.listLastCalls(itemCall);

			const self = this;

			if ('speechSynthesis' in window) {
				const synth = window.speechSynthesis;
				const speech = new SpeechSynthesisUtterance();

				speech.lang = self.voiceLang;
				speech.pitch = self.voicePitch;
				speech.rate = self.voiceRate;
				speech.volume = self.voiceVolume;
				speech.text = voiceMessage;
				await synth.speak(speech);

				speech.onend = function(event) {
					console.log('Speech has finished');
					self.hideCallUser(event.elapsedTime / 4);
				};
			}
		},

		listLastCalls(item) {
			item.time = moment().format('YYYYMMDD, h:mm:ss a');

			let addItem = true;

			if (this.lastCalledList.length > 0) {
				for (let element of this.lastCalledList) {
					if (
						element.name === item.name &&
						element.destination === item.destination
					) {
						addItem = false;
						break;
					}
				}
			}

			if (addItem) {
				this.lastCalledList = [item].concat(this.lastCalledList);
			}
		},

		hideCallUser(time) {
			setTimeout(() => {
				this.callUser = false;
			}, time);
		},

		updateLastCall(time) {
			if (this.lastCalledList.length > 0) {
				return moment(time, 'YYYYMMDD, hh:mm:ss a').fromNow();
			}
		},

		getfakeApi() {
			axios
				.get(
					`https://randomuser.me/api/?results=${
						this.fakeApiCountLimit
					}&inc=name,picture&nat=BR`
				)
				.then(response => {
					this.fakeApi = response.data.results;
				});

			this.fakeSetInterval = setInterval(() => {
				if (this.fakeApiCount === this.fakeApiCountLimit) {
					this.fakeApiCount = 0;
				}

				let idx = this.fakeApiCount++;
				let name = `${this.fakeApi[idx].name.first} ${
					this.fakeApi[idx].name.last
				}`;
				let photo = `${this.fakeApi[idx].picture.large}`;

				let params = {
					name: name,
					destination: `Guichê ${idx + 1}`,
					photo: photo
				};

				axios.post(`http://192.168.0.13:3030/`, params, this.config);
			}, this.fakeApiTime);
		},

		clickFakeApi() {
			this.fakeApiActive = !this.fakeApiActive;

			let msg = this.fakeApiActive
				? 'Fake Api Ativada'
				: 'Fake Api Desativada';

			this.fakeApiActive
				? this.getfakeApi()
				: clearInterval(this.fakeSetInterval);

			alert(msg);
		}
	},

	created: function() {
		// get information hospital
		axios.get(this.pathUrl, this.config).then(response => {
			this.hospital.name = response.data.name;
			this.hospital.logo = response.data.logo;
		});

		// Updates the clock every second
		setInterval(() => {
			this.currentTime = moment().format('LTS');
		}, 1 * 1000);

		// update the current date
		this.currentDate = moment().format('LL');
	}
});

socket.on('emitMessage', message => {
	vm.showCallUser(message);
});
