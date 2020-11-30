import beanStalkHelper from 'Helpers/beanstalk';
import sqsHelper from 'Helpers/sqs';
import { appConfig } from 'Config/app';

export default class QueueHelper {
  public static async queueChoice(job: any, qModule: string, inputs: any, option: any = 0) {
    if (appConfig.queueConnection === 'beanstalk') {
      try {
        const result = await beanStalkHelper.queue(job, qModule, inputs, option);
        return result;
      } catch (error) {
        return { success: false, message: error };
      }
    } else {
      try {
        const result = sqsHelper.queue(job, qModule, inputs);
        return result;
      } catch (error) {
        return { success: false, message: error };
      }
    }
  }
}
