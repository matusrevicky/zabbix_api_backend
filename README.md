# zabbix_rest_api_open_api_3

## Description
- this application allows users (with existing account in zabbix) to create maps of selected switches utilizing [zabbix api](https://www.zabbix.com/documentation/current/manual/api)
- consists of two parts:
    - backend: https://gitlab.science.upjs.sk/matusrevicky/zabbix_api_backend
    - frontend: https://gitlab.science.upjs.sk/stanka/zabbix_project_frontend
- for further information on how to use backend api view interactive open_api_documentation available after you run backend sucessfuly on port 3000.

 ![open api](/images/open_api.png)

## Prerequisites
- **running zabbix instance**
    - the easiest way to obtain one is using prepared docker images available at [https://github.com/zabbix/zabbix-docker](https://github.com/zabbix/zabbix-docker), where you can select desired version of zabbix.
     ![zabbix api](/images/zabbix_github.png)
    - zabbix should run successfuly after following commands
    ```
    git clone https://github.com/zabbix/zabbix-docker.git

    cd zabbix-docker

    sudo docker-compose -f ./docker-compose_v3_alpine_mysql_local.yaml  up -d
    ```
    - After a few minutes of pulling down the images and creating the containers, it is done.  You should see multiple zabbix related containers now when you run:
    ```
    docker ps -f "name=zabbix"
    ```
    - Also after typing the ip of the machine this is running on in the browser should view the following
    ![zabbix](/images/zabbix.png)
    - default login credentials are username:Admin, password:zabbix

- **Node js and nvm**
    - just follow instructions available at [https://nodejs.org/en/](https://nodejs.org/en/)

## Notes
- You need to have [Docker](https://docs.docker.com/get-docker/)  and [Docker Compose](https://docs.docker.com/compose/install/) already installed
- Tested on zabbix v4.4.10. 
- Also make sure you have a git client
- Tested using Node js v14.15.1

- It is important to notice, that from now on url has to contain https or http in front of adress
```
UrlAddress: https://zabbix.csirt.upjs.sk/
```

# Sample usage using predefined docker image:
- first you have to login (it is important to distinquish between http and https, default credentials)
![zabbix](/images/sample1.png)
- the only host is zabbix server and it's host gruop has id 4, so we can try to create map for him
![zabbix](/images/sample2.png)
- by running hosts with groupids, we can see that our server, has hostid=10004
![zabbix](/images/sample3.png)
- finaly we can create map for host with hostid=10004 (I know it is not a switch)
![zabbix](/images/sample4.png)
- Now we can see the address where our map is. So lets check it.
![zabbix](/images/sample5.png)
- We can see item named Zabbix server MAP, but it is empty because zabbix server has no ports like switches do.

- Map for real switch should look like this:
![zabbix](/images/sample6.png)

- At the end do not forget to log out!!!

All of the steps above can be done easily by using the following frontend: https://gitlab.science.upjs.sk/stanka/zabbix_project_frontend

## Get Started

Get started developing...

```shell
# install deps
npm install

# run in development mode
npm run dev

# run tests
npm run test
```

## How do I modify the example API and make it my own?

There are two key files that enable you to customize and describe your API:
1. `server/routes.js` - This references the implementation of all of your routes. Add as many routes as you like and point each route your express handler functions.
2. `server/common/api.yaml` - This file contains your [OpenAPI spec](https://swagger.io/specification/). Describe your API here. It's recommended that you to declare any and all validation logic in this YAML. `express-no-stress-typescript`  uses [express-openapi-validator](https://github.com/cdimascio/express-openapi-validator) to automatically handle all API validation based on what you've defined in the spec.

## Install Dependencies

Install all package dependencies (one time operation)

```shell
npm install
```

## Run It
#### Run in *development* mode:
Runs the application is development mode. Should not be used in production

```shell
npm run dev
```

or debug it

```shell
npm run dev:debug
```

#### Run in *production* mode:

Compiles the application and starts it in production production mode.

```shell
npm run compile
npm start
```

## Test It

Run the Mocha unit tests

```shell
npm test
```

or debug them

```shell
npm run test:debug
```

## Try It
* Open you're browser to [http://localhost:3000](http://localhost:3000)
* Invoke the `/examples` endpoint 
  ```shell
  curl http://localhost:3000/api/v1/examples
  ```


## Debug It

#### Debug the server:

```
npm run dev:debug
```

#### Debug Tests

```
npm run test:debug
```

#### Debug with VSCode

Add these [contents](https://github.com/cdimascio/generator-express-no-stress/blob/next/assets/.vscode/launch.json) to your `.vscode/launch.json` file
## Lint It

View prettier linter output

```
npm run lint
```

Fix all prettier linter errors

```
npm run lint
```

## Deploy It

Deploy to CloudFoundry

```shell
cf push zabbix_rest_api_open_api_3
```


   
