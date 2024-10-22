import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogDescription, DialogRoot } from '~/components/ui/Dialog';
import { useAuth } from '~/hooks/useAuth';
import { toast } from 'react-toastify';
import type { PurchaseResponse } from '~/routes/api.purchase-token-reload';

interface TokenReloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReloadSuccess: () => void;
}

interface TokenReloadPack {
  _id: string;
  name: string;
  tokens: number;
  price: number;
  description: string;
}



export function TokenReloadModal({ isOpen, onClose, onReloadSuccess }: TokenReloadModalProps) {
  const [tokenReloadPacks, setTokenReloadPacks] = useState<TokenReloadPack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchTokenReloadPacks();
    }
  }, [isOpen]);

  const fetchTokenReloadPacks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/token-reload-packs');
      if (!response.ok) {
        throw new Error('获取代币充值包失败');
      }
      const data = await response.json() as TokenReloadPack[];
      setTokenReloadPacks(data);
    } catch (error) {
      console.error('获取代币充值包时出错:', error);
      toast.error('获取代币充值包失败，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (packId: string) => {
    if (!token) {
      toast.error('登录状态异常，请重新登录');
      return;
    }
    try {
      const response = await fetch('/api/purchase-token-reload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packId }),
      });
      const result = await response.json() as PurchaseResponse;
      if (response.ok && result.success) {
        onReloadSuccess();
        onClose();
      } else {
        toast.error(result.error || '购买代币充值包失败，请稍后重试');
      }
    } catch (error) {
      console.error('Error purchasing token reload pack:', error);
      toast.error('购买代币充值包过程中出现错误，请稍后重试');
    }
  };

  if (isLoading) return null;

  return (
    <DialogRoot open={isOpen}>
      <Dialog onBackdrop={onClose} onClose={onClose} className="w-full max-w-2xl">
        <DialogTitle>购买代币充值包</DialogTitle>
        <DialogDescription>
          <div className="space-y-4">
            {tokenReloadPacks.map((pack) => (
              <div key={pack._id} className="bg-bolt-elements-background-depth-2 p-4 rounded-lg">
                <h3 className="text-bolt-elements-textPrimary font-bold text-lg">{pack.name}</h3>
                <div className="text-bolt-elements-textSecondary mb-2">
                  {(pack.tokens / 1000000).toFixed(0)}M 代币
                </div>
                <p className="text-bolt-elements-textTertiary text-sm mb-4">{pack.description}</p>
                <div className="text-bolt-elements-textPrimary font-bold text-2xl mb-2">
                  ¥{pack.price.toFixed(2)}
                </div>
                <button
                  onClick={() => handlePurchase(pack._id)}
                  className="w-full py-2 rounded-md bg-bolt-elements-button-primary-background text-bolt-elements-button-primary-text"
                >
                  购买
                </button>
              </div>
            ))}
          </div>
        </DialogDescription>
      </Dialog>
    </DialogRoot>
  );
}
