export function normalizeSaudiPhone(value: string | null | undefined) {
  const digits = (value ?? "").replace(/[^\d]/g, "");
  let raw = digits;

  if (raw.startsWith("00966")) raw = raw.slice(5);
  else if (raw.startsWith("966")) raw = raw.slice(3);

  if (raw.startsWith("0")) raw = raw.slice(1);

  return /^5\d{8}$/.test(raw) ? `966${raw}` : null;
}

export function formatPhoneDisplay(phone: string) {
  const match = /^966(5\d{8})$/.exec(phone);
  if (!match) return phone;

  const digits = match[1];
  return `+966 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
}

export function phoneForWhatsApp(phone: string) {
  return phone.replace(/[^\d]/g, "");
}
