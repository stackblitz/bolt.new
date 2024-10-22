import { Dialog, DialogTitle, DialogDescription, DialogRoot } from '~/components/ui/Dialog';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '~/hooks/useAuth';
import { toast } from 'react-toastify';
import { PaymentModal } from './PaymentModal';
import type { SubscriptionPlan } from '~/types/subscription';

interface SubscriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserSubscription {
  plan: SubscriptionPlan;
  tokensLeft: number;
  nextReloadDate: string;
}

interface PaymentResponse {
  status: string;
  msg: string;
  no: string;
  pay_type: string;
  order_amount: string;
  pay_amount: string;
  qr_money: string;
  qr: string;
  qr_img: string;
  did: string;
  expires_in: string;
  return_url: string;
}

interface PurchaseResponse {
  success: boolean;
  paymentData?: PaymentResponse;
  error?: string;
}

export function SubscriptionDialog({ isOpen, onClose }: SubscriptionDialogProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchSubscriptionData();
    }
  }, [isOpen]);

  const fetchSubscriptionData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/subscription-plans');
      if (!response.ok) {
        throw new Error('获取订阅计划失败');
      }
      const data = await response.json() as SubscriptionPlan[];
      setSubscriptionPlans(data);

      const userSubResponse = await fetch('/api/user-subscription');
      const userSub = await userSubResponse.json() as UserSubscription;
      setUserSubscription(userSub);
    } catch (error) {
      console.error('获取订阅数据时出错:', error);
      toast.error('获取订阅信息失败，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (planId: string) => {
    try {
      const response = await fetch('/api/purchase-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          billingCycle,
        }),
      });
      const result = await response.json() as PurchaseResponse;
      if (response.ok && result.success && result.paymentData) {
        setPaymentData(result.paymentData);
      } else {
        toast.error(result.error || '获取支付信息失败,请稍后重试。');
      }
    } catch (error) {
      console.error('Error initiating purchase:', error);
      toast.error('购买过程中出现错误,请稍后重试。');
    }
  };

  const handlePaymentSuccess = useCallback(() => {
    fetchSubscriptionData(); // 重新获取订阅信息
    toast.success('订阅成功！');
  }, [fetchSubscriptionData]);

  // 类型守卫函数
  function isSubscriptionPlan(plan: any): plan is SubscriptionPlan {
    return (
      typeof plan === 'object' &&
      typeof plan._id === 'string' &&
      typeof plan.name === 'string' &&
      typeof plan.tokens === 'number' &&
      typeof plan.price === 'number' &&
      typeof plan.description === 'string' &&
      (plan.save_percentage === null || typeof plan.save_percentage === 'number')
    );
  }

  if (!user || isLoading) return null;

  return (
    <>
      <DialogRoot open={isOpen}>
        <Dialog onBackdrop={onClose} onClose={onClose} className="w-full max-w-4xl">
          <DialogTitle>订阅管理</DialogTitle>
          <DialogDescription>
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-bolt-elements-textSecondary">
                  注册免费账户以加速您在公共项目上的工作流程，或通过即时打开的生产环境提升整个团队的效率。
                </p>
              </div>

              {userSubscription && (
                <div className="bg-bolt-elements-background-depth-2 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-bolt-elements-textPrimary font-bold">{userSubscription.tokensLeft.toLocaleString()}</span>
                      <span className="text-bolt-elements-textSecondary"> 代币剩余。</span>
                      <span className="text-bolt-elements-textSecondary">
                        {userSubscription.plan.tokens.toLocaleString()}代币将在{new Date(userSubscription.nextReloadDate).toLocaleDateString()}后添加。
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-bolt-elements-textSecondary">需要更多代币？</span>
                      <br />
                      <span className="text-bolt-elements-textSecondary">
                        升级您的计划或购买
                        <a href="#" className="text-bolt-elements-item-contentAccent hover:underline">代币充值包</a>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-2 rounded-md ${
                    billingCycle === 'monthly'
                      ? 'bg-bolt-elements-button-primary-background text-bolt-elements-button-primary-text'
                      : 'bg-bolt-elements-button-secondary-background text-bolt-elements-button-secondary-text'
                  }`}
                >
                  月付
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-4 py-2 rounded-md ${
                    billingCycle === 'yearly'
                      ? 'bg-bolt-elements-button-primary-background text-bolt-elements-button-primary-text'
                      : 'bg-bolt-elements-button-secondary-background text-bolt-elements-button-secondary-text'
                  }`}
                >
                  年付
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {subscriptionPlans.map((plan) => (
                  <div key={plan._id} className={`bg-bolt-elements-background-depth-2 p-4 rounded-lg ${plan._id === userSubscription?.plan._id ? 'border-2 border-bolt-elements-item-contentAccent' : ''}`}>
                    <h3 className="text-bolt-elements-textPrimary font-bold text-lg">{plan.name}</h3>
                    <div className="text-bolt-elements-textSecondary mb-2">
                      {(plan.tokens / 1000000).toFixed(0)}M 代币
                      {plan.save_percentage && (
                        <span className="ml-2 text-green-500">节省 {plan.save_percentage}%</span>
                      )}
                    </div>
                    <p className="text-bolt-elements-textTertiary text-sm mb-4">{plan.description}</p>
                    <div className="text-bolt-elements-textPrimary font-bold text-2xl mb-2">
                      ¥{plan.price * (billingCycle === 'yearly' ? 10 : 1)}/{billingCycle === 'yearly' ? '年' : '月'}
                    </div>
                    <button
                      onClick={() => handlePurchase(plan._id)}
                      className={`w-full py-2 rounded-md ${
                        plan._id === userSubscription?.plan._id
                          ? 'bg-bolt-elements-button-secondary-background text-bolt-elements-button-secondary-text'
                          : 'bg-bolt-elements-button-primary-background text-bolt-elements-button-primary-text'
                      }`}
                    >
                      {plan._id === userSubscription?.plan._id ? '管理当前计划' : `升级到${plan.name}`}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </DialogDescription>
        </Dialog>
      </DialogRoot>
      {paymentData && (
        <PaymentModal
          isOpen={!!paymentData}
          onClose={() => setPaymentData(null)}
          paymentData={paymentData}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}
