export class User {
  constructor(
    /** Unique identifier for the user */
    public readonly id: string,

    /** User's email address, used for login and sharing */
    public email: string,

    /** Bcrypt-hashed password */
    private passwordHash: string,

    /** Display name */
    public name: string,

    /** Timestamp when the user account was created */
    public readonly createdAt: Date,

    /** Timestamp of the most recent update to the user record */
    public updatedAt: Date,
  ) {}

  getPasswordHash() {
    return this.passwordHash;
  }
}
