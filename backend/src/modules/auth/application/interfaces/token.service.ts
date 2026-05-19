export abstract class TokenService {
  abstract generate(payload: { sub: string; email: string }): Promise<string>;
}
