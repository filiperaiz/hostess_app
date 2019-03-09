# HMP - Hostess Monitor Panel

*Hostess Panel* é o software responsável pela chamada do acolhido, informando para onde deve ir (qual guichê e consultório) e exibindo a foto do acolhido na hora da chamada. 
O **Hostess Panel** é um *Servidor HTTP* rodando na porta **3030**.

# Tecnologias em uso no Hostess Panel

- Electron
- SpeechSynthesis da Web Speech API 
- Axios
- Node
- Vue Js
- Express Js
- Moment Js
- Javascript
- Html
- Css
- Bootstrap

# Instalação Ambiente de Desenvolvimento

1. Instale o [Node Js](https://nodejs.org/en/download/);


2. Instale o Gulp.Js;
```
npm install gulp-cli -g
```

3. Clone ou faça download do projeto;
```
git clone -b develop git@gitlab.com:cooksonmacedo/hostess-monitor-panel.git
```

4. Execute o Node na pasta do projeto
```
npm install
```

5. Para rodar a aplicação execute o camando:
```
npm run start
```

5. Para para fazer alterações no css, execulte o gulp
```
gulp
```
Obs: Faça suas altecações no arquivo main.scss


6. Para para gerar e compilar o app executável use o comando:
```
npm run app
```

# Abrir modal de configuração
1. Para abrir o modal, clique 10x no logo do Hostess que fica logo abaixo do texto de copyrights
- Você vai ver qual o ip e porta da maquina;
- Você poderá inserir uma url para para buscar informações do hospital; Url de exemplo:
```
https://my-json-server.typicode.com/filiperaiz/pwa_db/hospital/0
```

2. Ativar uma Api fake onde ela ficara emitindo um chamado a cada 30 segundos para testas a aplicação

