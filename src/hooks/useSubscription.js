import { useCallback, useEffect, useMemo, useState } from "react";
import { subscriptionService } from "../services/subscriptionService";

const EMPTY_SUBSCRIPTION = {
  currentPlan: "starter",
  status: "free",
  renewsAt: null,
  plans: [],
  billingHistory: [],
  checkoutSession: null,
};

export function useSubscription(token, isAuthenticated, user, onUserSynced) {
  const [subscription, setSubscription] = useState(EMPTY_SUBSCRIPTION);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [error, setError] = useState("");

  const applySubscriptionResponse = useCallback(
    (response, fallbackPlanId = "starter") => {
      setSubscription((previous) => ({
        currentPlan: response?.currentPlan || fallbackPlanId || previous.currentPlan || "starter",
        status: response?.status || previous.status || "free",
        renewsAt: response?.renewsAt || null,
        plans: Array.isArray(response?.plans) ? response.plans : previous.plans ?? [],
        billingHistory: Array.isArray(response?.billingHistory) ? response.billingHistory : previous.billingHistory ?? [],
        checkoutSession:
          response?.checkoutSession !== undefined
            ? response.checkoutSession
            : previous.checkoutSession ?? null,
      }));
    },
    [],
  );

  const refreshSubscription = useCallback(
    async (options = {}) => {
      const { background = false } = options;

      if (!isAuthenticated || !token) {
        setSubscription(EMPTY_SUBSCRIPTION);
        setError("");
        return EMPTY_SUBSCRIPTION;
      }

      if (!background) {
        setLoading(true);
      }
      setError("");

      try {
        const response = await subscriptionService.getSubscription(token);
        applySubscriptionResponse(response, response?.currentPlan || "starter");
        return response;
      } catch (apiError) {
        setError(apiError?.message ?? "Unable to load subscription data.");
        return EMPTY_SUBSCRIPTION;
      } finally {
        if (!background) {
          setLoading(false);
        }
      }
    },
    [applySubscriptionResponse, isAuthenticated, token],
  );

  const changePlan = useCallback(
    async (planId) => {
      if (!planId || !isAuthenticated || !token || actionLoading || checkoutLoading || confirmLoading) {
        return { ok: false };
      }

      if (planId === "starter") {
        setActionLoading(true);
        setError("");
        try {
          const response = await subscriptionService.updateSubscription(token, { planId });
          applySubscriptionResponse(response, "starter");
          if (typeof onUserSynced === "function" && response?.user) {
            onUserSynced(response.user);
          }
          return { ok: true, requiresCheckout: false, user: response?.user ?? null };
        } catch (apiError) {
          setError(apiError?.message ?? "Unable to change subscription.");
          return { ok: false };
        } finally {
          setActionLoading(false);
        }
      }

      setCheckoutLoading(true);
      setError("");
      try {
        const response = await subscriptionService.createCheckout(token, { planId });
        setSubscription((previous) => ({
          ...previous,
          checkoutSession: response?.session ?? null,
        }));
        return { ok: true, requiresCheckout: true, session: response?.session ?? null };
      } catch (apiError) {
        setError(apiError?.message ?? "Unable to start checkout.");
        return { ok: false };
      } finally {
        setCheckoutLoading(false);
      }
    },
    [actionLoading, applySubscriptionResponse, checkoutLoading, confirmLoading, isAuthenticated, onUserSynced, token],
  );

  const confirmCheckout = useCallback(
    async (sessionId, paymentPayload = {}) => {
      if (!sessionId || !isAuthenticated || !token || confirmLoading) {
        return { ok: false };
      }

      setConfirmLoading(true);
      setError("");
      try {
        const response = await subscriptionService.confirmCheckout(token, { sessionId, ...paymentPayload });
        applySubscriptionResponse(response, response?.currentPlan || "starter");
        if (typeof onUserSynced === "function" && response?.user) {
          onUserSynced(response.user);
        }
        return { ok: true, user: response?.user ?? null, payment: response?.payment ?? null };
      } catch (apiError) {
        setError(apiError?.message ?? "Unable to confirm payment.");
        return { ok: false };
      } finally {
        setConfirmLoading(false);
      }
    },
    [applySubscriptionResponse, confirmLoading, isAuthenticated, onUserSynced, token],
  );

  const closeCheckout = useCallback(() => {
    setSubscription((previous) => ({
      ...previous,
      checkoutSession: null,
    }));
  }, []);

  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  const currentPlanMeta = useMemo(() => {
    const target = subscription.plans.find((plan) => plan.id === subscription.currentPlan);
    if (target) {
      return target;
    }
    return {
      id: user?.subscriptionPlan || "starter",
      name: user?.subscriptionPlanMeta?.name || "Starter",
      priceLabel: user?.subscriptionPlanMeta?.priceLabel || "Free",
      description: user?.subscriptionPlanMeta?.description || "Core Spark access",
      features: Array.isArray(user?.subscriptionPlanMeta?.features) ? user.subscriptionPlanMeta.features : [],
      isCurrent: true,
    };
  }, [subscription.currentPlan, subscription.plans, user?.subscriptionPlan, user?.subscriptionPlanMeta]);

  return {
    subscription,
    currentPlanMeta,
    loading,
    actionLoading,
    checkoutLoading,
    confirmLoading,
    error,
    refreshSubscription,
    changePlan,
    confirmCheckout,
    closeCheckout,
  };
}
