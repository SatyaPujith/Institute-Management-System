# 🔒 Security Guide

## Environment Variables

All sensitive configuration must be stored in environment variables. **Never commit sensitive data to the repository.**

### Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name

# Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# Payment Gateway (Optional)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Application Environment
NODE_ENV=development
```

### Security Requirements

#### MongoDB URI
- **Format**: `mongodb+srv://username:password@cluster.mongodb.net/database_name`
- **Security**: Use strong passwords with special characters
- **URL Encoding**: Encode special characters (@ becomes %40, etc.)
- **Network**: Whitelist your IP addresses in MongoDB Atlas

#### JWT Secret
- **Length**: Minimum 32 characters
- **Complexity**: Use a cryptographically secure random string
- **Generation**: Use `openssl rand -base64 32` or similar
- **Rotation**: Change periodically in production

#### Razorpay Keys
- **Test vs Live**: Use test keys for development, live keys for production
- **Webhook Secret**: Store webhook secret securely
- **IP Whitelisting**: Configure IP restrictions in Razorpay dashboard

## Security Best Practices

### 1. Environment Configuration

**✅ DO:**
- Use `.env` files for local development
- Use environment variables in production
- Keep `.env` in `.gitignore`
- Use different credentials for different environments

**❌ DON'T:**
- Commit `.env` files to version control
- Use hardcoded credentials in source code
- Share credentials in chat/email
- Use production credentials in development

### 2. Database Security

**✅ DO:**
- Use MongoDB Atlas with IP whitelisting
- Enable authentication and authorization
- Use strong, unique passwords
- Enable audit logging in production
- Regular security updates

**❌ DON'T:**
- Use default passwords
- Allow connections from 0.0.0.0/0 in production
- Store sensitive data in plain text
- Skip database backups

### 3. Authentication Security

**✅ DO:**
- Use bcrypt for password hashing
- Implement JWT token expiration
- Use HTTPS in production
- Implement rate limiting
- Log authentication attempts

**❌ DON'T:**
- Store passwords in plain text
- Use weak JWT secrets
- Allow unlimited login attempts
- Skip input validation

### 4. API Security

**✅ DO:**
- Validate all input data
- Use parameterized queries
- Implement proper error handling
- Use CORS appropriately
- Implement request rate limiting

**❌ DON'T:**
- Trust user input without validation
- Expose internal error details
- Allow unrestricted CORS
- Skip authorization checks

## Production Deployment Security

### Environment Variables in Production

**Heroku:**
```bash
heroku config:set MONGODB_URI="your_mongodb_uri"
heroku config:set JWT_SECRET="your_jwt_secret"
```

**Vercel:**
```bash
vercel env add MONGODB_URI
vercel env add JWT_SECRET
```

**Docker:**
```bash
docker run -e MONGODB_URI="your_uri" -e JWT_SECRET="your_secret" app
```

### Additional Production Security

1. **HTTPS Only**
   - Force HTTPS redirects
   - Use HSTS headers
   - Secure cookie flags

2. **Security Headers**
   ```javascript
   app.use(helmet()); // Add helmet middleware
   ```

3. **Rate Limiting**
   ```javascript
   app.use(rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   }));
   ```

4. **Input Validation**
   ```javascript
   app.use(express.json({ limit: '10mb' }));
   app.use(mongoSanitize()); // Prevent NoSQL injection
   ```

## Security Checklist

### Development
- [ ] `.env` file created with all required variables
- [ ] `.env` added to `.gitignore`
- [ ] No hardcoded credentials in source code
- [ ] Strong JWT secret generated
- [ ] MongoDB Atlas IP whitelist configured

### Production
- [ ] Environment variables configured in hosting platform
- [ ] HTTPS enabled and enforced
- [ ] Security headers implemented
- [ ] Rate limiting configured
- [ ] Error logging implemented
- [ ] Database backups scheduled
- [ ] Security monitoring enabled

## Incident Response

### If Credentials Are Compromised

1. **Immediate Actions:**
   - Rotate all affected credentials immediately
   - Revoke compromised API keys
   - Change database passwords
   - Generate new JWT secrets

2. **Investigation:**
   - Check access logs for unauthorized activity
   - Review recent commits for exposed credentials
   - Audit user accounts for suspicious activity

3. **Prevention:**
   - Review security practices
   - Update documentation
   - Train team on security best practices
   - Implement additional monitoring

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [JWT Security Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

## Reporting Security Issues

If you discover a security vulnerability, please:
1. **DO NOT** create a public GitHub issue
2. Email security concerns privately
3. Provide detailed information about the vulnerability
4. Allow time for the issue to be addressed before public disclosure

---

**Remember: Security is everyone's responsibility!**