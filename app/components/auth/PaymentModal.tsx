import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogTitle, DialogDescription, DialogRoot } from '~/components/ui/Dialog';
import { toast } from 'react-toastify';
import { useAuth } from '~/hooks/useAuth'; // 导入 useAuth hook

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentData: PaymentResponse;
  onPaymentSuccess: () => void;
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
  orderNo: string;
}

interface PaymentStatusResponse {
  status: string;
  error?: string;
}

export function PaymentModal({ isOpen, onClose, paymentData, onPaymentSuccess }: PaymentModalProps) {
  const [timeLeft, setTimeLeft] = useState(parseInt(paymentData.expires_in));
  const { token } = useAuth(); // 获取认证token

  const checkPaymentStatus = useCallback(async () => {
    if (!token) {
      console.error('No authentication token available');
      return;
    }

    try {
      const response = await fetch(`/api/check-payment-status?orderNo=${paymentData.orderNo}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 404) {
          console.error('Order not found');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json() as PaymentStatusResponse;
      if (data.status === 'completed') {
        onPaymentSuccess();
        onClose();
        toast.success('支付成功！');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      toast.error('检查支付状态时出错，请稍后再试');
    }
  }, [paymentData.orderNo, onPaymentSuccess, onClose, token]);

  useEffect(() => {
    if (!isOpen) return;

    let timer: NodeJS.Timeout;

    const checkAndUpdateStatus = () => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          onClose();
          toast.error('支付超时，请重新发起支付');
          return 0;
        }
        return prevTime - 1;
      });

      checkPaymentStatus();
    };

    timer = setInterval(checkAndUpdateStatus, 3000); // 每3秒检查一次支付状态

    return () => clearInterval(timer);
  }, [isOpen, onClose, checkPaymentStatus]);

  return (
    <DialogRoot open={isOpen}>
      <Dialog onBackdrop={onClose} onClose={onClose} className="w-full max-w-md">
        <DialogTitle>请扫码支付</DialogTitle>
        <DialogDescription>
          <div className="space-y-4">
            <div className="text-center">
              <img src={paymentData.qr_img} alt="支付二维码" className="mx-auto" />
            </div>
            <div className="text-center">
              <p className="text-bolt-elements-textPrimary">订单金额: ¥{paymentData.order_amount}</p>
              <p className="text-bolt-elements-textSecondary">订单号: {paymentData.orderNo}</p>
              <p className="text-bolt-elements-textSecondary">支付方式: {paymentData.pay_type}</p>
            </div>
            <div className="text-center">
              <p className="text-bolt-elements-textPrimary">剩余支付时间: {timeLeft}秒</p>
            </div>
          </div>
        </DialogDescription>
      </Dialog>
    </DialogRoot>
  );
}
