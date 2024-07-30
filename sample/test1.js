const http = require('http')
const fs = require('fs')
const port = 3000

const server = http.createServer(function(req, res) {
    res.writeHead(200, {"Content-Type": "text/html"})
    fs.readFile("test1.html", function(error, data){
        if (error){
            console.log("soucis")
            res.writeHead(500)

        } else {
            res.write(data)
        }
        res.end()
    })
})

server.listen(port, function(error){
    if (error){
        console.log("Error: ", error)
    } else {
        console.log("Server available at : http://localhost:3000")
    }
})