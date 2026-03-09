'use client';

import { useState } from 'react';
import { SUBSCRIPTION_PLANS } from '@/lib/constants';
import { useAuth } from '@/lib/auth';
import { GlassCard, Card, Badge, Button, Modal, Input } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { SubscriptionPlan } from '@/lib/types';

const PLAN_ORDER: SubscriptionPlan[] = ['free', 'basic', 'premium'];

const PLAN_COLORS: Record<SubscriptionPlan, { gradient: string; badge: 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' }> = {
  free: { gradient: 'from-gray-500 to-gray-600', badge: 'default' },
  basic: { gradient: 'from-primary to-secondary', badge: 'primary' },
  premium: { gradient: 'from-amber-500 to-orange-500', badge: 'warning' },
};

const FEATURE_COMPARISON = [
  { label: 'プロフィール作成', free: true, basic: true, premium: true },
  { label: 'マッチング検索', free: '1日3回', basic: '無制限', premium: '無制限 + 優先' },
  { label: 'コミュニティ閲覧', free: true, basic: true, premium: true },
  { label: 'イベント閲覧', free: true, basic: true, premium: true },
  { label: 'バンド作成', free: '1つ', basic: '3つまで', premium: '無制限' },
  { label: 'メッセージ', free: '10件/月', basic: '無制限', premium: '無制限' },
  { label: 'イベント作成', free: false, basic: true, premium: true },
  { label: '練習ログ機能', free: false, basic: true, premium: true },
  { label: 'マイルストーン機能', free: false, basic: true, premium: true },
  { label: 'アナリティクス', free: false, basic: false, premium: true },
  { label: 'プレミアムバッジ', free: false, basic: false, premium: true },
  { label: 'イベント優先掲載', free: false, basic: false, premium: true },
];

export default function SubscriptionPage() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const currentPlan = user?.subscription || 'free';

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (plan === currentPlan) return;
    if (plan === 'free') {
      updateUser({ subscription: 'free' });
      showToast('Freeプランに変更しました', 'info');
      return;
    }
    setSelectedPlan(plan);
    setIsModalOpen(true);
    setPaymentSuccess(false);
    setCardNumber('');
    setExpiry('');
    setCvc('');
  };

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;

    const cleanCard = cardNumber.replace(/\s/g, '');
    if (cleanCard.length < 14) {
      showToast('カード番号を正しく入力してください', 'error');
      return;
    }
    if (expiry.length < 5) {
      showToast('有効期限を正しく入力してください', 'error');
      return;
    }
    if (cvc.length < 3) {
      showToast('CVCを正しく入力してください', 'error');
      return;
    }

    setProcessing(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    updateUser({ subscription: selectedPlan });
    setProcessing(false);
    setPaymentSuccess(true);
    showToast(`${SUBSCRIPTION_PLANS[selectedPlan].name}プランに変更しました！`, 'success');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
    setPaymentSuccess(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-light to-secondary bg-clip-text text-transparent">
          プランを選択
        </h1>
        <p className="text-text-secondary text-sm mt-2">
          あなたの音楽活動に合ったプランをお選びください
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLAN_ORDER.map((planKey) => {
          const plan = SUBSCRIPTION_PLANS[planKey];
          const isCurrent = currentPlan === planKey;
          const colors = PLAN_COLORS[planKey];

          return (
            <GlassCard
              key={planKey}
              className={`relative flex flex-col ${
                isCurrent ? 'ring-2 ring-primary/50' : ''
              } ${planKey === 'basic' ? 'md:-mt-4 md:mb-[-16px]' : ''}`}
              gradientBorder={planKey === 'basic'}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="success" size="sm">
                    現在のプラン
                  </Badge>
                </div>
              )}

              {planKey === 'basic' && !isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="primary" size="sm">
                    おすすめ
                  </Badge>
                </div>
              )}

              <div className="text-center mb-6 pt-2">
                <h2 className="text-xl font-bold text-foreground">{plan.name}</h2>
                <div className="mt-3">
                  {plan.price === 0 ? (
                    <span className="text-3xl font-bold text-foreground">無料</span>
                  ) : (
                    <div>
                      <span className="text-3xl font-bold text-foreground">
                        ¥{plan.price.toLocaleString()}
                      </span>
                      <span className="text-text-muted text-sm">/月</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2">
                    <svg className={`w-4 h-4 mt-0.5 shrink-0 ${
                      planKey === 'premium' ? 'text-amber-400' : planKey === 'basic' ? 'text-primary-light' : 'text-text-muted'
                    }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-text-secondary">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                fullWidth
                variant={isCurrent ? 'ghost' : planKey === 'basic' ? 'primary' : 'secondary'}
                disabled={isCurrent}
                onClick={() => handleSelectPlan(planKey)}
              >
                {isCurrent ? '現在のプラン' : 'プランを選択'}
              </Button>
            </GlassCard>
          );
        })}
      </div>

      <GlassCard>
        <h2 className="font-semibold text-lg mb-6 text-center">機能比較</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-light">
                <th className="text-left py-3 px-2 text-text-muted font-medium">機能</th>
                {PLAN_ORDER.map((planKey) => (
                  <th
                    key={planKey}
                    className={`text-center py-3 px-2 font-medium ${
                      planKey === currentPlan ? 'text-primary-light' : 'text-text-secondary'
                    }`}
                  >
                    {SUBSCRIPTION_PLANS[planKey].name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURE_COMPARISON.map((feature) => (
                <tr key={feature.label} className="border-b border-border-light/50">
                  <td className="py-3 px-2 text-text-secondary">{feature.label}</td>
                  {PLAN_ORDER.map((planKey) => {
                    const value = feature[planKey];
                    return (
                      <td key={planKey} className="text-center py-3 px-2">
                        {value === true ? (
                          <svg className="w-5 h-5 text-emerald-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : value === false ? (
                          <svg className="w-5 h-5 text-text-muted/30 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : (
                          <span className="text-text-secondary text-xs">{value}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={paymentSuccess ? '完了' : 'お支払い'}
        size="sm"
      >
        {paymentSuccess ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-foreground">お支払い完了</h3>
            <p className="text-text-secondary text-sm">
              {selectedPlan && SUBSCRIPTION_PLANS[selectedPlan].name}プランへの変更が完了しました。
              <br />
              新しい機能をお楽しみください。
            </p>
            <Button fullWidth onClick={closeModal}>
              閉じる
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedPlan && (
              <Card padding="sm">
                <div className="flex items-center justify-between">
                  <span className="text-foreground font-medium">
                    {SUBSCRIPTION_PLANS[selectedPlan].name}プラン
                  </span>
                  <span className="text-foreground font-bold">
                    ¥{SUBSCRIPTION_PLANS[selectedPlan].price.toLocaleString()}/月
                  </span>
                </div>
              </Card>
            )}

            <Input
              label="カード番号"
              placeholder="4242 4242 4242 4242"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              maxLength={19}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="有効期限"
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                maxLength={5}
              />
              <Input
                label="CVC"
                placeholder="123"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                maxLength={4}
                type="password"
              />
            </div>

            <div className="pt-2 space-y-3">
              <Button
                fullWidth
                onClick={handlePayment}
                loading={processing}
              >
                {processing ? '処理中...' : `¥${selectedPlan ? SUBSCRIPTION_PLANS[selectedPlan].price.toLocaleString() : 0}を支払う`}
              </Button>
              <Button fullWidth variant="ghost" onClick={closeModal}>
                キャンセル
              </Button>
            </div>

            <p className="text-text-muted text-xs text-center">
              これはデモ用の画面です。実際の決済は行われません。
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
