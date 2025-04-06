import axios from 'axios';

class GitLabService {
    constructor(apiUrl, token) {
        this.api = axios.create({
            baseURL: apiUrl,
            headers: {
                'PRIVATE-TOKEN': token
            }
        });
    }

    async getMergeRequestChanges(projectId, mrIid) {
        try {
            const response = await this.api.get(`/projects/${projectId}/merge_requests/${mrIid}/changes`);
            return response.data.changes;
        } catch (error) {
            console.error('Error fetching merge request changes:', error.message);
            throw error;
        }
    }

    async addMergeRequestComment(projectId, mrIid, comment) {
        try {
            await this.api.post(`/projects/${projectId}/merge_requests/${mrIid}/notes`, {
                body: comment
            });
        } catch (error) {
            console.error('Error adding comment:', error.message);
            throw error;
        }
    }

    async addInlineComment(projectId, mrIid, comment, filePath, newLine) {
        try {
            await this.api.post(`/projects/${projectId}/merge_requests/${mrIid}/discussions`, {
                body: comment,
                position: {
                    position_type: 'text',
                    new_path: filePath,
                    new_line: newLine,
                    base_sha: null,
                    start_sha: null,
                    head_sha: null
                }
            });
        } catch (error) {
            console.error('Error adding inline comment:', error.message);
            throw error;
        }
    }

    async addMultiLineComment(projectId, mrIid, comment, filePath, startLine, endLine) {
        try {
            await this.api.post(`/projects/${projectId}/merge_requests/${mrIid}/discussions`, {
                body: comment,
                position: {
                    position_type: 'text',
                    new_path: filePath,
                    new_line: endLine,
                    old_line: startLine,
                    base_sha: null,
                    start_sha: null,
                    head_sha: null
                }
            });
        } catch (error) {
            console.error('Error adding multi-line comment:', error.message);
            throw error;
        }
    }

    async getMergeRequestDiff(projectId, mrIid) {
        try {
            const response = await this.api.get(`/projects/${projectId}/merge_requests/${mrIid}/versions`);
            const versions = response.data;
            if (versions.length === 0) {
                throw new Error('No versions found for this merge request');
            }
            const latestVersion = versions[0];
            return latestVersion.head_commit_sha;
        } catch (error) {
            console.error('Error fetching merge request diff:', error.message);
            throw error;
        }
    }
}

export default GitLabService; 