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

1. Instale o [NodeJS](https://nodejs.org/en/download/ "NodeJS Site";

2. Clone ou faça download do projeto;
```
git clone -b develop git@gitlab.com:cooksonmacedo/hostess-monitor-panel.git
```

3. Execute o Node na pasta do projeto
```
npm install
```

4. Para rodar a aplicação execute o camando:
```
npm run start
```

5. Para rodar a aplicação execute o camando:
```
npm run start
```



# Empacotamento

O **Hostess Panel** precisa ser empacotado em um binário executável, em produção, sempre será um ```.exe``` (Executável do Windows),
mas você pode também empacotar para outras plataformas.

**Para empacotar use a biblioteca ```zeit/pkg```**

[Repositório da biblioteca](https://github.com/zeit/pkg "zeit/pkg's repository")

1. Instalação da biblioteca, siga os passos na documentação na página do repositório ou utilize o Yarn;
2. Use o comando abaixo para compilar para as três palataformas (Windows, Linux e MacOS):
```
pkg . -t
```
**Para compilar para uma única plataforma**

```
pkg . -t node8-win-x64
```
Onde *node8-win-x64* significa que será gerado um binário para o Windows 64bit, para a versão 8 do NodeJS.

# Testes em Ambiente de Desenvolvimento

Você vai precisar de um *client http* para os testes locais, o *client* deve enviar uma mensagem ```JSON``` de acordo com o padrão abaixo.

**Modelo de mensagem JSON**

```javascript
message = {
    "name": "Francisco André",
    "destination": "Dirija-se ao Guichê 5",
    "photo": "http://192.168.0.70/media/photos/image-000111.jpg"
}
```
