export function validatePhoneNumber(phone: string): boolean {
  // 这里使用一个简单的中国大陆手机号码验证规则
  // 你可能需要根据具体需求调整这个正则表达式
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}
