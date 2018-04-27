const net = require('net')

const SEPARATOR = '__message__'
const connectedClients = {}

function TCPServer(port, onMessage) {    
    start(port)

    this.send = function(object) {
        for(key in connectedClients)
            connectedClients[key].write(JSON.stringify(object) +";")
    }

    function start(port) {    
        const server = net.createServer( socket => {
            const clientId = `${socket.remoteAddress}`
            connectedClients[clientId] = socket

            console.log(`\n[${ clientId }] connected`)

            socket.on('data', message => {
                String(message)
                     .split(SEPARATOR)
                     .map( string => string.trim() )
                     .filter( string => string.length !== 0  )
                     .filter( string => string[0] === "{" )
                     .map( JSON.parse )
                     .forEach( onMessage )
            })

            socket.on('end', () => {
                console.log(`[${ clientId }] connection terminated`)
                delete connectedClients[clientId]
            })

            socket.on('error', () => {
                console.log(`[${ clientId }] connection error`)
                delete connectedClients[clientId]
            })
        })

        server.listen(port)
        
        console.log(`TCP server listening on port ${port}`)
    }
}

module.exports = TCPServer