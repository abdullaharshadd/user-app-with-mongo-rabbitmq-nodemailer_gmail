## User-app

## Introduction
This project is an User API which is built using **NestJS**. It uses **MongoDB** as the database. This api has CRUD operations for the **'users'** collection. It also uses **RabbitMQ** for message sending and **nodemailer** for sending emails to users on successful sign-up

## Installation

```
npm install
```

## Running MongoDB

```
 docker run --name my-mongo -p 27017:27017 -d mongo
```

## Running RabbitMQ
```
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3
```

## Adding a counter for auto-increment id
```
db.counters.insertOne({ _id: "userid", seq: 0 });
```

## How to produce password for nodemailer
https://medium.com/@y.mehnati_49486/how-to-send-an-email-from-your-gmail-account-with-nodemailer-837bf09a7628

## Creating the `uploads` directory.
Before running the project, don't forget to create a directory named `uploads` at the root of the project.

### Running
```
npm run start:dev
```
