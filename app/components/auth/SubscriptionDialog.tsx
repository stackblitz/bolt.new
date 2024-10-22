import { Dialog, DialogTitle, DialogDescription, DialogRoot } from '~/components/ui/Dialog';

interface SubscriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriptionDialog({ isOpen, onClose }: SubscriptionDialogProps) {
  return (
    <DialogRoot open={isOpen}>
      <Dialog onBackdrop={onClose} onClose={onClose}>
        <DialogTitle>订阅信息</DialogTitle>
        <DialogDescription>
          <div className="space-y-4">
            <p className="text-bolt-elements-textSecondary">
              这里显示用户的订阅信息。您可以根据实际需求添加更多详细内容。
            </p>
            {/* 可以添加更多订阅相关的信息 */}
          </div>
        </DialogDescription>
      </Dialog>
    </DialogRoot>
  );
}
