# PortfolioAPI
Portfolio API with JWT authentication + refresh token
To ensure authentication the JWT is valid for 5 seconds and the refresh token for 1 hour.
Change these settings in a .env file in the root directory.

Commands to recreate the mysql database: 
- ``` CREATE DATABASE `PortfolioDB` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */; ```

- ```CREATE TABLE `Users` (
  `idUser` int NOT NULL AUTO_INCREMENT,
  `username` varchar(45) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`idUser`),
  UNIQUE KEY `idUser_UNIQUE` (`idUser`),
  UNIQUE KEY `username_UNIQUE` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci; ```
- Generate a hashed password ```https://bcrypt-generator.com``` and replace add it to the INSERT INTO query

- ``` INSERT INTO `PortfolioDB`.`Users`
(`username`,
`password`)
VALUES
(<{username: }>,
<{password: }>); ```

- ```  CREATE TABLE `Blogs` (
  `idBlogs` int NOT NULL AUTO_INCREMENT,
  `title` varchar(69) NOT NULL,
  `subtitle` varchar(69) NOT NULL,
  `text` longtext NOT NULL,
  `additionaltext` longtext,
  `genre` int DEFAULT NULL,
  PRIMARY KEY (`idBlogs`),
  UNIQUE KEY `idBlogs_UNIQUE` (`idBlogs`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;```
 
 - ``` CREATE TABLE `Genres` (
  `id` int NOT NULL AUTO_INCREMENT,
  `genre` varchar(69) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Genres_UNIQUE` (`id`),
  UNIQUE KEY `Genre_UNIQUE` (`genre`)
) ENGINE=InnoDB AUTO_INCREMENT=320 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;```



## How the .env file should look like
```
TOKEN_SECRET = ''
JWT_EXPIRES_IN = '5s'
REFRESH_TOKEN_EXPIRES_IN_SECONDS = '3600'
CORS_ALLOWED_ORIGIN = ''
ACCOUNT = ''
PASSWORD = ''
MYSQL_HOST = ''
MYSQL_PORT = ''
MYSQL_USER = ''
MYSQL_PASSWORD = ''
MYSQL_DATABASE = 'PortfolioDB'
```
