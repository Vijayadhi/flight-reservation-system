import "dotenv/config"

export default {
    DB_NAME: process.env.DB_NAME,
    DB_URL: process.env.DB_URL,
    PORT: process.env.PORT,
    SALT:  process.env.SALT,
    JWT_SECRECT:  process.env.JWT_SECRECT,
    JWT_TIMEOUT:   process.env.JWT_TIMEOUT,
}