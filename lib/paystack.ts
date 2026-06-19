export const paystack = {
  secretKey: process.env.PAYSTACK_SECRET_KEY!,
  baseUrl: "https://api.paystack.co",
};

export const paystackFetch = (endpoint: string, options: RequestInit = {}) => {
  return fetch(`${paystack.baseUrl}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${paystack.secretKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
};
