// utils/validateInput.test.ts
import {
  validateNumberInput,
  validateNicknameInput,
} from '../utils/validateInput';

describe('validateNumberInput', () => {
  it('빈 문자열일 경우 status는 empty여야 한다', () => {
    expect(validateNumberInput('')).toEqual({ status: 'empty' });
  });

  it('숫자로 변환 가능한 문자열이면 valid', () => {
    expect(validateNumberInput('123')).toEqual({ status: 'valid', value: 123 });
  });

  it('숫자에 쉼표가 있어도 정상 처리', () => {
    expect(validateNumberInput('1,000')).toEqual({
      status: 'valid',
      value: 1000,
    });
  });

  it('음수 문자열 처리', () => {
    expect(validateNumberInput('-456')).toEqual({
      status: 'valid',
      value: -456,
    });
  });

  it('숫자가 아니면 not-a-number', () => {
    expect(validateNumberInput('abc')).toEqual({ status: 'not-a-number' });
  });

  it('허용 범위 초과 시 exceeds-limit', () => {
    expect(validateNumberInput('99999999999')).toEqual({
      status: 'exceeds-limit',
      value: 99999999999,
    });
  });

  it('하이픈만 입력된 경우 empty', () => {
    expect(validateNumberInput('-')).toEqual({ status: 'empty' });
  });
});

describe('validateNicknameInput', () => {
  it('빈 문자열이면 empty', () => {
    expect(validateNicknameInput('')).toEqual({ status: 'empty' });
  });

  it('12자 이하의 정상 닉네임은 valid-nickname', () => {
    expect(validateNicknameInput('정재영')).toEqual({
      status: 'valid-nickname',
      value: '정재영',
    });
  });

  it('13자 이상이면 exceeds-limit', () => {
    expect(validateNicknameInput('abcdefghijklmn')).toEqual({
      status: 'exceeds-limit',
      value: 14,
    });
  });

  it('특수문자 포함 시 invalid-nickname', () => {
    expect(validateNicknameInput('정재영!')).toEqual({
      status: 'invalid-nickname',
    });
  });

  it('영문, 숫자, 한글만 허용됨', () => {
    expect(validateNicknameInput('abc123한글')).toEqual({
      status: 'valid-nickname',
      value: 'abc123한글',
    });
  });
});
