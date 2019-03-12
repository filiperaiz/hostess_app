const axios = require('axios');
const socket = io.connect('http://localhost:3030/');
const moment = require('moment');

const ip = require('ip');
const config = {};
config.ip = ip.address();
config.port = 3030;

moment.locale('pt-br');

const vm = new Vue({
	el: '#app',
	data: {
		pathUrl: 'https://my-json-server.typicode.com/filiperaiz/pwa_db/hospital/0',
		config: { headers: { 'Content-Type': 'application/json' } },
		hospital: {},
		user: {},
		lastCalledList: [],
		callUser: false,
		currentTime: null,
		currentDate: null,
		copyright: '© 2019. Hostess. Todos os Direitos Reservados.',
		logoHostess: 'assets/img/logo-horizonatal-white.png',
		openModal: 0,
		showModal: false,
		endpoint: '',
		urlIp: `http://${config.ip}:${config.port}/`,

		voicePitch: 1.2, // Entre [0 - 2], defaults to 1
		voiceRate: 0.8, // Entre [0.1 - 10], defaults to 1
		voiceVolume: 10, // Entre [0 - 10], defaults to 10

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

		voiceCallUser(itemCall) {
			let treatment = itemCall.treatment || '';

			treatment = treatment.replace(/Sr\./g, '').replace(/Sra\./g, '');

			let voiceMessage = `${treatment} ${itemCall.name}, por favor, dirija-se ao ${itemCall.destination}.`;

			voiceMessage = voiceMessage.replace(/  +/g, ' ');

			this.listLastCalls(itemCall);

			const self = this;

			if ('speechSynthesis' in window) {
				const msg = new SpeechSynthesisUtterance();
				const voices = window.speechSynthesis.getVoices();

				msg.voice = voices[0];
				msg.rate = self.voiceRate;
				msg.pitch = self.voicePitch;
				msg.volume = self.voiceVolume / 10;
				msg.text = voiceMessage;

				msg.onend = function(event) {
					console.log('Speech has finished');
					self.hideCallUser(event.elapsedTime / 4);
				};

				speechSynthesis.speak(msg);
			}
		},

		listLastCalls(item) {
			item.time = moment().format('YYYYMMDD, h:mm:ss a');

			let addItem = true;

			if (this.lastCalledList.length > 0) {
				for (let element of this.lastCalledList) {
					if (element.name === item.name && element.destination === item.destination) {
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

		updateTimeAgo(time) {
			if (this.lastCalledList.length > 0) {
				return moment(time, 'YYYYMMDD, hh:mm:ss a').fromNow();
			}
		},

		countSettings() {
			this.openModal++;

			if (this.openModal == 5) {
				this.showModal = true;
				this.openModal = 0;

				if (localStorage.getItem('endpoint')) {
					this.endpoint = localStorage.getItem('endpoint');
				}
			}
		},

		getSettings() {
			if (!localStorage.getItem('endpoint') && this.endpoint !== '') {
				this.getInfoClient(this.endpoint);
			}

			this.fakeApiActive ? this.getFakeApi() : this.stopFakeApi();

			this.showModal = false;
		},

		getInfoClient(endpoint) {
			axios
				.get(endpoint, this.config)
				.then(response => {
					this.hospital.name = response.data.name;
					this.hospital.logo = response.data.logo;

					localStorage.setItem('endpoint', this.endpoint);
					localStorage.setItem('infoClient', JSON.stringify(response.data));
				})
				.catch(error => {
					this.endpoint = null;
					alert('Url invalida');
				});
		},

		getInfoClientStorage() {
			let infoClient = JSON.parse(localStorage.getItem('infoClient'));
			this.hospital.name = infoClient.name;
			this.hospital.logo = infoClient.logo;
		},

		getFakeApi() {
			axios.get(`https://randomuser.me/api/?results=${this.fakeApiCountLimit}&inc=name,picture&nat=BR`).then(response => {
				this.fakeApi = response.data.results;
			});

			this.fakeSetInterval = setInterval(() => {
				if (this.fakeApiCount === this.fakeApiCountLimit) {
					this.fakeApiCount = 0;
				}

				let idx = this.fakeApiCount++;
				let name = `${this.fakeApi[idx].name.first} ${this.fakeApi[idx].name.last}`;
				let photo = `${this.fakeApi[idx].picture.large}`;

				let params = {
					name: name,
					destination: `Guichê ${idx + 1}`,
					photo: photo
				};

				axios.post(this.urlIp, params, this.config);
			}, this.fakeApiTime);
		},

		stopFakeApi() {
			synth.cancel();
			clearInterval(this.fakeSetInterval);
			this.hideCallUser(0);
			this.lastCalledList = [];
		},

		getDateHour() {
			setInterval(() => {
				this.currentTime = moment().format('LTS');
			}, 1 * 1000);

			this.currentDate = moment().format('LL');
		}
	},

	created: function() {
		this.showModal = false;
		this.getDateHour();

		if (localStorage.getItem('endpoint')) {
			this.getInfoClientStorage();
		}
	}
});

socket.on('emitMessage', message => {
	vm.showCallUser(message);
});
