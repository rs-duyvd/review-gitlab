import 'dotenv/config';
import GitLabService from './services/gitlab.js';
import AIReviewer from './services/ai-reviewer.js';

async function main() {
    // Validate environment variables
    const requiredEnvVars = ['GITLAB_API_URL', 'GITLAB_TOKEN', 'GEMINI_API_KEY', 'PROJECT_ID', 'MR_IID'];
    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            console.error(`Missing required environment variable: ${envVar}`);
            process.exit(1);
        }
    }

    const gitlabService = new GitLabService(
        process.env.GITLAB_API_URL,
        process.env.GITLAB_TOKEN
    );

    const aiReviewer = new AIReviewer(process.env.GEMINI_API_KEY);

    try {
        console.log('Fetching merge request changes...');
        const changes = await gitlabService.getMergeRequestChanges(
            process.env.PROJECT_ID,
            process.env.MR_IID
        );

        console.log(`Found ${changes.length} changed files. Starting review...`);
        const reviews = await aiReviewer.reviewCode(changes);

        console.log('Posting reviews as comments...');
        for (const review of reviews) {
            // Skip review for log and yaml files
            if (review.file.endsWith('.log') || review.file.endsWith('.yaml') || review.file.endsWith('.yml')) {
                console.log(`Skipping review for ${review.file}`);
                continue;
            }

            // Add a summary comment for the file
            const summaryComment = `## AI Code Review Summary for \`${review.file}\`\n\n${review.review}`;
            await gitlabService.addMergeRequestComment(
                process.env.PROJECT_ID,
                process.env.MR_IID,
                summaryComment
            );

            // Parse the diff to find changed lines
            if (review.changes && review.changes.diff) {
                const diffLines = review.changes.diff.split('\n');
                let currentLine = 0;
                let inHunk = false;
                let lineComments = [];

                for (const line of diffLines) {
                    if (line.startsWith('@@')) {
                        // Parse the hunk header to get the starting line number
                        const match = line.match(/@@ -\d+,\d+ \+(\d+),\d+ @@/);
                        if (match) {
                            currentLine = parseInt(match[1]) - 1;
                            inHunk = true;
                        }
                    } else if (inHunk) {
                        if (line.startsWith('+')) {
                            currentLine++;
                            // Add inline comment if there's a specific issue to point out
                            if (line.match(/(TODO|FIXME|XXX|HACK|BUG)/i)) {
                                lineComments.push({
                                    line: currentLine,
                                    comment: `⚠️ Found potential issue: This line contains a code marker (${line.match(/(TODO|FIXME|XXX|HACK|BUG)/i)[0]}) that should be addressed.`
                                });
                            }
                        } else if (line.startsWith(' ')) {
                            currentLine++;
                        }
                    }
                }

                // Add inline comments
                for (const comment of lineComments) {
                    await gitlabService.addInlineComment(
                        process.env.PROJECT_ID,
                        process.env.MR_IID,
                        comment.comment,
                        review.file,
                        comment.line
                    );
                }
            }
        }

        console.log('Code review completed successfully!');
    } catch (error) {
        console.error('An error occurred:', error.message);
        process.exit(1);
    }
}

main(); 