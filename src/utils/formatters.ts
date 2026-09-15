export function formatAED(amount: number): string {
  if (amount >= 1_000_000) {
    const millions = (amount / 1_000_000).toFixed(1).replace(/\.0$/, '');
    return `AED ${millions}M`;
  }
  return `AED ${amount.toLocaleString()}`;
}

export function formatFullAED(amount: number): string {
  return `AED ${amount.toLocaleString()}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}
