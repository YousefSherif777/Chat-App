import { WebSocketServer,WebSocket } from "ws"

const wss = new WebSocketServer({port:8000})
wss.on("connection",(socket,request)=>{
wss.on("message",(Data)=>{
    const data =Data.toString()
    console.log("Received:", data)

    wss.clients.forEach((client)=>{
        if(client.readyState===WebSocket.OPEN) client.send(`server boradcast hello`)
    })
})

wss.on("error",(err)=>{
console.error(err.message)
})

wss.on("close",()=>{
    console.log("connection is disconnected")
})
})
console.log("web socket is live on ws://localhost:8080")