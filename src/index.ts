import * as dotenv from 'dotenv'
import http from "http";

dotenv.config()

const PORT = process.env.PORT || 4000;
const server = http.createServer()

server.on('error', (e) => {
  console.log(e.message);
});

server.on("request", (request, response) => {
  switch (request.method) {
    case "GET":
      switch (request.url) {
        default:
          response.statusCode = 400
          response.write(`CANNOT GET ${request.url}`)
          response.end()
      }
      break

    case "POST":
      break

    case "PUT":
      break

    case "DELETE":
      break

    default:
      // Send response for requests with no other response
      response.statusCode = 400
      response.write("No Response")
      response.end()
  }
});

server.listen(PORT, () => {
  // do whatever
});