import { sqsConfig } from 'Config/sqs';
import { WTSQS } from 'wtsqs';

export default class SQS {
  public static getConfig(qmodule: string): any {
    const config = sqsConfig[qmodule];
    return {
      url: config.url,
      key: config.key,
      secret: config.secret,
      region: config.region,
    };
  }

  public static async queue(job: any, qmodule: string, payload: any) {
    const wtsqs = SQS.getWorkerWrapper(qmodule);
    if (!wtsqs) {
      return { success: false, message: 'failed to initialize worker' };
    }
    if (!job) {
      return { success: false, message: 'Job not defined' };
    }

    const jobData = {
      job: job,
      data: payload,
    };

    try {
      await wtsqs.enqueueOne(jobData);
      return { success: true, message: 'Success' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  private static getWorkerWrapper(queue: string): WTSQS {
    const config = SQS.getConfig(queue);

    if (!config.url) {
      throw new Error('SQS url not defined');
    }

    if (!config.key) {
      throw new Error('SQS key not defined');
    }

    if (!config.secret) {
      throw new Error('SQS secret not defined');
    }

    return new WTSQS({
      url: config.url,
      accessKeyId: config.key,
      secretAccessKey: config.secret,
      region: config.region,
    });
  }
}
