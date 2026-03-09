export function validateEmail(email: string): string | null {
  if (!email) return 'メールアドレスを入力してください';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return '有効なメールアドレスを入力してください';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'パスワードを入力してください';
  if (password.length < 8) return 'パスワードは8文字以上にしてください';
  if (!/[a-zA-Z]/.test(password)) return 'パスワードに英字を含めてください';
  if (!/[0-9]/.test(password)) return 'パスワードに数字を含めてください';
  return null;
}

export function validateName(name: string): string | null {
  if (!name.trim()) return '名前を入力してください';
  if (name.trim().length < 2) return '名前は2文字以上にしてください';
  if (name.trim().length > 50) return '名前は50文字以内にしてください';
  return null;
}

export function validateNickname(nickname: string): string | null {
  if (!nickname.trim()) return 'ニックネームを入力してください';
  if (nickname.trim().length > 20) return 'ニックネームは20文字以内にしてください';
  return null;
}

export function validateBio(bio: string): string | null {
  if (bio.length > 500) return '自己紹介は500文字以内にしてください';
  return null;
}

export function validateBandName(name: string): string | null {
  if (!name.trim()) return 'バンド名を入力してください';
  if (name.trim().length > 50) return 'バンド名は50文字以内にしてください';
  return null;
}
