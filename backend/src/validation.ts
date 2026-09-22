export function validAlias(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const alias = value.trim().replace(/\s+/g, ' ');
  return alias.length >= 2 && alias.length <= 24 ? alias : null;
}

export function validRoomName(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const name = value.trim().replace(/\s+/g, ' ');
  return name.length >= 2 && name.length <= 50 ? name : null;
}

export function validMessage(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const body = value.trim();
  return body.length >= 1 && body.length <= 1000 ? body : null;
}

export function validClientId(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f-]{36}$/i.test(value);
}

export function validRoomId(value: unknown): value is string {
  return value === 'global' || (typeof value === 'string' && /^[0-9a-f-]{36}$/i.test(value));
}
