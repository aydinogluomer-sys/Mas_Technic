/* QA 09a-R3 — inert stand-in for `@/integrations/supabase/client`.
 *
 * The chatbot pool probe must not be able to reach the customer's project even
 * by accident, so the real client is never constructed. Every method throws;
 * nothing in the pool-assembly path calls one, and if that ever changes the
 * probe fails loudly instead of opening a socket.
 */
const deny = () => {
  throw new Error("QA probe: the Supabase client is stubbed. No production call is permitted.");
};

export const supabase = new Proxy({}, { get: deny, apply: deny });
