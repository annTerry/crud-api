import {PORT, USERS_TYPE} from './common/constants'
import os from "node:os";
import cluster from "node:cluster";
import serverListener from './api/crud-server';
import {setBalancer} from './api/multy';

if(cluster.isPrimary) {
  const cpus = os.cpus().length;
  for(let i = 1; i < cpus; i++) {
    const env = {number: i};
    cluster.fork(env);
}
  setBalancer(+PORT, cpus - 1);

  if (cluster.workers) {
    const allWorkers = Object.values(cluster.workers);
    for (const worker of allWorkers) {
      worker?.on("message", (data) => {
        const id = worker.id;
        for (const otherWorker of allWorkers) {
          if (otherWorker && id !== otherWorker.id) {
            otherWorker.send(data as USERS_TYPE);
          }
        }
      })
    }
  }
}

else {
  const number = process.env.number ? +process.env.number : 0;
  const clusterPort = +PORT + number;
  serverListener(clusterPort, true);
}