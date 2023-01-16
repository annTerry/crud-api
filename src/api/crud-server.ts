import http, { ServerResponse } from "http";
import {DEFAULT_URL, STATUS, USERS} from './../common/constants'
import {endResponse, readBody, uuidNotFound, responseSet, uuidParser} from './dataManip';
import cluster from 'node:cluster';

let USER_DATA = USERS; 


const serverListener = function(PORT:number, clustered = false) {
  const server = http.createServer();

  if (clustered) {
    cluster.worker?.on("message", (data) => {USER_DATA = data;
    })
}

  server.on('error', (e) => {
    console.log(e.message);
  });

  server.on("request", async (request, response:ServerResponse) => {
    if (request.url && request.url.indexOf(DEFAULT_URL) === 0) {
      if (clustered) {
        console.log("Data on " + PORT);
    }
      const urlData: string = request.url.replace(DEFAULT_URL, '');
      switch (request.method) {
        
        case "GET": if (urlData === '') {
            responseSet(response, STATUS.OK, JSON.stringify(Object.values(USER_DATA)));
            endResponse(response, USER_DATA);
          }
          else {
            const uuid = uuidParser(urlData);
            if (uuid.valid) {
              const requestedUser = USER_DATA[uuid.value];
              if (requestedUser) {
                responseSet(response, STATUS.OK, JSON.stringify(requestedUser));
              }
              else {
                uuidNotFound(response, uuid.value);
              }
            }
            else {
              responseSet(response, STATUS.WRONG, uuid.value + " is wrong uuid");
            }
            endResponse(response, USER_DATA);
          }
          break;
        
        case "POST": if (urlData === '') {
              readBody(request, response, USER_DATA, clustered);
            }
          else {
            responseSet(response, STATUS.WRONG, " Wrong url");
            endResponse(response, USER_DATA);
          }
          break;
  
        case "PUT": if (urlData !== '') {
            const uuid = uuidParser(urlData);
            if (uuid.valid) {
             readBody(request, response, USER_DATA, clustered, uuid.value, true);
            }
            else {
              responseSet(response, STATUS.WRONG, uuid.value + " is wrong uuid");
              endResponse(response, USER_DATA);
            }
          }
          else {
            responseSet(response, STATUS.WRONG, " Wrong url");
            endResponse(response, USER_DATA);
          }
          break;
        
        case "DELETE": if (urlData !== '') {
            const uuid = uuidParser(urlData);
            if (uuid.valid) {
              const requestedUser = USERS[uuid.value];
              if (requestedUser) {
                delete USERS[uuid.value];
                responseSet(response, STATUS.DELETED, `User with uuid ${uuid.value} deleted`);
                endResponse(response, USER_DATA, clustered);
              }
              else {
                uuidNotFound(response, uuid.value);
                endResponse(response, USER_DATA);
              }
            }
            else {
              responseSet(response, STATUS.WRONG, uuid.value + " is wrong uuid");
              endResponse(response, USER_DATA);
            }
          }
          else {
            responseSet(response, STATUS.WRONG, " Wrong url");
            endResponse(response, USER_DATA);
          }
          break;
  
        default:
          responseSet(response, STATUS.WRONG, " Wrong METHOD");
          endResponse(response, USER_DATA);
      }
    }
  }
  );
  
  server.listen(PORT, () => {
    console.log("Server on PORT " + PORT);
  });
}

export default serverListener;