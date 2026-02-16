# Security Policy

## Reporting Security Issues

If you discover a security vulnerability in OpenCompile, please report it by emailing the maintainers. Do not create public GitHub issues for security vulnerabilities.

## API Key Security

### ⚠️ CRITICAL: Never Commit API Keys

OpenCompile uses AI provider API keys that must be kept secure:

- **OPENAI_API_KEY**: Your OpenAI API key
- **ANTHROPIC_API_KEY**: Your Anthropic (Claude) API key  
- **GOOGLE_API_KEY**: Your Google AI API key

### Best Practices

1. **Use .env File (Local Development)**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Add your real API key
   echo "OPENAI_API_KEY=sk-your-actual-key-here" > .env
   ```
   
   ✅ `.env` is in `.gitignore` and will NEVER be committed

2. **Production Deployment**
   - Use environment variables set by your hosting platform
   - For Docker: Use `docker-compose` secrets or environment variables
   - For CI/CD: Use GitHub Secrets, GitLab CI/CD variables, etc.
   - Never hardcode keys in source code

3. **Docker Security**
   ```bash
   # Use environment variables, not .env file
   docker run -e OPENAI_API_KEY=your-key opencompile
   
   # Or use docker-compose with env_file (not committed)
   ```

4. **Verify Before Committing**
   ```bash
   # Always check what you're committing
   git status
   git diff
   
   # Make sure .env is NOT listed
   # Only .env.example should be tracked
   ```

## Files That Should NEVER Be Committed

- `.env` (contains real API keys)
- `.env.local`
- `.env.production`
- Any file with actual API keys or secrets
- `knowledge-base/` (may contain cached project data)

## Files That SHOULD Be Committed

- `.env.example` (template with placeholder values)
- `.gitignore` (ensures .env is excluded)
- Source code without hardcoded secrets

## Key Rotation

If you accidentally commit an API key:

1. **Immediately revoke the key** in your provider's dashboard
2. Generate a new API key
3. Update your `.env` file with the new key
4. Use `git filter-branch` or BFG Repo-Cleaner to remove the key from git history
5. Force push to overwrite history (if repository is private)

## Checking for Exposed Secrets

```bash
# Search for potential exposed keys (run before committing)
git grep -i "sk-" -- ':!*.md'
git grep -i "api[_-]key.*=" -- ':!*.example' ':!*.md'

# Use tools like git-secrets
git secrets --scan
```

## Environment Variable Validation

OpenCompile validates environment variables on startup:

- Warns if no API keys are found
- Uses mock mode if keys are missing (for testing)
- Logs which providers are available

## Questions?

Check the [README.md](README.md) for setup instructions or open a discussion on GitHub.
