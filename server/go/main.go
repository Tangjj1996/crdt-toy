package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

var db = make(map[string]string)

func setupRouter() *gin.Engine {
	// Disable Console Color
	// gin.DisableConsoleColor
	r := gin.Default()

	// Pint test
	r.GET("/ping", func(ctx *gin.Context) {
		ctx.String(http.StatusOK, "pong")
	})

	// Get user value
	r.GET("/user/:name", func(ctx *gin.Context) {
		user := ctx.Params.ByName("name")
		value, ok := db[user]

		if ok {
			ctx.JSON(http.StatusOK, gin.H{"user": user, "value": value})
		} else {
			ctx.JSON(http.StatusOK, gin.H{"user": user, "status": "no value"})
		}
	})

	// Authorized group (uses gin.BasicAuth() middleware)
	// Same than:
	// authorized := r.Group("/")
	// authorized.Use(gin.BasicAuth(gin.Credentials{
	//   "foo": "bar",
	//   "manu": "123"
	//}))
	authorized := r.Group("/", gin.BasicAuth(gin.Accounts{
		"foo":  "bar", // user:foo password:bar
		"manu": "123", // user:name password:123
	}))

	/** example curl for /admin with basicauth header
	xfsafafa== is base64("foo:bar")
			curl -X POST \
			http://localhost:8000/admin \
			-H 'authorization: Basic xfsafafa==' \
			-H 'content-type: application/json' \
			-d '{"value": "bar"}'

	*/
	authorized.POST("admin", func(ctx *gin.Context) {
		user := ctx.MustGet(gin.AuthUserKey).(string)

		// Parse Json
		var json struct {
			Value string `json:"value" binding:"required"`
		}

		if ctx.Bind(&json) == nil {
			db[user] = json.Value
			ctx.JSON(http.StatusOK, gin.H{"status": "ok"})
		}
	})

	return r
}

func main() {
	r := setupRouter()
	// Listen and server in localhost:8080
	r.Run(":8080")
}
