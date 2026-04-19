import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  userId: string;
  customerEmail?: string;
  onClose: () => void;
}

export function UnlockCheckout({ userId, customerEmail, onClose }: Props) {
  const fetchClientSecret = async (): Promise<string> => {
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: {
        priceId: "level_3_unlock_onetime",
        userId,
        customerEmail,
        environment: getStripeEnvironment(),
        returnUrl: `${window.location.origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      },
    });
    if (error || !data?.clientSecret) {
      throw new Error(error?.message || "Failed to create checkout session");
    }
    return data.clientSecret;
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto p-4">
      <div className="max-w-2xl mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Unlock Levels 3-5 — $0.99</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-sm px-3 py-1.5 rounded-xl bg-muted"
          >
            ✕ Close
          </button>
        </div>
        <p className="text-muted-foreground mb-6">
          A one-time $0.99 payment unlocks the rest of the game forever. Motivates and supports development. 💛
        </p>
        <div id="checkout" className="rounded-2xl overflow-hidden bg-card">
          <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </div>
    </div>
  );
}
