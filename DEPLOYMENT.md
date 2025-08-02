# Deployment Guide

This guide covers deploying the Voice Meter Application using Docker and GitHub Container Registry (GHCR).

## Prerequisites

- Docker and Docker Compose installed
- GitHub account with repository access
- Git configured locally

## GitHub Setup

### 1. Push to GitHub

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: Voice Meter Application"

# Add GitHub remote (replace with your repository URL)
git remote add origin https://github.com/YOUR_USERNAME/voice-meter-app.git

# Push to GitHub
git push -u origin main
```

### 2. Enable GitHub Actions

The workflow will automatically run when you push to the `main` branch or create tags. No additional setup is required - the workflow uses the built-in `GITHUB_TOKEN`.

## Docker Deployment

### Local Development

```bash
# Build and run locally
docker build -t voice-meter-app .
docker run -p 5000:5000 voice-meter-app
```

### Using Docker Compose

```bash
# Development mode
docker-compose up

# Production mode with nginx
docker-compose --profile production up -d
```

### Using Pre-built Image from GHCR

```bash
# Pull the latest image
docker pull ghcr.io/YOUR_USERNAME/voice-meter-app:main

# Run the container
docker run -p 5000:5000 ghcr.io/YOUR_USERNAME/voice-meter-app:main
```

## Production Deployment

### Environment Variables

The application supports these environment variables:

```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=your-database-url  # If using database features
```

### Docker Compose Production

1. Update `docker-compose.yml` with your domain
2. Configure SSL certificates in nginx configuration
3. Deploy:

```bash
docker-compose --profile production up -d
```

### Cloud Deployment Options

#### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

#### Render
1. Connect your GitHub repository
2. Use Docker deployment
3. Set environment variables in dashboard

#### DigitalOcean App Platform
1. Create new app from GitHub repository
2. Select "Dockerfile" as build method
3. Configure environment variables

#### AWS ECS/Fargate
```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_URL

docker build -t voice-meter-app .
docker tag voice-meter-app:latest YOUR_ECR_URL/voice-meter-app:latest
docker push YOUR_ECR_URL/voice-meter-app:latest
```

## GitHub Actions Workflow

The workflow automatically:

1. **Builds** the application on every push to main
2. **Tests** the application (if tests are present)
3. **Creates** multi-platform Docker images (amd64, arm64)
4. **Pushes** to GitHub Container Registry
5. **Tags** images based on branch names and git tags

### Workflow Triggers

- **Push to main/master**: Creates `main` tagged image
- **Git tags**: Creates versioned releases (e.g., `v1.0.0`)
- **Pull requests**: Builds but doesn't push (for testing)

### Image Tags

The workflow creates these image tags:
- `main` - Latest main branch
- `sha-COMMIT_HASH` - Specific commit
- `v1.0.0` - Git tags (semantic versions)

## Monitoring and Maintenance

### Health Checks

The Docker image includes health checks:
```bash
# Check container health
docker ps
docker inspect CONTAINER_ID | grep Health
```

### Logs

```bash
# View application logs
docker logs CONTAINER_ID

# Follow logs in real-time
docker logs -f CONTAINER_ID
```

### Updates

```bash
# Pull latest image
docker pull ghcr.io/YOUR_USERNAME/voice-meter-app:main

# Restart with new image
docker-compose pull
docker-compose up -d
```

## Security Considerations

1. **HTTPS Required**: Web Audio API requires HTTPS in production
2. **Rate Limiting**: Nginx configuration includes rate limiting
3. **Security Headers**: CSRF, XSS, and other security headers configured
4. **Non-root User**: Docker container runs as non-root user
5. **Minimal Attack Surface**: Multi-stage build reduces image size

## Troubleshooting

### Common Issues

1. **Microphone Access**: Ensure HTTPS is configured for production
2. **Port Conflicts**: Change port mapping if 5000 is in use
3. **Build Failures**: Check Node.js version compatibility
4. **Permission Errors**: Verify Docker daemon is running

### Debug Commands

```bash
# Interactive container access
docker run -it --entrypoint /bin/sh voice-meter-app

# Check container processes
docker exec CONTAINER_ID ps aux

# Inspect image layers
docker history voice-meter-app
```

## Support

For deployment issues:
1. Check the GitHub Actions logs
2. Verify Docker and Node.js versions
3. Ensure all environment variables are set
4. Check application logs for errors

---

**Note**: This application requires microphone access, which mandates HTTPS in production environments. Ensure proper SSL/TLS configuration for production deployments.