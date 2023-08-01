package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func hanldeWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	defer conn.Close()

	for {
		_, msg, err := conn.ReadMessage()

		if err != nil {
			break
		}

		println("Receive message: ", string(msg))

		err = conn.WriteMessage(websocket.TextMessage, msg)
		if err != nil {
			break
		}
	}
}

func main() {
	r := gin.Default()

	r.GET("/websocket", hanldeWebSocket)

	if err := r.Run(":8888"); err != nil {
		panic(err)
	}
}
