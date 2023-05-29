# NLP Hub
## ✍️ Description
A centralized gateway for a wide range of Natural Language Processing (NLP) services. It addresses the common challenge of having multiple sites or platforms for task-specific NLP models by consolidating and providing these services through a unified backend. Hence, users no longer need to navigate through various platforms or APIs, as everything is conveniently accessible through the gateway.


## 📜 Table of Contents

1. [Installation](#Installation)
2. [Project Structure](#Project-Structure)
3. [Technologies](#Technologies)
4. [Features](#Features)


## 🛠️ Installation
### Pre-requisites
Before you start, ensure you have [node](https://nodejs.org/en) and [nestjs](https://nestjs.com/) installed on your machine. 

**Environment**
* Nodejs (v18.15.0)
* Nestjs (v9.4.2)

To install `nodejs` on **Windows**:
1. Download the installer (.msi) from [here](https://nodejs.org/en/download)
2. Run the installer
3. Verify you have node installed by running:
    ```console
    node -v
    ```

To install `nodejs` on **Linux**:
1. Follow the installation script [here](https://github.com/nvm-sh/nvm)

3. Run this command to install the latest nodejs:
    ```console
    nvm install node
    ```
      * Elevate permission by running in sudo mode if encounter any permission error:
        ```console
        sudo nvm install node
        ```
   
3. Verify you have node installed by running:
    ```console
    node -v
    ```

### Getting Started
To run this project on local host, follow these steps:

1. Clone the repository: 
    ```console
    git clone https://github.com/Neo-Zenith/nlp-hub/main
    ```
2. Navigate to `server` subfolder: 
    ```console
    cd ./server
    ```
3. Install dependencies:
    ```console
    npm install
    ```
    
    * Running ```npm install`` will automatically install nestjs for you. 

4. Run the server on local host:
    ```console
    npm start
    ```
    
## 📁 Project Structure
```tree
.
├── client
├── server/
│   ├── src/
│   │   ├── common/            ## Common middlewares/interceptor
│   │   ├── queries/           ## Query module
│   │   ├── services/          ## Service module
│   │   ├── users/             ## User module
│   │   ├── app.module.ts      ## Bundler for all modules
│   │   └── main.ts            ## Server entry point
│   └── test                   ## Test configs
└── README.md
```

## 🔥Technologies
<p>
    <img src="https://img.shields.io/badge/Nestjs-e53059?style=for-the-badge&logo=Nestjs&logoColor=white" />
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" />
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
    <img src="https://img.shields.io/badge/Postman-FC8019?style=for-the-badge&logo=Postman&logoColor=white" />
    <img src="https://img.shields.io/badge/SwaggerUI-7aa225?style=for-the-badge&logo=swagger&logoColor=white" />
</p>
