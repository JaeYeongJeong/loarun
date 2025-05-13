type FormatResult =
  | { status: 'valid'; value: number }
  | { status: 'not-a-number' }
  | { status: 'exceeds-limit'; value: number }
  | { status: 'empty' };

export const validateNumberInput = (input: string | number): FormatResult => {
  const raw = String(input).trim();
  if (raw === '') return { status: 'empty' };

  // 숫자와 -만 남기기
  let cleaned = raw.replace(/[^0-9\-]/g, '');

  // -가 여러 개 있는 경우 맨 앞 하나만 허용
  if (cleaned.includes('-')) {
    cleaned = '-' + cleaned.replace(/-/g, '');
  }

  // 사용자가 '-'만 입력했을 경우: 아직 입력 중
  if (cleaned === '-') return { status: 'empty' };

  const number = Number(cleaned);
  if (isNaN(number)) return { status: 'not-a-number' };

  if (number < -10_000_000_000 || number > 10_000_000_000) {
    return { status: 'exceeds-limit', value: number };
  }

  return { status: 'valid', value: number };
};
