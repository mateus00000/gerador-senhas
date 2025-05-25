# Gerador de Senhas Mobile

Um aplicativo mobile simples e elegante para gerar senhas seguras, desenvolvido com React Native, Expo, e o poder da IA com Gemini PRO através do CursorIDE.


## Funcionalidades Principais

- **Geração Avançada de Senhas:** Crie senhas aleatórias e robustas com opções customizáveis (em desenvolvimento).
- **Interface Moderna e Intuitiva:** Uma experiência de usuário limpa, minimalista e fácil de usar.
- **Cópia Rápida:** Copie senhas para a área de transferência com um único toque.
- **Histórico Seguro:** Mantenha um histórico das últimas senhas geradas localmente.
- **Gerenciamento de Contas (com Backend):**
    - Cadastro e Login de usuários.
    - Salvamento seguro de senhas nomeadas na nuvem (associadas à conta do usuário).
    - Exclusão de senhas salvas.
- **Segurança:** Senhas armazenadas no backend são criptografadas.

## Tecnologias Utilizadas

- **Frontend:**
    - React Native (v0.76.8)
    - Expo (SDK 52)
    - React Navigation (v6.1.9)
    - @expo/vector-icons (v14.0.2)
    - expo-clipboard (v7.0.1)
- **Desenvolvimento e IA:**
    - CursorIDE: Ambiente de desenvolvimento integrado com IA.
    - Gemini PRO: Modelo de linguagem avançado da Google para assistência de código e mais.
- **Backend:** (Consulte `backend/README.md` para detalhes)
    - Node.js, Express
    - better-sqlite3 para persistência de dados
    - JWT para autenticação
    - Criptografia AES-256-CBC para senhas

## Pré-requisitos

Para executar este projeto (frontend), você precisará ter instalado em sua máquina:

- [Node.js](https://nodejs.org/) (versão 18.x ou superior recomendada)
- [npm](https://www.npmjs.com/) (normalmente vem com o Node.js)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Um dispositivo físico com o aplicativo [Expo Go](https://expo.dev/client) instalado ou um emulador Android/iOS configurado.

## Instalação (Frontend)

Siga estas etapas para configurar o ambiente de desenvolvimento do frontend:

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/marcusmix/gerador-senha.git # Substitua pela URL do seu repositório
    cd gerador-senha # Navegue para a raiz do projeto clonado
    ```

2.  **Instale as dependências do frontend:**
    ```bash
    npm install
    ```
    (No diretório `backend`, navegue até ele e instale as dependências do backend também, conforme instruções no `backend/README.md`)

## Executando o Aplicativo (Frontend)

Para iniciar o aplicativo em modo de desenvolvimento:

```bash
npx expo start
```

Após executar o comando acima:

-   **Dispositivo Físico:** Escaneie o QR code exibido no terminal com o aplicativo Expo Go (Android) ou com a câmera (iOS).
-   **Emulador Android:** Com o emulador aberto, pressione `a` no terminal onde o Expo está rodando.
-   **Emulador iOS:** Com o emulador aberto, pressione `i` no terminal onde o Expo está rodando.

## Backend

Este projeto possui um backend associado para gerenciamento de usuários e senhas salvas. Certifique-se de que o backend esteja configurado e em execução para utilizar todas as funcionalidades do aplicativo. Consulte o arquivo `backend/README.md` para instruções detalhadas sobre a configuração e execução do servidor backend.

## Estrutura do Projeto (Simplificada)

```
gerador-de-senhas/
├── backend/                 # Código fonte do servidor backend (Node.js)
│   └── README.md            # Instruções para o backend
├── frontend/ (ou raiz)      # Código fonte do aplicativo mobile (React Native)
│   ├── assets/              # Imagens e recursos estáticos
│   ├── src/                 # Código fonte principal do app
│   │   ├── api/             # Configuração e chamadas de API
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── contexts/        # Contextos React (ex: AuthContext)
│   │   ├── screens/         # Telas do aplicativo
│   │   └── services/        # Serviços (ex: passwordGenerator)
│   ├── App.js               # Ponto de entrada do aplicativo
│   ├── app.json             # Configuração do Expo
│   └── package.json         # Dependências e scripts do frontend
└── README.md                # Este arquivo
```

## Autor

Desenvolvido por **MateusC000** com o auxílio de ferramentas de IA de ponta.

---

**Nota:** Este aplicativo e seu backend associado são destinados a fins educacionais e de portfólio. Implemente medidas de segurança adicionais e robustas se planeja usar uma aplicação similar em um ambiente de produção real. 
