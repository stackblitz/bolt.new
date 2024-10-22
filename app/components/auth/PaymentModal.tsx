import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogTitle, DialogDescription, DialogRoot } from '~/components/ui/Dialog';
import { toast } from 'react-toastify';

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
}

export function PaymentModal({ isOpen, onClose, paymentData, onPaymentSuccess }: PaymentModalProps) {
  const [timeLeft, setTimeLeft] = useState(parseInt(paymentData.expires_in));

  const checkPaymentStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/check-payment-status?orderNo=${paymentData.no}`);
      const data = await response.json();
      if (data.status === 'completed') {
        clearInterval(timer);
        onPaymentSuccess();
        onClose();
        toast.success('支付成功！');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  }, [paymentData.no, onPaymentSuccess, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
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
    }, 3000); // 每3秒检查一次支付状态

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
              <p className="text-bolt-elements-textSecondary">订单号: {paymentData.no}</p>
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
