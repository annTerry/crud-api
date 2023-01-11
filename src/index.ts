import * as dotenv from 'dotenv'
import http from "http";
import { v4 as newUUID } from 'uuid';
import { validate as uuidValidate } from 'uuid';

dotenv.config()

const PORT = process.env.PORT || 4000;
const server = http.createServer();
const DEFAULT_URL = '/api/users';


type UserType = { id?: string, username: string, age: number, hobbies: string[] };
//type ResponseType = {message:string, code:number};
const USERS: { [id: string]: UserType } = {};

server.on('error', (e) => {
  console.log(e.message);
});

const dataSet = function (data: string, uuid: string | undefined): UserType | null {
  let result = null;
  try {
    const dataAsJson = JSON.parse(data.toString());

    if (dataAsJson.username !== undefined && dataAsJson.age !== undefined && dataAsJson.hobbies !== undefined && Array.isArray(dataAsJson.hobbies)) {
      const setId = uuid ? uuid : newUUID();
      const newUser = { id: setId, username: dataAsJson.username, age: dataAsJson.age, hobbies: dataAsJson.hobbies };
      result = newUser;
      USERS[newUser.id] = newUser;
    }
  }
  catch (e) {
    console.log("ERROR!!!");
  }
  return result;
}

const uuidParser = function (uuid: string): { valid: boolean, value: string } {
  const result = { valid: false, value: uuid };
  const clearUuid = uuid.replace('/', '');
  result.valid = uuidValidate(clearUuid);
  if (result.valid) result.value = clearUuid;
  return result;
}

const readBody = function (request: http.IncomingMessage, response: http.ServerResponse, uuid = '', update = false) {
  const chunks: Uint8Array[] = [];

  request.on('data', chunk => chunks.push(chunk));

  request.on('end', () => {
    const data = Buffer.concat(chunks);
    const setData = !update || USERS[uuid] ? true : false;
    const uuidRequest = uuid !== '' && update ? uuid : undefined;
    const result = setData ? dataSet(data.toString(), uuidRequest) : null;
    if (result !== null) {
      response.statusCode = update ? 200 : 201;
      response.write(JSON.stringify(result));
    }
    else if (!setData) {
      response.statusCode = 404;
      response.write("User with uuid " + uuid + ' not found');
    }
    else {
      response.statusCode = 400;
      response.write("Wrong data");
    }
    response.end();
  })
}

const urlParser = async function (request: http.IncomingMessage, response: http.ServerResponse) {

  if (request.url && request.url.indexOf(DEFAULT_URL) === 0) {
    const urlData: string = request.url.replace(DEFAULT_URL, '');

    switch (request.method) {
      case "GET": if (urlData === '') {
        response.statusCode = 200;
        response.write(JSON.stringify(Object.values(USERS)));
        response.end();
      }
      else {
        const uuid = uuidParser(urlData);
        if (uuid.valid) {
          const requestedUser = USERS[uuid.value];
          if (requestedUser) {
            response.statusCode = 200;
            response.write(JSON.stringify(requestedUser));
          }
          else {
            response.statusCode = 404;
            response.write("User with uuid " + uuid.value + ' not found');
          }
        }
        else {
          response.statusCode = 400;
          response.write(uuid.value + ' is wrong uuid');
        }
        response.end();
      }
        break;
      case "POST": if (urlData === '') {
        readBody(request, response);
      }
      else {
        response.statusCode = 400;
        response.write('Wrong url');
        response.end();
      }
        break;
      case "PUT": if (urlData !== '') {
        const uuid = uuidParser(urlData);
        if (uuid.valid) {
        readBody(request, response, uuid.value, true);
        }
        else {
          response.statusCode = 400;
          response.write(uuid.value + ' is wrong uuid'); 
          response.end();
        }
      }
      else {
        response.statusCode = 400;
        response.write('Wrong url');
        response.end();
      }
        break;
      case "DELETE": if (urlData !== '') {
        const uuid = uuidParser(urlData);
        if (uuid.valid) {
          const requestedUser = USERS[uuid.value];
          if (requestedUser) {
            delete USERS[uuid.value];
            response.statusCode = 204;
            response.write("User with uuid " + uuid.value + ' deleted');
          }
          else {
            response.statusCode = 404;
            response.write("User with uuid " + uuid.value + ' not found');
          }
        }
        else {
          response.statusCode = 400;
          response.write(uuid.value + ' is wrong uuid');
        }
        response.end();
      }
      else {
        response.statusCode = 400;
        response.write('Wrong url');
        response.end();
      }
        break;
      default:
        response.statusCode = 400;
        response.write('Wrong Method');
        response.end();
    }

  }

}


server.on("request", async (request, response) => {
  urlParser(request, response);
}
);

server.listen(PORT, () => {
  // do whatever
});