import CryptoJS from "crypto-js";
import pkg from 'lodash';

import { env } from "node:process";
const {toNumber} = pkg;

export interface SDNotifyBody {
  no: string;
  order_no: string;
  trade_name: string;
  pay_type: string;
  order_amount: string;
  pay_amount: string;
  order_uid: string;
  sign: string;
}

// 将对象转换为表单编码的字符串
function toFormData(obj: any): string {
  return Object.keys(obj)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join("&");
}

export default class SDPay {
  private appId: number;
  private apiKey: string;

  constructor() {
    const appId = env.SDPAY_APP_ID;
    const apiKey = env.SDPAY_API_KEY;
    console.log(appId, apiKey);
    if (!appId || !apiKey) {
      throw new Error("SDPAY_APP_ID or SDPAY_API_KEY is not set");
    }
    this.appId = toNumber(appId);
    this.apiKey = apiKey;
  }

  // 发起付款
  public async createPayment(
    orderNo: string,
    tradeName: string,
    payType: string,
    orderAmount: number,
    orderUid: string,
    payerName?: string
  ): Promise<any> {
    const params = {
      app_id: this.appId,
      order_no: orderNo,
      trade_name: tradeName,
      pay_type: payType,
      order_amount: orderAmount,
      order_uid: orderUid,
      // payer_name: payerName || "",
    } as any;

    params["sign"] = this.generateSign(params);

    // 将参数转换为表单编码的字符串
    const formData = toFormData(params);

    const url = `https://api.sdpay.cc/pay?format=json&${formData}`;

    console.log(url);
    const response = await fetch(url);

    if (!response.ok) {
      console.log(response.statusText, response.text());
      throw new Error("Network response was not ok");
    }
    return response.json();
  }

  // 获取支付链接
  public async getPaymentLink(
    orderNo: string,
    tradeName: string,
    payType: string,
    orderAmount: number,
    orderUid: string,
    payerName?: string
  ): Promise<string> {
    const params = {
      app_id: this.appId,
      order_no: orderNo,
      trade_name: tradeName,
      pay_type: payType,
      order_amount: orderAmount,
      order_uid: orderUid,
      // payer_name: payerName || "",
    } as any;

    params["sign"] = this.generateSign(params); // 将参数转换为表单编码的字符串
    const formData = toFormData(params);
    const url = `https://api.sdpay.cc/pay?${formData}`;
    return url;
  }

  // 验证通知
  public verifyNotify(params: SDNotifyBody): boolean {
    return this.notifySign(params) === params.sign;
  }

  // 生成签名
  private generateSign(params: any): string {
    const signString = `app_id=${params.app_id}&order_no=${params.order_no}&trade_name=${params.trade_name}&pay_type=${params.pay_type}&order_amount=${params.order_amount}&order_uid=${params.order_uid}&${this.apiKey}`;

    return this.md5(signString);
  }

  private notifySign(params: SDNotifyBody): string {
    //计算签名
    // $sign_str = "no=" . $no . "&order_no=" . $order_no . "&trade_name=" . $trade_name . "&pay_type=" . $pay_type . "&order_amount=" . $order_amount . "&pay_amount=" . $pay_amount . "&order_uid=" . $order_uid . "&" . $app_key;
    // $sign     = strtolower(md5($sign_str));
    const signString = `no=${params.no}&order_no=${params.order_no}&trade_name=${params.trade_name}&pay_type=${params.pay_type}&order_amount=${params.order_amount}&pay_amount=${params.pay_amount}&order_uid=${params.order_uid}&${this.apiKey}`;
    return this.md5(signString);
  }

  // MD5加密
  private md5(string: string): string {
    return CryptoJS.MD5(string).toString();
  }
}
