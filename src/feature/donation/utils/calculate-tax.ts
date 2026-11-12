export function calculateTax(amount: number): number {
  let amountToPay: number;

  if (amount < 100000) {
    amountToPay = Math.ceil((amount + 300) / (1 - 0.007));
  } else {
    amountToPay = Math.ceil(amount / (1 - 0.01));
  }

  return amountToPay;
}
