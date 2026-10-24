export function cn(...inputs) {
  return inputs.filter(Boolean).flat().join(' ').trim();
}
