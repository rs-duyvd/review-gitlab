# GitLab MR AI Review Bot

This application automatically reviews GitLab merge request changes using AI (Google's Gemini Pro) and posts the reviews as comments on the merge request.

## Features

- Fetches changes from GitLab merge requests
- Reviews code changes using Google's Gemini Pro AI
- Posts detailed reviews as comments on the merge request
- Focuses on code quality, potential bugs, security issues, and best practices

## Prerequisites

- Node.js 16 or higher
- GitLab access token with API permissions
- Google AI (Gemini) API key

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your configuration:
   ```
   GITLAB_API_URL=your_gitlab_api_url
   GITLAB_TOKEN=your_gitlab_token
   GEMINI_API_KEY=your_gemini_api_key
   PROJECT_ID=your_gitlab_project_id
   MR_IID=your_merge_request_iid
   ```

## Usage

Run the application:

```bash
npm start
```

The application will:
1. Fetch the changes from the specified merge request
2. Review each changed file using Gemini Pro AI
3. Post the reviews as comments on the merge request

## Environment Variables

- `GITLAB_API_URL`: Your GitLab instance API URL
- `GITLAB_TOKEN`: Your GitLab personal access token
- `GEMINI_API_KEY`: Your Google AI (Gemini) API key
- `PROJECT_ID`: The ID or URL-encoded path of your GitLab project
- `MR_IID`: The internal ID of the merge request to review

## Contributing

Feel free to open issues or submit pull requests to improve the application. 