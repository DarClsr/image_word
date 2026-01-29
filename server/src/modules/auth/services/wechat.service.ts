/**
 * 微信小程序 API 服务
 * 处理微信登录、用户信息获取等
 */
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../../../shared/logger/logger.service';

/**
 * 微信 code2Session 响应
 */
export interface WechatSessionResponse {
  openid: string;
  session_key: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

/**
 * 微信用户手机号响应
 */
export interface WechatPhoneResponse {
  phone_info: {
    phoneNumber: string;
    purePhoneNumber: string;
    countryCode: string;
  };
  errcode?: number;
  errmsg?: string;
}

/**
 * 微信 Access Token 响应
 */
interface WechatAccessTokenResponse {
  access_token: string;
  expires_in: number;
  errcode?: number;
  errmsg?: string;
}

@Injectable()
export class WechatService {
  private readonly appId: string;
  private readonly appSecret: string;
  private readonly baseUrl = 'https://api.weixin.qq.com';
  
  // Access Token 缓存
  private accessToken: string | null = null;
  private accessTokenExpireTime = 0;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.appId = this.configService.get<string>('WECHAT_APPID') || '';
    this.appSecret = this.configService.get<string>('WECHAT_SECRET') || '';

    if (!this.appId || !this.appSecret) {
      this.logger.warn('微信配置未完整，WECHAT_APPID 或 WECHAT_SECRET 未设置', 'WechatService');
    }
  }

  /**
   * 通过 code 换取 openid 和 session_key
   * @param code 微信登录返回的 code
   */
  async code2Session(code: string): Promise<WechatSessionResponse> {
    const url = `${this.baseUrl}/sns/jscode2session`;
    const params = new URLSearchParams({
      appid: this.appId,
      secret: this.appSecret,
      js_code: code,
      grant_type: 'authorization_code',
    });

    try {
      this.logger.debug(`微信 code2Session 请求: code=${code.substring(0, 10)}...`, 'WechatService');

      const response = await fetch(`${url}?${params.toString()}`);
      const data: WechatSessionResponse = await response.json();

      // 检查微信返回的错误
      if (data.errcode) {
        this.logger.error(`微信 code2Session 失败: ${data.errcode} - ${data.errmsg}`, 'WechatService');
        throw new HttpException(
          {
            code: data.errcode,
            message: this.getWechatErrorMessage(data.errcode),
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.debug(`微信 code2Session 成功: openid=${data.openid?.substring(0, 10)}...`, 'WechatService');
      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`微信 code2Session 网络错误: ${error}`, 'WechatService');
      throw new HttpException('微信服务暂不可用，请稍后重试', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  /**
   * 获取微信 Access Token
   * 用于调用其他微信 API（如获取手机号）
   */
  async getAccessToken(): Promise<string> {
    // 检查缓存
    if (this.accessToken && Date.now() < this.accessTokenExpireTime) {
      return this.accessToken;
    }

    const url = `${this.baseUrl}/cgi-bin/token`;
    const params = new URLSearchParams({
      grant_type: 'client_credential',
      appid: this.appId,
      secret: this.appSecret,
    });

    try {
      const response = await fetch(`${url}?${params.toString()}`);
      const data: WechatAccessTokenResponse = await response.json();

      if (data.errcode) {
        this.logger.error(`获取 Access Token 失败: ${data.errcode} - ${data.errmsg}`, 'WechatService');
        throw new HttpException('获取微信凭证失败', HttpStatus.SERVICE_UNAVAILABLE);
      }

      // 缓存 Token，提前 5 分钟过期
      this.accessToken = data.access_token;
      this.accessTokenExpireTime = Date.now() + (data.expires_in - 300) * 1000;

      this.logger.debug('获取 Access Token 成功', 'WechatService');
      return this.accessToken;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`获取 Access Token 网络错误: ${error}`, 'WechatService');
      throw new HttpException('微信服务暂不可用', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  /**
   * 通过 code 获取用户手机号
   * @param code 手机号授权返回的 code
   */
  async getPhoneNumber(code: string): Promise<string> {
    const accessToken = await this.getAccessToken();
    const url = `${this.baseUrl}/wxa/business/getuserphonenumber?access_token=${accessToken}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data: WechatPhoneResponse = await response.json();

      if (data.errcode) {
        this.logger.error(`获取手机号失败: ${data.errcode} - ${data.errmsg}`, 'WechatService');
        throw new HttpException('获取手机号失败，请重试', HttpStatus.BAD_REQUEST);
      }

      return data.phone_info.phoneNumber;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`获取手机号网络错误: ${error}`, 'WechatService');
      throw new HttpException('微信服务暂不可用', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  /**
   * 获取微信错误消息
   */
  private getWechatErrorMessage(errcode: number): string {
    const errorMessages: Record<number, string> = {
      40029: '无效的 code，请重新登录',
      45011: '请求过于频繁，请稍后重试',
      40226: '该用户已被封禁',
      40013: '无效的 AppID',
      40125: '无效的 AppSecret',
      41004: 'AppSecret 缺失',
      40001: 'AppSecret 错误或 Access Token 无效',
    };
    return errorMessages[errcode] || '微信登录失败，请重试';
  }

  /**
   * 检查微信配置是否可用
   */
  isConfigured(): boolean {
    return !!(this.appId && this.appSecret);
  }
}
