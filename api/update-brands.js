// Vercel serverless function to update brands.json via GitHub API
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { brands, action } = req.body;

  // Validate input
  if (!brands || !Array.isArray(brands)) {
    return res.status(400).json({ error: 'Invalid brands data' });
  }

  // Get GitHub token from environment variable
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    return res.status(500).json({ 
      error: 'GitHub token not configured. Please set GITHUB_TOKEN in Vercel environment variables.' 
    });
  }

  const repoOwner = 'samalakoushik';
  const repoName = 'cryptobrands';
  const filePath = 'src/data/brands.json';
  const branch = 'main';

  try {
    // Step 1: Get the current file content and SHA
    const getFileResponse = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`,
      {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    let currentSha = null;
    if (getFileResponse.ok) {
      const fileData = await getFileResponse.json();
      currentSha = fileData.sha;
    } else if (getFileResponse.status !== 404) {
      throw new Error(`Failed to get file: ${getFileResponse.statusText}`);
    }

    // Step 2: Prepare the new file content
    const newContent = JSON.stringify({ brands }, null, 2);
    const encodedContent = Buffer.from(newContent).toString('base64');

    // Step 3: Commit the file
    const commitMessage = action 
      ? `Update brands: ${action}` 
      : 'Update brands.json from admin dashboard';

    const updateResponse = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: commitMessage,
          content: encodedContent,
          branch: branch,
          sha: currentSha, // Required for updates, null for new files
        }),
      }
    );

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      throw new Error(`GitHub API error: ${errorData.message || updateResponse.statusText}`);
    }

    const result = await updateResponse.json();

    return res.status(200).json({
      success: true,
      message: 'Brands updated successfully. Vercel will auto-deploy in 1-2 minutes.',
      commit: result.commit,
    });

  } catch (error) {
    console.error('Error updating brands:', error);
    return res.status(500).json({
      error: 'Failed to update brands',
      message: error.message,
    });
  }
}

