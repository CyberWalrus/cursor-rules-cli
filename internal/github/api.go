package github

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"sort"
	"strings"

	"github.com/CyberWalrus/cursor-rules-cli/internal/version"
)

const (
	githubRepoOwner = "CyberWalrus"
	githubRepoName  = "cursor-rules"
	userAgent       = "cursor-rules-cli"
	tagsURL         = "https://api.github.com/repos/%s/%s/tags?per_page=100"
	promptsPrefix   = "prompts/v"
)

// Tag представляет GitHub тег
type Tag struct {
	Name string `json:"name"`
}

// GetLatestPromptsVersion получает последнюю версию промптов из GitHub
func GetLatestPromptsVersion() (string, error) {
	url := fmt.Sprintf(tagsURL, githubRepoOwner, githubRepoName)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("User-Agent", userAgent)

	token := os.Getenv("GITHUB_TOKEN")
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to fetch tags from GitHub: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusForbidden {
		return "", fmt.Errorf("GitHub API error: 403 Forbidden. Set GITHUB_TOKEN environment variable to increase rate limit")
	}
	if resp.StatusCode == http.StatusNotFound {
		return "", fmt.Errorf("GitHub API error: 404 Not Found. Repository or tags not found")
	}
	if resp.StatusCode >= 500 {
		return "", fmt.Errorf("GitHub API error: %d. Server error", resp.StatusCode)
	}
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("GitHub API error: %d", resp.StatusCode)
	}

	var tags []Tag
	if err := json.NewDecoder(resp.Body).Decode(&tags); err != nil {
		return "", fmt.Errorf("failed to parse GitHub API response: %w", err)
	}

	var promptsTags []string
	for _, tag := range tags {
		if strings.HasPrefix(tag.Name, promptsPrefix) {
			versionStr := strings.TrimPrefix(tag.Name, promptsPrefix)
			versionStr = version.NormalizeCalver(versionStr)
			if version.IsValidCalver(versionStr) {
				promptsTags = append(promptsTags, versionStr)
			}
		}
	}

	if len(promptsTags) == 0 {
		return "", fmt.Errorf("no prompts tags found in repository")
	}

	sort.Slice(promptsTags, func(i, j int) bool {
		changeType, err := version.CompareCalver(promptsTags[j], promptsTags[i])
		if err != nil {
			return false
		}
		return changeType != "none"
	})

	return promptsTags[0], nil
}

