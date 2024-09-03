# Collaborative Image Editor Microservice

## Overview

This project is a microservices-based application that enables real-time collaborative image editing. Multiple users can edit images simultaneously through WebSockets (socket.io). The project utilizes Docker and Docker Compose to manage the various services, including RabbitMQ for message brokering, Redis for caching, PostgreSQL and MongoDB for database management, and Nginx as a reverse proxy. The application also incorporates Nodemailer for email notifications and is monitored using Prometheus and Grafana.

## Table of Contents

-   [Prerequisites](#prerequisites)
-   [Getting Started](#getting-started)
-   [Running the Application](#running-the-application)
-   [Service Details](#service-details)
-   [Service Routes](#service-routes)
-   [Configuration](#configuration)
-   [Security Considerations](#security-considerations)
-   [Future Improvements](#future-improvements)
-   [Things That Don’t Work](#things-that-dont-work)

## Prerequisites

Ensure you have the following installed:

-   [Docker](https://docs.docker.com/get-docker/)

## Getting Started

Clone the repository:

```console
git clone https://github.com/sujoy-kr/photo-editor-backend.git
cd photo-editor-backend
```

## Running the Application

1. **Start Docker Compose**:

    ```console
    docker compose up -d
    ```

2. **Modify the environment variables in the `compose.yaml` file**:

    - **NODEMAILER_EMAIL**: Replace with your actual email address.
    - **NODEMAILER_PASS**: Replace with the password or app-specific password for your email account.

3. **Access the services**:
    - **Nginx**: `http://localhost`
    - **User Service**: `http://localhost:3000`
    - **Image Service**: `http://localhost:4000`
    - **Notification Service**: `http://localhost:6000`
    - **Access Service**: `http://localhost:5000`
    - **API Gateway**: `http://localhost:2000`
    - **pgAdmin**: `http://localhost:5050`
    - **Grafana**: `http://localhost:8000`
    - **Prometheus**: `http://localhost:9090`
    - **Mongo-express**: `http://localhost:8081`

## Service Details

### User Service

-   **Tech Stack**: Node.js, Express, Prisma (v5.20.0-dev.2), RabbitMQ (via `amqplib`), JWT (via `jsonwebtoken`), `bcryptjs`, `body-parser`, `cors`, `dotenv`, `express-rate-limit`, `helmet`, `joi`, `morgan`.

-   **Port**: 3000
-   **Database**: PostgreSQL
-   **Environment Variables**:
    -   `PORT=3000`
    -   `DATABASE_URL=postgresql://postgres:postgres@postgres:5432/editingUser?schema=public?connect_timeout=300`
    -   `SALT_ROUND=15`
    -   `JWT_SECRET=strongsecret`
    -   `AMQP_SERVER=amqp://amqpuser:amqppassword@rabbitmq:5672`

### Image Service

-   **Tech Stack**: Node.js, Express, RabbitMQ (via `amqplib`), MongoDB (via `mongoose`), `jsonwebtoken`, `multer`, `sharp`, `socket.io`, `prom-client`, `body-parser`, `cors`, `dotenv`, `helmet`, `morgan`.
-   **Port**: 4000
-   **Database**: MongoDB
-   **Environment Variables**:
    -   `PORT=4000`
    -   `HOST_URL=http://localhost/api/access`
    -   `DATABASE_URL=mongodb://image-service-db:27017/editing-image`
    -   `JWT_SECRET=sujoykr`
    -   `AMQP_SERVER=amqp://amqpuser:amqppassword@rabbitmq:5672`

### Notification Service

-   **Tech Stack**: Node.js, Express, RabbitMQ (via `amqplib`), Redis (via `ioredis` and `redis`), `nodemailer`, `body-parser`, `cors`, `dotenv`, `helmet`, `morgan`.

-   **Port**: 6000
-   **Environment Variables**:
    -   `PORT=6000`
    -   `AMQP_SERVER=amqp://amqpuser:amqppassword@rabbitmq:5672`
    -   `NODEMAILER_EMAIL=demo@email.com`
    -   `NODEMAILER_PASS=lkjd glkj lkjb ttwl`
    -   `REDIS_HOST=redis`
    -   `REDIS_PORT=6379`

### Access Service

-   **Tech Stack**: Node.js, Express, RabbitMQ (via `amqplib`), `jsonwebtoken`, `body-parser`, `cors`, `dotenv`, `helmet`, `morgan`.
-   **Port**: 5000
-   **Environment Variables**:
    -   `PORT=5000`
    -   `JWT_SECRET=sujoykr`
    -   `AMQP_SERVER=amqp://amqpuser:amqppassword@rabbitmq:5672`

### API Gateway

-   **Tech Stack**: Node.js, Express, `http-proxy-middleware`, `cors`, `dotenv`, `helmet`.
-   **Port**: 2000
-   **Environment Variables**:
    -   `PORT=2000`
    -   `USER_SERVICE_URL=http://user-service:3000/`
    -   `IMAGE_SERVICE_URL=http://image-service:4000/`
    -   `ACCESS_SERVICE_URL=http://access-service:5000/`

### PostgreSQL

-   **Port**: 5432
-   **Image**: `postgres:12`
-   **Environment Variables**:
    -   `POSTGRES_USER=postgres`
    -   `POSTGRES_PASSWORD=postgres`

### pgAdmin

-   **Port**: 5050
-   **Image**: `dpage/pgadmin4:6`
-   **Environment Variables**:
    -   `PGADMIN_DEFAULT_EMAIL=admin@email.com`
    -   `PGADMIN_DEFAULT_PASSWORD=admin`

### MongoDB

-   **Port**: 27017
-   **Image**: `mongo:6`

### mongo-express

-   **Port**: 8081
-   **Image**: `mongo-express`
-   **Environment Variables**:
    -   `ME_CONFIG_MONGODB_SERVER=mongo`
    -   `ME_CONFIG_MONGODB_PORT=27017`

### RabbitMQ

-   **Ports**: 5672, 15672
-   **Image**: `rabbitmq:3-management`
-   **Environment Variables**:
    -   `RABBITMQ_DEFAULT_USER=amqpuser`
    -   `RABBITMQ_DEFAULT_PASS=amqppassword`

### Redis

-   **Port**: 6379
-   **Image**: `redis:latest`

### Nginx

-   **Port**: 80
-   **Build Context**: `./nginx`

### Prometheus

-   **Port**: 9090
-   **Build Context**: `./prometheus`

### Grafana

-   **Port**: 8000
-   **Image**: `grafana/grafana`
-   **Environment Variables**:
    -   `GF_SECURITY_ADMIN_USER=grafanauser`
    -   `GF_SECURITY_ADMIN_PASSWORD=grafanapass`
    -   `GF_USERS_ALLOW_SIGN_UP=false`

## Service Routes

### User Service

-   **POST /api/user/register**

    -   **Description**: Register a new user.
    -   **Request Body**:
        ```json
        {
            "name": "demo name",
            "password": "securepassword",
            "email": "demo@gmail.com"
        }
        ```
    -   **Response**:
        ```json
        {
            "message": "Registration Successful."
        }
        ```

-   **POST /api/user/login**

    -   **Description**: User Login.
    -   **Request Body**:
        ```json
        {
            "email": "demo@gmail.com",
            "password": "securepassword"
        }
        ```
    -   **Response**:
        ```json
        {
            "token": "eyJhbGciOiJIUzI1NiIsInR..." // jwt token
        }
        ```

-   **GET /api/user/profile**

    -   **Description**: User profile. Finds out the user depending on the JWT token.
    -   **Headers**:
        -   **Authorization**: `Bearer <your_jwt_token>`
    -   **Response**:
        ```json
        {
            "name": "Sujoy Karmakar",
            "email": "demo@gmail.com"
        }
        ```

-   **DELETE /api/user/delete**
    -   **Description**: Deletes an user based on jwt.
    -   **Headers**:
        -   **Authorization**: `Bearer <your_jwt_token>`
    -   **Response**:
        ```json
        {
            "message": "User Deleted Successfully"
        }
        ```

### Image Service

-   **POST /api/image/**

    -   **Description**: Upload a new image.
    -   **Headers**:
        -   **Authorization**: `Bearer <your_jwt_token>`
    -   **Request Body**:
        ```json
        {
            "image": "File"
        }
        ```
    -   **Response**:
        ```json
        {
            "image": "uploads/1725327082166.png",
            "metadata": {
                "format": "png",
                "size": 782415,
                "width": 1060,
                "height": 716,
                "space": "srgb"
                // rest of the metadata
            },
            "createdAt": "2024-09-03T01:31:22.186Z",
            "updatedAt": "2024-09-03T01:31:22.186Z",
            "id": "66d666eaeb64bab19feeef1b"
        }
        ```

-   **GET /api/image/**

    -   **Description**: Gets all the images based on JWT.
    -   **Headers**:
        -   **Authorization**: `Bearer <your_jwt_token>`
    -   **Response**:

        ```json
        [
            {
                "id": "66d59a9af1d9ca8e7c0ba11c",
                "image": "uploads/1725274778648.png",
                "metadata": {
                    "format": "png",
                    "size": 782415,
                    "width": 1060
                    // rest of the metadata
                },
                "createdAt": "2024-09-03T01:31:22.186Z",
                "updatedAt": "2024-09-03T01:31:22.186Z"
            },
            {
                "id": "66d59a9bf1d9ca8e7c0ba11e"
                /* same as above */
            }
            // Rest of the images...
        ]
        ```

-   **POST /api/image/{id}/edit**

    -   **Description**: Edit an image. This action is allowed only for the image owner.
    -   **Headers**:
        -   **Authorization**: `Bearer <your_jwt_token>`
    -   **Request Body**:
        ```json
        {
            "transformations": {
                "resize": {
                    "width": "number",
                    "height": "number"
                },
                "crop": {
                    "width": "number",
                    "height": "number",
                    "x": "number",
                    "y": "number"
                },
                "rotate": "number",
                "flip": "boolean",
                "mirror": "boolean",
                "format": "string",
                "filters": {
                    "grayscale": "boolean",
                    "sepia": "boolean"
                }
            }
        }
        ```
    -   **Response**:
        -   **Content**: A downloadable file of the image.

-   **GET /api/image/{id}**

    -   **Description**: Retrieve a single image by its ID. This route returns the image file.
    -   **Headers**:
        -   **Authorization**: `Bearer <your_jwt_token>`
    -   **Response**:
        -   **Content**: A downloadable file of the edited image.

-   **DELETE /api/image/{id}**

    -   **Description**: Delete an image. This action is allowed only for the image owner.
    -   **Headers**:
        -   **Authorization**: `Bearer <your_jwt_token>`
    -   **Response**:
        ```json
        {
            "message": "Successfully Deleted"
        }
        ```

-   **POST /api/image/{id}/generate-access-link**

    -   **Description**: Generate an access link for live editing of the image. Only the owner of the image can generate this link, and it requires JWT authorization.
    -   **Headers**:
        -   **Authorization**: `Bearer <your_jwt_token>`
    -   **Response**:
        ```json
        {
            "accessLink": "http://localhost/api/access/eyJhbGciOiJIUzI1NiIsInR5c... "
        }
        ```

-   **WebSocket Route**: `ws://localhost:4000`

    **Message to `transformImage`**:

    ```json
    {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI... // rest of the JWT token",
        "imageId": "66d59786e08776861ef50d72",
        "transformations": {
            "resize": {
                "width": "number",
                "height": "number"
            }
            // rest of the transformations (Same as /api/image/{id}/edit route)
        }
    }
    ```

    **Description**: This route allows users to apply transformations to an image. Users must be authenticated with a JWT token and have permission to edit the image. Upon sending a `transformImage` message, users join a room named with the image ID (e.g., `66d59786e08776861ef50d72`). All users in this room receive real-time updates about changes to the image.

    -   **Room**: Users join a room named with the image ID (e.g., `66d59786e08776861ef50d72`) to receive updates from others editing the same image.

    -   **Events**:
        -   **{imageID}**: Broadcasts updates to all users in the room with the image ID when changes are made.
        -   **'error'**: Sends any errors encountered during the editing process.

    **Error Handling**: Errors during the transformation process are sent to the user via an `error` event.

### Access Service

-   **POST /api/access/{access_token}**

    -   **Description**: Request access to edit an image using the provided JWT token. The request requires JWT authentication. The server verifies the user's access and responds based on whether access is granted, already granted, or denied. Notifications are sent accordingly, and the user is added to the image's access list if approved.
    -   **Headers**:
        -   **Authorization**: `Bearer <your_jwt_token>`
    -   **Response**:
        ```json
        {
            "message": "Your access request has been submitted for processing."
        }
        ```
    -   **Behavior**:
        -   Verifies the user’s access permissions.
        -   Depending on the verification outcome, the notification service sends an email to the user:
            -   **Granted**: Access has been granted.
            -   **Already Granted**: User already has access.
            -   **Denied**: Access has been denied.
        -   Adds the JWT token user to the image access list if access is granted.

## Security Considerations

-   **Nginx**: Used nginx as a reverse proxy
-   **Input Validation**: Ensure all user inputs are validated and sanitized to prevent injection attacks (e.g., SQL injection, NoSQL injection, XSS). Use libraries like `joi` for input validation.
-   **Non-Root User**: Ensure that Docker images do not use the root user. Also used official and trusted Docker images.
-   **Docker Bridge Network**: Use Docker bridge networks for isolating network traffic between containers, enhancing security and reducing the risk of unauthorized access.
-   **Authentication**: All endpoints requiring user data are secured using JWT. Users must provide a valid token to access these endpoints.
-   **Data Encryption**: Passwords are securely hashed using bcrypt before being stored in the database.
-   **Rate Limiting**: The service uses Express Rate Limiter to protect against brute force attacks.
-   **JWT in WebSocket Messages**: Use JWT tokens in WebSocket messages to verify every request.
-   **CORS Configuration**: Cross-Origin Resource Sharing (CORS) is configured to control which domains can access the services.
-   **Helmet**: Used to secure HTTP headers to protect the application from common web vulnerabilities.

## Future Improvements

-   **Payment Service**: Integrate a payment gateway using Stripe for handling transactions.
-   **gRPC Communication**: Implement gRPC for more efficient communication between services.
-   **Service Discovery**: Implement service discovery using tools like Consul or Eureka.
-   **Encrypt with SSL**: Apply SSL certificates to Nginx and RabbitMQ connections.

### Things That Don’t Work

-   **WebSocket Requests**: WebSocket connections are not functioning through Nginx or the API Gateway. They only work when connecting directly to the Image Service host (e.g., `ws://localhost:4000`).
