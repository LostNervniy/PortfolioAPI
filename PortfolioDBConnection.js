const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const { resolveTxt } = require('dns');
class PortfolioDBConnection{
    connection = null;
    init(){
        this.connection = mysql.createConnection({
            host: process.env.MYSQL_HOST,
            port: process.env.MYSQL_PORT,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE
        })
        this.connection.connect((err) => {
            if(err) throw err;
            console.log(`Connected to Database ${process.env.MYSQL_DATABASE} on ${process.env.MYSQL_HOST}:${process.env.MYSQL_PORT}`)
        })
        
    }

    async comparePasswords(password, hash){
        const result = await bcrypt.compare(password, hash)
        return result
    }

    login(username, password){
        return this.checkForUser(username, password).then(results => {
            return this.comparePasswords(password, results[0].password).then(accepted => {
                return accepted;
            })
        })
    }

    checkForUser(username, password){
        let that = this
        return new Promise(function(resolve, reject){
            if(typeof username != 'string' || typeof password != 'string'){
                reject(new Error("username  or password is not a string"))
            }
            that.connection.query(
                "SELECT Count(pDB.username) as UserExist, password from PortfolioDB.Users AS pDB WHERE pDB.username = ?",
                [username], 
                function(error, results){
                    if(error){
                        return reject(new Error(error))
                    }
                    
                    if(Boolean(results[0].UserExist)){
                        resolve(results)
                    }

                    return reject(new Error("Username doesnt exists"))
                }
            )

        })
    }

    addGenre(genre){
        let that = this;
        return new Promise(function(resolve, reject){
            if(typeof genre != 'string'){
                return reject("Genre is not a string.")
            }
            that.connection.query(
                "INSERT INTO PortfolioDB.Genres (genre) VALUES (?)",
                [genre],
                function(error, results){
                    if(error){
                        return reject("Genre already exists")
                    }
                    resolve(results)
                }
            )
        })
    }

    getAllGenres(){
        let that = this;
        return new Promise(function(resolve, reject){
            that.connection.query(
                "SELECT id, genre FROM PortfolioDB.Genres",
                function(error, results){
                    if(error){
                        return reject("Error")
                    }
                    resolve(results)
                }
            )
        })
    }

    getAllBlogs(){
        let that = this;
        return new Promise(function(resolve, reject){
            that.connection.query(
                "SELECT b.idBlogs, b.title, b.subtitle, b.text, b.additionaltext, g.genre, b.date FROM PortfolioDB.Blogs AS b LEFT JOIN PortfolioDB.Genres AS g on b.genre = g.id",
                function(error, results){
                    if(error){
                        return reject("Error")
                    }
                    resolve(results)
                }
            )
        })
    }


    addBlog(title, subtitle, text, additionaltext, genre){
        let that = this;
        return new Promise(function(resolve, reject){
            if(typeof title != 'string' ||
                typeof subtitle != 'string' ||
                typeof text != 'string' ||
                typeof additionaltext != 'string' ||
                typeof genre != 'number'){
                    return reject("Format is wrong.")
                }
                that.connection.query(
                    "INSERT INTO PortfolioDB.Blogs (title, subtitle, text, additionaltext, genre) VALUES (?, ?, ?, ?, ?)",
                    [title, subtitle, text, additionaltext, genre],
                    function(error, results){
                        if(error){
                            return reject(`Blog with title ${title} already exists`)
                        }
                        resolve(results)
                    }
                )
                
        })
    }

}

module.exports = PortfolioDBConnection;