type FormatResult =
  | { status: 'valid'; value: number }
  | { status: 'not-a-number' }
  | { status: 'exceeds-limit'; value: number }
  | { status: 'empty' }
  | { status: 'valid-nickname'; value: string }
  | { status: 'invalid-nickname' };

export const validateNumberInput = (input: string | number): FormatResult => {
  const raw = String(input).trim();
  if (raw === '') return { status: 'empty' };

  // 유효하지 않은 문자 포함 시 바로 실패
  if (!/^[-\d,]+$/.test(raw)) {
    return { status: 'not-a-number' };
  }

  // 숫자 문자만 정리
  let cleaned = raw.replace(/[^0-9\-]/g, '');
  if (cleaned.includes('-')) {
    cleaned = '-' + cleaned.replace(/-/g, '');
  }

  if (cleaned === '-') return { status: 'empty' };

  const number = Number(cleaned);
  if (isNaN(number)) return { status: 'not-a-number' };

  if (number < -10_000_000_000 || number > 10_000_000_000) {
    return { status: 'exceeds-limit', value: number };
  }

  return { status: 'valid', value: number };
};


export const validateNicknameInput = (input: string): FormatResult => {
  const raw = input.trim();
  if (raw === '') return { status: 'empty' };

  if (raw.length > 12) {
    return { status: 'exceeds-limit', value: raw.length };
  }

  const nicknameRegex = /^[a-zA-Z0-9가-힣]+$/;
  if (!nicknameRegex.test(raw)) {
    return { status: 'invalid-nickname' };
  }

  return { status: 'valid-nickname', value: raw };
};
