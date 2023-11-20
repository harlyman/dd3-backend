# dd3-backend
This is the project for testing the Backend position in dacodes.
It is made in Node, with the NestJs framework 100% in typescript, it uses an external database in postgres

In order to test the application, it is necessary to have a working Postgres database and perform the following steps.

## Setting

The first thing we need to do is make a copy of the .env.local file and name them .env. This is to account for the necessary environment variables so that the app can work and connect to the DB.
Within the file we must modify the following variables with the values of our environment:

```bash
# DATABASE
DATABASE_HOST=127.0.0.1
DATABASE_NAME=dd3_backend
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_PORT=5432
```

It is also necessary that the database engine has the schema created within it so that the creation of the tables can be possible.

After configuring the variables to connect with the DB, we must execute the migration that will create the relationship tables and basic values within it, for this we execute

```bash 
npm run typeorm:mgr:run
```

Finally, to be able to launch the app, you only need to execute the following command:

```bash 
DEV
npm run start:dev
```

```bash 
Compile and run
npm run build
npm start
```

Once the application is running, within the root directory there is a postman file with the endpoints for each of the requirements.
### Admin user credentials
user: admin@dacodes.com

password: 123

Note: this version was created and executed with node 18.15.0, for this reason it is recommended to do the same.