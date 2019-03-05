const axios = require('axios');
const socket = io.connect('http://localhost:3030/');
const moment = require('moment');

moment.locale('pt-br')

const vm = new Vue({
    el: '#app',
    data: {
        pathUrl:
            'https://my-json-server.typicode.com/filiperaiz/pwa_db/hospital/0',
        config: {
            headers: { 'Content-Type': 'application/json' }
        },
        hospital: {
            name: '',
            logo: ''
        },
        user: {
            name: '',
            photo: '',
            destination: ''
        },
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
        showCallUser(msg) {
            this.user.photo = msg.photo;
            this.user.name = msg.name;
            this.user.destination = msg.destination;

            this.callUser = true;
        },

        hideCallUser() {
            setTimeout(() => {
                this.user = {};
                this.callUser = false;
                console.log('hideCallUser');
            }, 2000);
        },

        voiceCallUser(msg) {
            let treatment = msg.treatment || '';

            treatment = treatment.replace(/Sr\./g, '').replace(/Sra\./g, '');

            let voiceMessage = `${treatment} ${msg.name}, por favor, dirija-se ao ${msg.destination}.`;

            voiceMessage = voiceMessage.replace(/  +/g, ' ');
            
            const self = this

            if ('speechSynthesis' in window) {
                const speech = new SpeechSynthesisUtterance();
                speech.lang = 'pt-BR';
                speech.rate = 1;
                speech.volume = 0;
                speech.text = voiceMessage;
                
                speechSynthesis.speak(speech);

                speech.onend = () => {
                    self.hideCallUser()
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

        updateCurrentTime() {
            this.currentTime = moment().format('LTS');
        },

        // updateLastCall(time) {
        //     if (this.lastCalledList.length > 0) {
        //         return moment(time, 'YYYYMMDD, hh:mm:ss a').fromNow()
        //     }
        // },

    },

    created: function () {
        axios.get(this.pathUrl, this.config).then(response => {
            this.hospital.name = response.data.name;
            this.hospital.logo = response.data.logo;
        });
        
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
          
        this.currentTime = moment().format('LTS');
        this.currentDate = moment().format('LL');
        setInterval(() => {
            this.updateCurrentTime()
        }, 1 * 1000);
    }
});

socket.on('emitMessage', message => {
    const data = message;

    vm.showCallUser(data);
    vm.voiceCallUser(data);
    vm.listLastCalls(data);
});


