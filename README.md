# PortfolioAPI
Portfolio API with JWT authentication + refresh token
To ensure authentication the JWT is valid for 5 seconds and the refresh token for 1 hour.
Change these settings in a .env file in the root directory.
## How the .env file should look like
```
TOKEN_SECRET = ''
JWT_EXPIRES_IN = '5s'
REFRESH_TOKEN_EXPIRES_IN_SECONDS = '3600'
ACCOUNT = ''
PASSWORD = ''
CORS_ALLOWED_ORIGIN: ''
```
