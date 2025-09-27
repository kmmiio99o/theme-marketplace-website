// GitHub utilities - direct authentication using environment variables
// No external dependencies, everything is self-contained

// Function to create safe filenames from theme names
function createSafeFilename(themeName) {
  return (
    themeName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Remove duplicate hyphens
      .replace(/^-+|-+$/g, "") || "untitled-theme"
  ); // Remove leading/trailing hyphens
}

// Unicode-safe base64 encoding function
function unicodeSafeBtoa(str) {
  try {
    // First try the standard btoa - works for most cases
    return btoa(str);
  } catch (e) {
    // If that fails, convert to UTF-8 bytes first
    const utf8Bytes = new TextEncoder().encode(str);
    let binary = "";
    for (let i = 0; i < utf8Bytes.length; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
    return btoa(binary);
  }
}

// Helper function to get authenticated headers for GitHub API calls
function getGitHubHeaders(env) {
  if (!env.GITHUB_TOKEN) {
    throw new Error(
      "No GitHub authentication configuration found. Please configure GITHUB_TOKEN in wrangler.toml",
    );
  }

  console.log("🔑 Using personal token authentication...");
  return {
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    "User-Agent": "ThemeHub",
    Accept: "application/vnd.github.v3+json",
  };
}

// Helper function to get the branch name
function getBranch(env) {
  return env.GITHUB_BRANCH || "main";
}

// Save theme to GitHub with human-readable names
export async function saveThemeToGitHub(
  env,
  theme,
  status = "pending",
  customFilename,
) {
  try {
    // Validate configuration
    if (!env.GITHUB_TOKEN) {
      return {
        success: false,
        error: "authentication",
        message:
          "No GitHub authentication token found. Please configure GITHUB_TOKEN in wrangler.toml",
        details: "Missing GITHUB_TOKEN environment variable",
      };
    }

    if (!env.GITHUB_OWNER || !env.GITHUB_REPO) {
      return {
        success: false,
        error: "configuration",
        message: "GitHub repository configuration is incomplete",
        details:
          `Missing: ${!env.GITHUB_OWNER ? "GITHUB_OWNER" : ""} ${!env.GITHUB_REPO ? "GITHUB_REPO" : ""}`.trim(),
      };
    }

    const owner = env.GITHUB_OWNER;
    const repo = env.GITHUB_REPO;

    // Create safe filename from theme name with timestamp (or use provided)
    const safeName = createSafeFilename(theme.name);
    const timestamp = Date.now();
    const filename = customFilename || `${safeName}-${timestamp}`;
    const path = `themes/${status}/${filename}.json`;

    // Handle preview image if provided
    if (theme.previewImage) {
      try {
        // Save preview image separately
        const previewPath = `themes/${status}/${filename}-preview.png`;
        const previewUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${previewPath}`;

        // theme.previewImage expected format: "mime;base64,<data>"
        const encodedImageData = theme.previewImage.replace(/^.*base64,/, "");

        // Save preview image
        const headers = getGitHubHeaders(env);
        headers["Content-Type"] = "application/json";

        const branch = getBranch(env);

        const previewResponse = await fetch(previewUrl, {
          method: "PUT",
          headers: headers,
          body: JSON.stringify({
            message: `Add ${status} theme preview: ${theme.name}`,
            content: encodedImageData,
            branch: branch,
          }),
        });

        if (!previewResponse.ok) {
          const previewErrorText = await previewResponse.text();
          console.error(
            "Preview upload failed:",
            previewResponse.status,
            previewErrorText,
          );
          return {
            success: false,
            error: "preview_upload",
            message: "Failed to upload preview image to GitHub",
            details: `GitHub API returned ${previewResponse.status}: ${previewErrorText}`,
          };
        }

        // Add preview URL to theme data
        theme.previewUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${previewPath}`;

        // Remove base64 data to keep JSON clean
        delete theme.previewImage;
      } catch (previewError) {
        console.error("Preview upload error:", previewError);
        return {
          success: false,
          error: "preview_upload",
          message: "Failed to upload preview image",
          details: previewError.message || "Unknown preview upload error",
        };
      }
    }

    const content = JSON.stringify(theme, null, 2);
    const encodedContent = unicodeSafeBtoa(content);

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    const headers = getGitHubHeaders(env);
    headers["Content-Type"] = "application/json";

    const response = await fetch(url, {
      method: "PUT",
      headers: headers,
      body: JSON.stringify({
        message: `Add ${status} theme: ${theme.name || filename}`,
        content: encodedContent,
        branch: getBranch(env),
      }),
    });

    if (response.ok) {
      return {
        success: true,
        filename: filename,
        message: "Theme successfully saved to GitHub",
      };
    } else {
      const errorText = await response.text();
      console.error("GitHub API Error:", response.status, errorText);

      let errorType = "api_error";
      let userMessage = "Failed to save theme to GitHub";

      if (response.status === 401) {
        errorType = "authentication";
        userMessage =
          "GitHub authentication failed. Please check your token permissions.";
      } else if (response.status === 403) {
        errorType = "permissions";
        userMessage =
          "Insufficient permissions to write to the GitHub repository.";
      } else if (response.status === 404) {
        errorType = "repository_not_found";
        userMessage =
          "GitHub repository not found. Please check repository name and permissions.";
      } else if (response.status === 422) {
        errorType = "validation";
        userMessage =
          "GitHub rejected the request. The file may already exist or the path is invalid.";
      } else if (response.status >= 500) {
        errorType = "server_error";
        userMessage = "GitHub server error. Please try again later.";
      }

      return {
        success: false,
        error: errorType,
        message: userMessage,
        details: `GitHub API returned ${response.status}: ${errorText}`,
        statusCode: response.status,
      };
    }
  } catch (error) {
    console.error("GitHub Save Error:", error);

    let errorType = "network_error";
    let userMessage = "Network error while connecting to GitHub";

    if (error.name === "TypeError" && error.message.includes("fetch")) {
      errorType = "network_error";
      userMessage =
        "Unable to connect to GitHub. Please check your internet connection.";
    } else if (error.message.includes("timeout")) {
      errorType = "timeout";
      userMessage = "Request timed out. Please try again.";
    }

    return {
      success: false,
      error: errorType,
      message: userMessage,
      details: error.message || "Unknown error occurred",
    };
  }
}

// Get all themes from GitHub
export async function getAllThemesFromGitHub(env, status = "approved") {
  try {
    // Validate configuration
    if (!env.GITHUB_TOKEN) {
      throw new Error(
        "No GitHub authentication configuration found. Please configure GITHUB_TOKEN in wrangler.toml",
      );
    }

    const owner = env.GITHUB_OWNER;
    const repo = env.GITHUB_REPO;
    const path = `themes/${status}/`;

    const branch = getBranch(env);
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

    const headers = getGitHubHeaders(env);
    const response = await fetch(url, {
      headers: headers,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("List themes error:", response.status, errText);
      return [];
    }

    const files = await response.json();
    if (!Array.isArray(files)) {
      console.error("Unexpected list response shape for", path);
      return [];
    }

    const themes = [];

    // Process only JSON files
    for (const file of files) {
      if (
        file.type === "file" &&
        file.name.endsWith(".json") &&
        !file.name.includes("-preview")
      ) {
        try {
          // Fetch the actual theme data
          const themeResponse = await fetch(file.download_url);
          const themeData = await themeResponse.json();
          const themeId = file.name.replace(".json", "");
          themes.push({
            id: themeId,
            name: themeData.name,
            author:
              themeData.authors?.[0]?.name || themeData.author || "Unknown",
            description: themeData.description,
            previewUrl: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/themes/${status}/${themeId}-preview.png`,
            repositoryUrl: themeData.repositoryUrl,
            themeData: themeData,
            source: "local",
          });
        } catch (error) {
          console.error("Error loading theme:", file.name, error);
        }
      }
    }

    return themes;
  } catch (error) {
    console.error("GitHub List Error:", error);
    return [];
  }
}

// Get specific theme from GitHub
export async function getThemeFromGitHub(env, themeId, status = "approved") {
  try {
    // Validate configuration
    if (!env.GITHUB_TOKEN) {
      throw new Error(
        "No GitHub authentication configuration found. Please configure GITHUB_TOKEN in wrangler.toml",
      );
    }

    const owner = env.GITHUB_OWNER;
    const repo = env.GITHUB_REPO;
    const safeId = encodeURIComponent(themeId);
    const path = `themes/${status}/${safeId}.json`;

    const branch = getBranch(env);
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

    const headers = getGitHubHeaders(env);
    const response = await fetch(url, {
      headers: headers,
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn("Theme not found at", path);
      }
      return null;
    }

    const file = await response.json();
    const themeResponse = await fetch(file.download_url);
    const themeData = await themeResponse.json();

    return {
      ...themeData,
      source: "local",
    };
  } catch (error) {
    console.error("GitHub Get Theme Error:", error);
    return null;
  }
}

// Move theme between statuses (approve/reject)
export async function moveThemeBetweenStatuses(
  env,
  themeId,
  fromStatus,
  toStatus,
) {
  try {
    console.log(
      `🔄 Moving theme ${themeId} from ${fromStatus} to ${toStatus}...`,
    );

    // Validate configuration
    if (!env.GITHUB_TOKEN) {
      throw new Error(
        "No GitHub authentication configuration found. Please configure GITHUB_TOKEN in wrangler.toml",
      );
    }

    const owner = env.GITHUB_OWNER;
    const repo = env.GITHUB_REPO;

    // Get the theme content
    const theme = await getThemeFromGitHub(env, themeId, fromStatus);
    if (!theme) {
      return false;
    }

    // Preserve original filename (without .json)
    const originalFilename = theme.filename
      ? theme.filename.replace(/\.json$/, "")
      : themeId;

    // Copy preview if exists
    const fromPreviewPath = `themes/${fromStatus}/${originalFilename}-preview.png`;
    const toPreviewPath = `themes/${toStatus}/${originalFilename}-preview.png`;

    // Try to read preview (if exists) and write to new location
    try {
      const branch = getBranch(env);
      const fileInfoUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${fromPreviewPath}?ref=${branch}`;
      const headers = getGitHubHeaders(env);
      const fileInfoResponse = await fetch(fileInfoUrl, {
        headers: headers,
      });
      if (fileInfoResponse.ok) {
        const fileInfo = await fileInfoResponse.json();
        const previewContentResponse = await fetch(fileInfo.download_url);
        const previewArrayBuffer = await previewContentResponse.arrayBuffer();
        const u8 = new Uint8Array(previewArrayBuffer);
        // Encode to base64 using Unicode-safe method
        let binary = "";
        const chunkSize = 0x8000;
        for (let i = 0; i < u8.length; i += chunkSize) {
          const chunk = u8.subarray(i, i + chunkSize);
          binary += String.fromCharCode.apply(null, chunk);
        }
        const encoded = unicodeSafeBtoa(binary);

        const toPreviewUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${toPreviewPath}`;
        const putHeaders = getGitHubHeaders(env);
        putHeaders["Content-Type"] = "application/json";

        await fetch(toPreviewUrl, {
          method: "PUT",
          headers: putHeaders,
          body: JSON.stringify({
            message: `Copy preview to ${toStatus}: ${originalFilename}`,
            content: encoded,
            branch: getBranch(env),
          }),
        });

        // Update previewUrl in theme
        theme.previewUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${toPreviewPath}`;

        // Delete old preview
        const oldPreviewDeleteUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${fromPreviewPath}`;
        const deleteHeaders = getGitHubHeaders(env);
        deleteHeaders["Content-Type"] = "application/json";

        await fetch(oldPreviewDeleteUrl, {
          method: "DELETE",
          headers: deleteHeaders,
          body: JSON.stringify({
            message: `Delete ${fromStatus} theme preview: ${originalFilename}`,
            sha: fileInfo.sha,
            branch: getBranch(env),
          }),
        });
      }
    } catch (previewErr) {
      // No preview or copy error – ignore but log
      console.error("Preview copy error (continuing):", previewErr);
    }

    // Save to new location under the same filename
    const newThemeId = await saveThemeToGitHub(
      env,
      theme,
      toStatus,
      originalFilename,
    );
    if (!newThemeId) {
      return false;
    }

    // Delete from old location (JSON only, preview handled above)
    const deleteSuccess = await deleteThemeFromGitHub(env, themeId, fromStatus);

    if (deleteSuccess) {
      console.log(
        `✅ Successfully moved theme ${themeId} from ${fromStatus} to ${toStatus}`,
      );
    } else {
      console.error(
        `❌ Failed to delete theme ${themeId} from ${fromStatus} after move`,
      );
    }

    return deleteSuccess;
  } catch (error) {
    console.error("Move Error:", error);
    return false;
  }
}

// Delete theme from GitHub with better error handling
export async function deleteThemeFromGitHub(env, themeId, status) {
  try {
    // Validate configuration
    if (!env.GITHUB_TOKEN) {
      throw new Error(
        "No GitHub authentication configuration found. Please configure GITHUB_TOKEN in wrangler.toml",
      );
    }

    const owner = env.GITHUB_OWNER;
    const repo = env.GITHUB_REPO;
    const path = `themes/${status}/${themeId}.json`;

    // First get the file SHA
    const branch = getBranch(env);
    const fileInfoUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    const headers = getGitHubHeaders(env);
    const fileInfoResponse = await fetch(fileInfoUrl, {
      headers: headers,
    });

    if (!fileInfoResponse.ok) {
      console.error("File not found for deletion:", path);
      // Treat as already deleted
      return true;
    }

    const fileInfo = await fileInfoResponse.json();

    // Delete the JSON file
    const deleteUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const deleteHeaders = getGitHubHeaders(env);
    deleteHeaders["Content-Type"] = "application/json";

    console.log(
      "🗑️ Attempting to delete theme:",
      themeId,
      "from status:",
      status,
    );
    console.log("🔗 Delete URL:", deleteUrl);
    console.log("📝 Commit message:", `Delete ${status} theme: ${themeId}`);

    const response = await fetch(deleteUrl, {
      method: "DELETE",
      headers: deleteHeaders,
      body: JSON.stringify({
        message: `Delete ${status} theme: ${themeId}`,
        sha: fileInfo.sha,
        branch: getBranch(env),
      }),
    });

    console.log("📊 Delete response status:", response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Delete error details:", errorText);
    }

    // Handle both success (200) and "directory cleanup" cases (204)
    if (response.ok || response.status === 204) {
      // Also try to delete associated preview image if it exists
      try {
        const previewPath = `themes/${status}/${themeId}-preview.png`;
        const branch = getBranch(env);
        const previewFileInfoUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${previewPath}?ref=${branch}`;
        const previewFileInfoResponse = await fetch(previewFileInfoUrl, {
          headers: headers,
        });

        if (previewFileInfoResponse.ok) {
          const previewFileInfo = await previewFileInfoResponse.json();
          const previewDeleteUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${previewPath}`;
          await fetch(previewDeleteUrl, {
            method: "DELETE",
            headers: deleteHeaders,
            body: JSON.stringify({
              message: `Delete ${status} theme preview: ${themeId}`,
              sha: previewFileInfo.sha,
              branch: getBranch(env),
            }),
          });
        }
      } catch (previewError) {
        console.error("Preview deletion error (continuing):", previewError);
      }

      return true;
    } else {
      const errorText = await response.text();
      console.error("Delete error:", response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error("Delete Error:", error);
    // Even if we get an error, the file might have been deleted
    // This can happen with the last file in a directory
    return true;
  }
}
