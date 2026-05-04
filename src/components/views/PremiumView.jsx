import { useState } from "react";

function formatRenewalDate(value) {
  if (!value) {
    return "No renewal date";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "No renewal date";
  }
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatPaidDate(value) {
  if (!value) {
    return "Recently";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function loadRazorpayScript() {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }
  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function PremiumView({
  user,
  subscription,
  currentPlanMeta,
  loading,
  actionLoading,
  checkoutLoading,
  confirmLoading,
  error,
  onRefresh,
  onChangePlan,
  onConfirmCheckout,
  onCloseCheckout,
  isAuthenticated,
  onLoginRequest,
}) {
  const [localNotice, setLocalNotice] = useState("");
  const checkoutSession = subscription?.checkoutSession ?? null;
  const isRazorpayCheckout = Boolean(
    checkoutSession?.provider?.toLowerCase().includes("razorpay") &&
      checkoutSession?.keyId &&
      checkoutSession?.gatewayOrderId,
  );

  if (!isAuthenticated) {
    return (
      <section className="glass animate-rise rounded-3xl p-6 text-center">
        <h2 className="font-heading text-2xl text-white">Premium Plans</h2>
        <p className="mt-2 text-sm text-slate-300">Login to manage your subscription and premium visibility tools.</p>
        <button
          onClick={onLoginRequest}
          className="mt-4 rounded-xl bg-gradient-to-r from-coral to-ember px-4 py-2 text-sm font-semibold text-white"
        >
          Login to Continue
        </button>
      </section>
    );
  }

  const handlePlanChange = async (planId) => {
    setLocalNotice("");
    const response = await onChangePlan(planId);
    if (response?.ok && response.requiresCheckout) {
      setLocalNotice("Secure checkout initialized. Complete payment to activate plan.");
    } else if (response?.ok) {
      setLocalNotice("Subscription updated successfully.");
    }
  };

  const handleConfirmCheckout = async () => {
    if (!checkoutSession?.id) {
      return;
    }
    const response = await onConfirmCheckout(checkoutSession.id, {});
    if (response?.ok) {
      setLocalNotice("Payment successful. Premium plan activated.");
    }
  };

  const handleRazorpayCheckout = async () => {
    if (!checkoutSession?.id || !checkoutSession?.gatewayOrderId || !checkoutSession?.keyId) {
      return;
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setLocalNotice("Unable to load Razorpay SDK. Check internet connection.");
      return;
    }

    const options = {
      key: checkoutSession.keyId,
      amount: checkoutSession.amount,
      currency: checkoutSession.currency || "INR",
      name: "Spark Social",
      description: checkoutSession.description || `${checkoutSession.planName} plan`,
      order_id: checkoutSession.gatewayOrderId,
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
      },
      theme: {
        color: "#ff6a3d",
      },
      handler: async (paymentResponse) => {
        const response = await onConfirmCheckout(checkoutSession.id, {
          paymentId: paymentResponse?.razorpay_payment_id || "",
          orderId: paymentResponse?.razorpay_order_id || "",
          signature: paymentResponse?.razorpay_signature || "",
        });

        if (response?.ok) {
          setLocalNotice("Payment successful. Premium plan activated.");
        }
      },
      modal: {
        ondismiss: () => {
          setLocalNotice("Payment cancelled. You can retry checkout.");
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on("payment.failed", () => {
      setLocalNotice("Payment failed. Please try again.");
    });
    razorpay.open();
  };

  return (
    <div className="space-y-6">
      <section className="glass animate-rise rounded-3xl p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-2xl text-white sm:text-3xl">Premium Control</h2>
            <p className="mt-1 text-sm text-slate-300">Upgrade visibility, filters, and engagement controls.</p>
          </div>
          <button
            onClick={onRefresh}
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-slate-100"
          >
            Refresh
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-aqua/30 bg-aqua/10 p-4">
          <p className="text-xs uppercase tracking-[0.15em] text-aqua">Current Plan</p>
          <p className="mt-1 font-heading text-2xl text-white">{currentPlanMeta?.name || "Starter"}</p>
          <p className="mt-1 text-sm text-slate-200">{currentPlanMeta?.priceLabel || "Free"}</p>
          <p className="mt-2 text-xs text-slate-300">
            Status: {(subscription?.status || "free").toUpperCase()} / Renewal: {formatRenewalDate(subscription?.renewsAt)}
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {(subscription?.plans ?? []).map((plan) => (
          <article
            key={plan.id}
            className={`rounded-3xl p-5 ${
              plan.isCurrent
                ? "glass-strong border border-aqua/40 bg-gradient-to-br from-aqua/20 to-cyan-500/10"
                : "glass border border-white/10"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-coral">{plan.name}</p>
                <h3 className="mt-1 font-heading text-3xl text-white">{plan.priceLabel}</h3>
              </div>
              {plan.isCurrent && (
                <span className="rounded-full border border-aqua/35 bg-aqua/20 px-2 py-1 text-[11px] font-semibold text-aqua">
                  Current
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-slate-300">{plan.description}</p>
            <div className="mt-4 space-y-2">
              {(plan.features ?? []).map((feature) => (
                <p key={feature} className="surface-soft rounded-xl px-3 py-2 text-xs text-slate-200">
                  {feature}
                </p>
              ))}
            </div>

            <button
              onClick={() => handlePlanChange(plan.id)}
              disabled={actionLoading || checkoutLoading || confirmLoading || plan.isCurrent}
              className={`mt-5 w-full rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${
                plan.isCurrent
                  ? "border border-white/20 bg-white/10 text-slate-200"
                  : "bg-gradient-to-r from-coral to-ember text-white shadow-glow hover:brightness-110"
              }`}
            >
              {actionLoading || checkoutLoading ? "Processing..." : plan.isCurrent ? "Selected" : `Choose ${plan.name}`}
            </button>
          </article>
        ))}
      </section>

      <section className="glass rounded-3xl p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-heading text-lg text-white">Billing History</h3>
          <p className="text-xs text-slate-400">{(subscription?.billingHistory ?? []).length} records</p>
        </div>
        {(subscription?.billingHistory ?? []).length === 0 ? (
          <p className="surface-soft rounded-2xl px-4 py-4 text-sm text-slate-300">No payment records yet.</p>
        ) : (
          <div className="space-y-2">
            {subscription.billingHistory.map((entry) => (
              <div key={entry.id} className="surface-soft flex flex-wrap items-center justify-between gap-2 rounded-xl px-3 py-3 text-xs">
                <div>
                  <p className="font-semibold text-white">{entry.planName}</p>
                  <p className="text-slate-300">
                    {entry.provider} / {entry.paymentRef}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-aqua">
                    {(entry.currency || "USD").toUpperCase()} {(Number(entry.amount || 0) / 100).toFixed(2)}
                  </p>
                  <p className="text-slate-400">{formatPaidDate(entry.paidAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {loading && <p className="surface-soft rounded-2xl px-4 py-3 text-sm text-slate-300">Loading subscription data...</p>}
      {(error || localNotice) && (
        <p
          className={`rounded-2xl px-4 py-3 text-sm ${
            error ? "border border-red-400/35 bg-red-500/10 text-red-100" : "border border-aqua/30 bg-aqua/10 text-aqua"
          }`}
        >
          {error || localNotice}
        </p>
      )}

      {checkoutSession && (
        <div className="fixed inset-0 z-40 grid place-items-center overflow-y-auto bg-slate-950/75 px-3 py-6">
          <div className="glass-strong max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-aqua">Secure Checkout</p>
                <h3 className="mt-1 font-heading text-2xl text-white">{checkoutSession.planName}</h3>
              </div>
              <button
                onClick={onCloseCheckout}
                disabled={confirmLoading}
                className="rounded-xl border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white disabled:opacity-60"
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <p className="surface-soft rounded-xl px-3 py-2 text-slate-200">Amount: {checkoutSession.amountLabel}</p>
              <p className="surface-soft rounded-xl px-3 py-2 text-slate-200">
                Gateway: {checkoutSession.provider || "Razorpay Sandbox"}
              </p>
              <p className="surface-soft rounded-xl px-3 py-2 text-slate-200">Order Ref: {checkoutSession.orderRef}</p>
              <p className="surface-soft rounded-xl px-3 py-2 text-slate-200">
                Expires: {new Date(checkoutSession.expiresAt).toLocaleTimeString()}
              </p>
            </div>

            {isRazorpayCheckout ? (
              <div className="mt-4 rounded-xl border border-aqua/35 bg-aqua/10 px-3 py-2 text-xs text-aqua">
                Live Razorpay checkout is ready. Click below to pay securely.
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-amber-300/35 bg-amber-300/10 px-3 py-2 text-xs text-amber-100">
                Demo sandbox checkout enabled. Click confirm payment to simulate secure gateway success.
              </div>
            )}

            <button
              onClick={isRazorpayCheckout ? handleRazorpayCheckout : handleConfirmCheckout}
              disabled={confirmLoading}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-coral to-ember px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {confirmLoading ? "Confirming..." : isRazorpayCheckout ? "Pay with Razorpay" : "Confirm Payment"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PremiumView;
