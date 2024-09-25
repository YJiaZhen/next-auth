import { pool } from './db';


console.log("Initializing PostgresAdapter")

export default function PostgresAdapter() {
  return {
    async createUser(user) {
      console.log("PostgresAdapter: createUser", user)
      const { name, email, emailVerified, image } = user;
      const { rows } = await pool.query(
        'INSERT INTO users (name, email, email_verified, image) VALUES ($1, $2, $3, $4) RETURNING id, name, email, email_verified, image',
        [name, email, emailVerified, image]
      );
      
      // 將 email_verified 轉換回 emailVerified
      if (rows[0].email_verified) {
        rows[0].emailVerified = rows[0].email_verified;
        delete rows[0].email_verified;
      }
      
      return rows[0];
    },
    async getUser(id) {
      console.log("PostgresAdapter: getUser", id)
      const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      return rows[0] || null;
    },
    async getUserByEmail(email) {
      console.log("PostgresAdapter: getUserByEmail", email)
      const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      return rows[0] || null;
    },
    async getUserByAccount({ providerAccountId, provider }) {
      const { rows } = await pool.query(
        'SELECT users.* FROM users JOIN accounts ON users.id = accounts.user_id WHERE accounts.provider_id = $1 AND accounts.provider_account_id = $2',
        [provider, providerAccountId]
      );
      return rows[0] || null;
    },
    async updateUser(user) {
      const { id, ...updateData } = user;
      
      // 將 emailVerified 轉換為 email_verified
      if ('emailVerified' in updateData) {
        updateData.email_verified = updateData.emailVerified;
        delete updateData.emailVerified;
      }

      // 移除所有 undefined 或 null 的欄位
      Object.keys(updateData).forEach(key => 
        (updateData[key] === undefined || updateData[key] === null) && delete updateData[key]
      );
    
      // 如果沒有需要更新的欄位，直接返回原始用戶數據
      if (Object.keys(updateData).length === 0) {
        return user;
      }
    
      const setClause = Object.keys(updateData)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');
    
      const values = [id, ...Object.values(updateData)];
    
      const { rows } = await pool.query(
        `UPDATE users SET ${setClause} WHERE id = $1 RETURNING *`,
        values
      );
      // 將 email_verified 轉換回 emailVerified
      if (rows[0].email_verified) {
        rows[0].emailVerified = rows[0].email_verified;
        delete rows[0].email_verified;
      }

    
      return rows[0];
    },
    async deleteUser(userId) {
      await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    },
    async linkAccount(account) {
      console.log("Linking account:", account);
      const { provider, providerAccountId, userId, ...accountData } = account;
      const result = await pool.query(
        'INSERT INTO accounts (user_id, provider_id, provider_account_id, access_token, refresh_token, expires_at, token_type, scope, id_token) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        [userId, provider, providerAccountId, accountData.access_token, accountData.refresh_token, accountData.expires_at, accountData.token_type, accountData.scope, accountData.id_token]
      );
      console.log("Account linked:", result.rows[0]);
      return result.rows[0];
    },
    async unlinkAccount({ providerAccountId, provider }) {
      await pool.query(
        'DELETE FROM accounts WHERE provider_id = $1 AND provider_account_id = $2',
        [provider, providerAccountId]
      );
    },
    async createSession(session) {
      console.log("createSession called with", session);
      const { rows } = await pool.query(
        'INSERT INTO sessions (user_id, expires, session_token) VALUES ($1, $2, $3) RETURNING id, session_token, user_id, expires',
        [session.userId, session.expires, session.sessionToken]
      );
      console.log("createSession result", rows[0]);
      return rows[0];
    },
    async getSessionAndUser(sessionToken) {
      console.log("getSessionAndUser called with", sessionToken);
      const { rows } = await pool.query(
        'SELECT sessions.*, users.* FROM sessions JOIN users ON sessions.user_id = users.id WHERE sessions.session_token = $1',
        [sessionToken]
      );
      console.log("getSessionAndUser result", rows[0]);
      if (rows[0]) {
        const { id, name, email, email_verified, image, ...session } = rows[0];
        return {
          session,
          user: { id, name, email, emailVerified: email_verified, image }
        };
      }
      return null;
    },
    async createSession(session) {
      console.log("createSession called with", session);
      const { sessionToken, userId, expires } = session;
      const { rows } = await pool.query(
        'INSERT INTO sessions (user_id, expires, session_token) VALUES ($1, $2, $3) RETURNING id, session_token, user_id, expires',
        [userId, expires, sessionToken]
      );
      console.log("createSession result", rows[0]);
      return rows[0];
    },
    async deleteSession(sessionToken) {
      await pool.query('DELETE FROM sessions WHERE session_token = $1', [sessionToken]);
    },
    async createVerificationToken(verificationToken) {
      const { rows } = await pool.query(
        'INSERT INTO verification_tokens (identifier, expires, token) VALUES ($1, $2, $3) RETURNING identifier, expires, token',
        [verificationToken.identifier, verificationToken.expires, verificationToken.token]
      );
      return rows[0];
    },
    async useVerificationToken({ identifier, token }) {
      const { rows } = await pool.query(
        'DELETE FROM verification_tokens WHERE identifier = $1 AND token = $2 RETURNING identifier, expires, token',
        [identifier, token]
      );
      return rows[0] || null;
    },
  };
}

console.log("PostgresAdapter initialized")