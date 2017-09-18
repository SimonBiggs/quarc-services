import { Injectable, isDevMode } from '@angular/core';

import { Router } from '@angular/router';

import {
  Kernel, KernelMessage, Session, ServerConnection
} from '@jupyterlab/services';


@Injectable()
export class KernelService {
  ip = '10.0.0.126';
  port = '17575';
  token = 'dl9CmOMWWPDo4JvhfZjeFRHTcbQKzEI3clU8uUfeN1o';

  baseUrl: string;

  settings: ServerConnection.ISettings;
  options: Session.IOptions;
  session: Session.ISession;
  kernel: Kernel.IKernel;

  queueId = 0;
  queueLog = {};

  queue: Promise<any> = Promise.resolve();

  testcode = [
    'import numpy as np',
    'import matplotlib.pyplot as plt',
    '%matplotlib inline',
    'x = np.linspace(-10,10)',
    'y = x**2',
    'print(x)',
    'print(y)',
    'plt.plot(x, y)'
  ].join('\n');

  constructor(
    private router: Router
  ) {
    this.defineSettings(this.ip, this.port, this.token);
  }

  setBaseUrl() {
    this.baseUrl = 'https://'.concat(this.ip).concat(':').concat(this.port);
  }

  defineSettings(ip, port, token) {
    this.ip = ip;
    this.port = port;
    this.token = token;

    this.setBaseUrl();

    this.settings = ServerConnection.makeSettings({
      baseUrl: this.baseUrl,
      token: this.token
    });

    this.options = {
      kernelName: 'python3',
      serverSettings: this.settings,
      path: ''
    };
  }

  addToQueue(name: string, asyncFunction: (id: number ) => Promise<any>): Promise<any> {
    const currentQueueId = this.queueId;

    this.queueLog[currentQueueId] = name;
    this.queueId += 1;
    const previous = this.queue;
    return this.queue = (async () => {
      await previous;
      delete this.queueLog[currentQueueId];
      return asyncFunction(currentQueueId);
    })();
  }

  // permissionCheck(): Promise<any> {
  //   this.startKernel();
  //   this.runCode(this.testcode, '"permissionCheck"_0');
  //   this.shutdownKernel();

  //   return this.queue;
  // }

  startKernel(): Promise<void> {
    return this.addToQueue(null, async (id: number): Promise<void> => {
      console.log('Start Kernel Queue Item');
      await Kernel.startNew(this.options).then(newKernel => {
        this.kernel = newKernel;
      }).catch(err => {
        console.error(err);
        this.router.navigate(['/connect']);
      });
    });
  }

  shutdownKernel(): Promise<void> {
    return this.addToQueue(null, async (id: number): Promise<void> => {
      console.log('Shutdown Kernel Queue Item');
      await this.kernel.shutdown();
    });
  }

  forceShutdownKernel(): Promise<void> {
    this.queue = Promise.resolve();
    return this.shutdownKernel();
  }

  resetKernel(): Promise<void> {
    this.forceShutdownKernel();
    return this.startKernel();
  }

  runCode(code: string, name: string): Promise<any> {
    // console.log(this.queueLog)
    let future: Kernel.IFuture;
    let runCode: boolean;

    const currentQueue = this.addToQueue(
      name, async (id: number): Promise<any> => {
        runCode = true;
        for (const key in this.queueLog ) {
          if (Number(key) > id && this.queueLog[key] === name) {
            runCode = false;
            break;
          }
        }
        if (runCode) {
          console.log('Run Code Queue Item');
          future = this.kernel.requestExecute({ code: code });
          return future;
        } else {
          return Promise.resolve();
        }
      }
    ).catch(err => {
      console.error(err);
      this.router.navigate(['/connect']);
    });
    this.addToQueue(null, async (id: number): Promise<any> => {
      if (runCode) {
        return await future.done;
      } else {
        return Promise.resolve();
      }

    });
    return currentQueue;
  }
}
