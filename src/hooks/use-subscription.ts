import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface Subscription {
  plan: 'free' | 'pro' | 'team';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  trialEnd?: string;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const fetchSubscription = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (user?.plan) {
        // Calcular fecha de fin del periodo de prueba (14 o 30 días desde ahora)
        const trialDays = user.plan === 'pro' ? 14 : user.plan === 'team' ? 30 : 0;
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + trialDays);
        
        setSubscription({
          plan: user.plan,
          status: trialDays > 0 ? 'trialing' : 'active',
          currentPeriodEnd: trialEnd.toISOString(),
          cancelAtPeriodEnd: false,
          trialEnd: trialDays > 0 ? trialEnd.toISOString() : undefined
        });
      } else {
        setSubscription({
          plan: 'free',
          status: 'active'
        });
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const canAccessFeature = (feature: string): boolean => {
    if (!subscription) return false;

    const features: Record<string, string[]> = {
      free: ['basic_analysis', 'limited_projects'],
      pro: ['basic_analysis', 'limited_projects', 'advanced_analysis', 'deep_analysis', 'memory', 'artifacts'],
      team: ['basic_analysis', 'limited_projects', 'advanced_analysis', 'deep_analysis', 'memory', 'artifacts', 'shared_projects', 'team_members']
    };

    return features[subscription.plan]?.includes(feature) || false;
  };

  return {
    subscription,
    loading,
    canAccessFeature,
    refetch: fetchSubscription
  };
}