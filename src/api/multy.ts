import http, { IncomingMessage, ServerResponse } from "http";

let maxWorkers = 0;
let currentWorker = 1;

const nextWorker=function() {
  currentWorker = currentWorker + 1 > maxWorkers ? 1 : currentWorker + 1;
  return currentWorker;
}

const setBalancer = function(PORT:number, workersNumber:number) {
  
  maxWorkers = workersNumber;
  
  const server = http.createServer();

  server.on('error', (e) => {
    console.log(e.message);
  });


  server.on("request", async (request:IncomingMessage, response:ServerResponse) => {
    const chunks: Uint8Array[] = [];
      const options = {
        hostname: '',
        port: PORT + currentWorker,
        path: request.url,
        method: request.method,
      };
      nextWorker();
      
      const chunksReceive: Uint8Array[] = [];
      const req = http.request(options, (res) => {
        if (res.statusCode) response.statusCode = res.statusCode;
        res.on('data', (chunk) => {
          chunksReceive.push(chunk);
        });
        res.on('end', () => {
          response.write(chunksReceive.toString());
          response.end();
        });
      });
      
      req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
        response.end();
      });
      
      if (request.method === "GET" || request.method === "DELETE") {
          req.end();
        }
      else {
        request.on('data', chunk => chunks.push(chunk));
        request.on('end', () => {
        try {
          const data = Buffer.concat(chunks);
          req.write(data.toString());
          req.end();
        }
        catch {
          console.log("Something Wrong!")
        }
      });   
    }
  }
);

  server.listen(PORT, () => {
    console.log("Server on PORT " + PORT);
  });
}

export {setBalancer}