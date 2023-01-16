import http, { ServerResponse } from "http";
import { v4 as newUUID } from 'uuid';
import { validate as uuidValidate } from 'uuid';
import {UserType, USERS_TYPE, STATUS} from './../common/constants'
import cluster from 'node:cluster';

const endResponse = function(response:ServerResponse, USER_DATA:USERS_TYPE, changed = false){
  if (changed) {
    cluster.worker?.send(USER_DATA as USERS_TYPE);
  }
  response.end();
}


const dataSet = function (data: string, USER_DATA:USERS_TYPE, uuid: string | undefined): UserType | null {
  let result = null;
  try {
    const dataAsJson = JSON.parse(data.toString());

    if (dataAsJson.username !== undefined && dataAsJson.age !== undefined && dataAsJson.hobbies !== undefined && Array.isArray(dataAsJson.hobbies)) {
      const setId = uuid ? uuid : newUUID();
      const newUser = { id: setId, username: dataAsJson.username, age: dataAsJson.age, hobbies: dataAsJson.hobbies };
      result = newUser;
      USER_DATA[newUser.id] = newUser;
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

const responseSet = function (response: ServerResponse, status:number, message:string) {
  response.statusCode = status;
  response.write(message);
}

const uuidNotFound = function(response:ServerResponse, uuid:string){
  responseSet(response, STATUS.NOT_FOUND, `User with uuid ${uuid} not found`);
}

const readBody = function (request: http.IncomingMessage, response: http.ServerResponse, USER_DATA:USERS_TYPE, cluster:boolean, uuid = '', update = false) {
  const chunks: Uint8Array[] = [];

  request.on('data', chunk => chunks.push(chunk));

  request.on('end', () => {
    try {
    const data = Buffer.concat(chunks);
    const setData = !update || USER_DATA[uuid] ? true : false;
    const uuidRequest = uuid !== '' && update ? uuid : undefined;
    const result = setData ? dataSet(data.toString(), USER_DATA, uuidRequest) : null;
    if (result !== null) {
      responseSet(response, update ? STATUS.OK : STATUS.SAVED, JSON.stringify(JSON.stringify(result)));
      endResponse(response, USER_DATA, cluster);
    }
    else if (!setData) {
      uuidNotFound(response, uuid);
      endResponse(response, USER_DATA);
    }
    else {
      responseSet(response, STATUS.WRONG, "Wrong data");
      endResponse(response, USER_DATA);
    }
   }
   catch  {
    responseSet(response, STATUS.FAIL, "Server Error");
    endResponse(response, USER_DATA);
   }
  })
}

export {endResponse, readBody, uuidNotFound, responseSet, uuidParser, dataSet}