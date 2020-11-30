import { beanstalkConfig } from 'Config/beanstalk';
import Jackd from 'jackd';

export default class Beanstalk {
  public static getConfig(name: string): any {
    const config = beanstalkConfig[name];
    const configData = {
      tube: config.tube,
      host: config.host,
      port: config.port,
    };

    return configData;
  }

  public static async queue(job: any, tubeName: string, payload: any, option?: any) {
    const beanstalkd = new Jackd();
    const config = Beanstalk.getConfig(tubeName);
    const tube = config.tube;
    const host = config.host;
    const port = config.port;

    if (host && port) {
      await beanstalkd.connect({ host, port });
      await beanstalkd.use(tube);

      const jobData = {
        job: job,
        data: payload,
      };

      const jobId = await beanstalkd.put(jobData, option);

      return { success: true, message: jobId };
    } else {
      return { success: false, message: 'Connection to beanstalk failed' };
    }
  }
}
