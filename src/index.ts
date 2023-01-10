import * as dotenv from 'dotenv'
import http from "http";
import { v4 as uuidv4 } from 'uuid';
import { validate as uuidValidate } from 'uuid';

dotenv.config()

const PORT = process.env.PORT || 4000;
const server = http.createServer();
const DEFAULT_URL = '/api/users';


type UserType = {id?: string, username:string, age:number, hobbies: string []};
type ResponseType = {message:string, code:number};
const USERS : UserType [] = [];

server.on('error', (e) => {
  console.log(e.message);
});

const dataSet = function(data:string): boolean {
  const dataAsJson = JSON.parse(data.toString());
  let result = false;

  if (dataAsJson.username !== undefined && dataAsJson.age !== undefined && dataAsJson.hobbies!== undefined) {
    const newUser = {id: uuidv4(), username:dataAsJson.username, age:dataAsJson.age, hobbies: dataAsJson.hobbies};
    result = true;
    USERS.push(newUser);
  }
  return result;
}

const uuidParser = function(uuid:string):{valid:boolean, value:string} {
  const result = {valid: false, value: uuid};
  const clearUuid = uuid.replace('/','');
  result.valid = uuidValidate(clearUuid);
  if (result.valid) result.value = clearUuid;
  return result;
}

const readBody = async function(request:http.IncomingMessage): Promise<string> {
  const chunks:Uint8Array[] = [];
  let result = '';

  request.on('data', chunk => chunks.push(chunk));
  request.on('end', () => {
    const data = Buffer.concat(chunks);
    result = data.toString();
  })
  return result;
}

const urlParser = async function(request:http.IncomingMessage):Promise<ResponseType> {
  const result = {message: 'No Response',  code: 400};
  if (request.url && request.url.indexOf(DEFAULT_URL) === 0) {
    const urlData:string = request.url.replace(DEFAULT_URL, '');

    switch (request.method) {
      case "GET": if (urlData === '') {
          result.code = 200;
          result.message = USERS.toString();
        }
        else {
          const uuid = uuidParser(urlData);
          if (uuid.valid) result.code = 200;
          result.message = uuid.toString();
        }
        break;
      case "POST": if (urlData === '') {
        const data = await readBody(request);
        if (dataSet(data)) {
          result.code = 200;
          result.message = USERS.toString();
        }
      }
        break;
      default:
        result.message = 'Wrong Method';  
    }
  }
  return result;
}


server.on("request", async (request, response) => {
  const result = await urlParser(request);
  response.statusCode = result.code;
  response.write(result.message);
  response.end()
  }
);

server.listen(PORT, () => {
  // do whatever
});