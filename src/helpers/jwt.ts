import jwt from 'jsonwebtoken';
import { appConfig } from 'Config/app';

export default class JwtHelper {
  public static async sign(content: object, expiryTimeInSeconds: number = 30) {
    try {
      const secret = appConfig.jwtSecret;
      const result = jwt.sign({ data: content }, secret, { expiresIn: expiryTimeInSeconds });

      return result;
    } catch (error) {
      throw error;
    }
  }

  public static async signRefresh(content: object, expiryTimeInSeconds: number = 30) {
    try {
      const secret = appConfig.jwtRefreshSecret;
      const result = jwt.sign({ data: content }, secret, { expiresIn: expiryTimeInSeconds });

      return result;
    } catch (error) {
      throw error;
    }
  }

  public static async verifyRefresh(token: string) {
    try {
      const secret = appConfig.jwtRefreshSecret;
      const result = jwt.verify(token, secret, {});

      return result;
    } catch (error) {
      throw error;
    }
  }
}
