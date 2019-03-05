const axios = require('axios');
const socket = io.connect('http://localhost:3030/');
const moment = require('moment');

moment.locale('pt-br')

const vm = new Vue({
    el: '#app',
    data: {
        pathUrl: 'https://my-json-server.typicode.com/filiperaiz/pwa_db/hospital/0',
        config: {
            headers: { 'Content-Type': 'application/json' }
        },
        hospital: {},
        user: {},
        lastCalledList: [],
        callUser: false,
        currentTime: null,
        currentDate: null,
        num: 0,
        copyright: '© 2019. Hostess. Todos os Direitos Reservados.',
    },

    computed: {
        lastCalls: function () {
            return this.lastCalledList.slice(0, 4);
        }      
    },

    methods: {
        showCallUser(itemCall) {
            this.user = {};
            this.user.photo = itemCall.photo;
            this.user.name = itemCall.name;
            this.user.destination = itemCall.destination;

            this.callUser = true;

            this.voiceCallUser(itemCall)
        },

        voiceCallUser(itemCall) {
            let treatment = itemCall.treatment || '';

            treatment = treatment.replace(/Sr\./g, '').replace(/Sra\./g, '');

            let voiceMessage = `${treatment} ${itemCall.name}, por favor, dirija-se ao ${itemCall.destination}.`;

            voiceMessage = voiceMessage.replace(/  +/g, ' ');
            
            const self = this

            if ('speechSynthesis' in window) {
                const speech = new SpeechSynthesisUtterance();
                speech.lang = 'pt-BR';
                speech.rate = 0.8;
                speech.volume = 0;
                speech.text = voiceMessage;
                
                speechSynthesis.speak(speech);

                speech.onend = function(event) {
                    console.log('Speech has finished after ' + event.elapsedTime + ' milliseconds.');
                    self.listLastCalls(itemCall)
                    self.hideCallUser(event.elapsedTime)
                }
              }
        },

        listLastCalls(item) {
            let addItem = true;

            item.time = moment().format('YYYYMMDD, h:mm:ss a')

            if (this.lastCalledList.length > 0) {
                for (let element of this.lastCalledList) {
                    if (element.name === item.name && element.destination === item.destination) {
                        addItem = false
                        break
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
                return moment(time, 'YYYYMMDD, hh:mm:ss a').fromNow()
            }
        },
    },

    created: function () {
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

        // test
        setInterval(() => {
            let n = this.num++

            // if (this.num === 5) {
            //     this.num = 0
            // }

            let params ={
                name: `Filipe Raiz ${n + 1}`,
                destination: `Guichê ${n + 1}`,
                photo: "https://placeimg.com/400/400/any"
            }

            axios.post(`http://192.168.0.13:3030/`, params, this.config).then(response => {
                console.log(this.num);
            })
        }, 2 * 10000);
    }
});

socket.on('emitMessage', message => {
    vm.showCallUser(message);
});


