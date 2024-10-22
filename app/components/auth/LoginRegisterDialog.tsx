import { useState } from 'react';
import { Dialog, DialogTitle, DialogDescription, DialogRoot } from '~/components/ui/Dialog';
import { Login } from './Login';
import { Register } from './Register';

interface LoginRegisterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export function LoginRegisterDialog({ isOpen, onClose, onLoginSuccess }: LoginRegisterDialogProps) {
  const [isLoginView, setIsLoginView] = useState(true);

  const toggleView = () => setIsLoginView(!isLoginView);

  return (
    <DialogRoot open={isOpen}>
      <Dialog onBackdrop={onClose} onClose={onClose} className="w-full max-w-md">
        <DialogTitle>{isLoginView ? '登录' : '注册'}</DialogTitle>
        <DialogDescription>
          {isLoginView ? (
            <Login onClose={onClose} onLoginSuccess={onLoginSuccess} />
          ) : (
            <Register onClose={onClose} onRegisterSuccess={onLoginSuccess} />
          )}
          <div className="mt-4 text-center">
            <button
              onClick={toggleView}
              className="text-bolt-elements-item-contentAccent hover:underline"
            >
              {isLoginView ? '没有账号？点击注册' : '已有账号？点击登录'}
            </button>
          </div>
        </DialogDescription>
      </Dialog>
    </DialogRoot>
  );
}
