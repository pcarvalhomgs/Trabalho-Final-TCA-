# Tokenização de Ativos do Mundo Real em DeFi: Um Estudo de Caso de Propriedade Imobiliária e o Desenvolvimento de um DApp de Simulação com ERC-1155

---

## 📄 Visão Geral do Projeto

Este projeto explora a **tokenização de Ativos do Mundo Real (RWA - Real World Assets)** no ecossistema das **Finanças Descentralizadas (DeFi)**, com foco específico em **propriedades imobiliárias**. Desenvolvemos um **DApp (Decentralized Application) de simulação** para demonstrar o processo de tokenização de um imóvel e a negociação de seus tokens fracionados, utilizando o padrão **ERC-1155** para otimizar a representação de diferentes tipos de direitos sobre o ativo.

O objetivo é ilustrar os potenciais benefícios da tokenização (como aumento da liquidez e democratização do acesso a investimentos imobiliários) e os desafios inerentes à integração de ativos do mundo físico com a blockchain.

---

## 🛠️ Tecnologias Utilizadas

* **Blockchain:** Ethereum (para simulação em rede de teste)
* **Smart Contracts:** Solidity
* **Padrão de Token:** ERC-1155
* **Desenvolvimento Frontend:** [HTML / CSS / JS]
* **Interação Web3:** [Ethers.js]
* **Ambiente de Desenvolvimento de Contratos:** [Remix IDE]

---

## 🚀 Como Rodar o DApp Localmente

Para interagir com a interface do DApp de simulação diretamente no seu computador, siga os passos abaixo. É simples e rápido!

### Pré-Requisitos

Antes de começar, certifique-se de ter o **Python 3** instalado na sua máquina. Você pode verificar isso abrindo o terminal e digitando `python3 --version`. Se precisar instalar, visite o [site oficial do Python](https://www.python.org/downloads/).

### 🖥️ Passos para Execução

1.  **Navegue até a Pasta do Projeto:**
    Abra seu **Terminal** (macOS/Linux) ou **Prompt de Comando (CMD)** (Windows). Em seguida, use o comando `cd` para ir até a pasta onde você salvou os arquivos do frontend do seu DApp.

    ```bash
    # Exemplo no Windows
    cd C:\Users\SeuUsuario\Documentos\MeuProjetoDAppFrontend

    # Exemplo no macOS/Linux
    cd ~/Documentos/MeuProjetoDAppFrontend
    ```
    *Certifique-se de substituir o caminho pelo local real da sua pasta!*

2.  **Inicie o Servidor Web Local:**
    Com o terminal já na pasta correta do projeto, execute o seguinte comando:

    ```bash
    python3 -m http.server
    ```
    Este comando vai ligar um pequeno servidor web HTTP no seu computador. No terminal, você verá uma mensagem indicando que o servidor está funcionando, geralmente na porta `8000`.

    ```
    Serving HTTP on 0.0.0.0 port 8000 ([http://0.0.0.0:8000/](http://0.0.0.0:8000/)) ...
    ```

3.  **Acesse o DApp no Navegador:**
    Agora é só abrir seu navegador preferido (Chrome, Firefox, Edge, etc.) e digitar este endereço na barra de navegação:

    ```
    http://localhost:8000
    ```
    Pronto! Seu DApp de simulação será carregado e você poderá começar a interagir com ele.
    Basta ter acesso a internet para poder realizar transações pela interface e acessar o link do contrato para visualizar as transações.

---
