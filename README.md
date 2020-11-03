## Installing the Project

1.  Clone this project into a new directory by running
    `git clone https://github.com/mehrdadjg/covid-back.git covid-project`
    and then open the new directory by running `cd covid-project`.
2.  Create a new file called `.env` in the new directory.
    This files contains the following fields:

        HTTP_PORT = 4000
        MONGO_USER = <Your atlas mongo user name>
        MONGO_PW = <Your atlas mongo password>
        MONGO_DB_NAME = <Your atlas mongo cluster name>
        SMTP_HOST = <Your smtp host address>
        SMTP_PORT = <Your smtp host api>
        SMTP_USER = <Your email address>
        SMTP_PASS = <Your email password>
        JWT_ISSUER = <Your company name>

    Fill in the `<...>` with appropriate values.

3.  Create a new folder, called `app`, by running
    `mkdir app`.
    Move to the folder to just created and clone the [covid-front](https://github.com/mehrdadjg/covid-front) project, by running
    `cd app && git clone https://github.com/mehrdadjg/covid-front.git .`.
    Run `npm install` to install the dependencies of the front end project.
4.  Move back to the main directory by running
    `cd ..` and then run `npm install` to install the dependencies of the back end project.

Your project is ready now.

## Running the Project

Make sure you have created and edited the `.env` file, otherwise, the program will not run properly.

1.  Run `npm start`
    This command runs the following two commands concurrently.
    - `npm run start-server` that starts the back-end, and
    - `npm run start-front` that starts the front-end.
