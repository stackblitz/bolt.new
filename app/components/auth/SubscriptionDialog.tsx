import { Dialog, DialogTitle, DialogDescription, DialogRoot } from '~/components/ui/Dialog';
import { useState } from 'react';
import { useAuth } from '~/hooks/useAuth';

interface SubscriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SubscriptionPlan {
  name: string;
  tokens: number;
  price: number;
  description: string;
  savePercentage?: number;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    name: "专业版",
    tokens: 10000000,
    price: 20,
    description: "适合业余爱好者和轻度用户进行探索性使用。"
  },
  {
    name: "专业版 50",
    tokens: 26000000,
    price: 50,
    description: "为每周需要使用多八多几次的专业人士设计。",
    savePercentage: 3
  },
  {
    name: "专业版 100",
    tokens: 55000000,
    price: 100,
    description: "适合希望提升日常工作流程的重度用户。",
    savePercentage: 9
  },
  {
    name: "专业版 200",
    tokens: 120000000,
    price: 200,
    description: "最适合将多八多作为核心工具持续使用的超级用户。",
    savePercentage: 17
  }
];

export function SubscriptionDialog({ isOpen, onClose }: SubscriptionDialogProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { user } = useAuth();

  if (!user) return null;

  const currentPlan = subscriptionPlans[1]; // 假设当前用户使用的是"专业版 50"

  return (
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

            <div className="bg-bolt-elements-background-depth-2 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-bolt-elements-textPrimary font-bold">300万</span>
                  <span className="text-bolt-elements-textSecondary"> 代币剩余。</span>
                  <span className="text-bolt-elements-textSecondary">2600万代币将在17天后添加。</span>
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
                <div key={plan.name} className={`bg-bolt-elements-background-depth-2 p-4 rounded-lg ${plan.name === currentPlan.name ? 'border-2 border-bolt-elements-item-contentAccent' : ''}`}>
                  <h3 className="text-bolt-elements-textPrimary font-bold text-lg">{plan.name}</h3>
                  <div className="text-bolt-elements-textSecondary mb-2">
                    {(plan.tokens / 1000000).toFixed(0)}M 代币
                    {plan.savePercentage && (
                      <span className="ml-2 text-green-500">节省 {plan.savePercentage}%</span>
                    )}
                  </div>
                  <p className="text-bolt-elements-textTertiary text-sm mb-4">{plan.description}</p>
                  <div className="text-bolt-elements-textPrimary font-bold text-2xl mb-2">
                    ¥{plan.price * (billingCycle === 'yearly' ? 10 : 1)}/{billingCycle === 'yearly' ? '年' : '月'}
                  </div>
                  <button
                    className={`w-full py-2 rounded-md ${
                      plan.name === currentPlan.name
                        ? 'bg-bolt-elements-button-secondary-background text-bolt-elements-button-secondary-text'
                        : 'bg-bolt-elements-button-primary-background text-bolt-elements-button-primary-text'
                    }`}
                  >
                    {plan.name === currentPlan.name ? '管理当前计划' : `升级到${plan.name}`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </DialogDescription>
      </Dialog>
    </DialogRoot>
  );
}
