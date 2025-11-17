package commands

import (
	"fmt"
	"os"
	"time"

	"github.com/CyberWalrus/cursor-rules-cli/internal/config"
	"github.com/CyberWalrus/cursor-rules-cli/internal/fileops"
	"github.com/CyberWalrus/cursor-rules-cli/internal/github"
	"github.com/CyberWalrus/cursor-rules-cli/internal/helpers"
	"github.com/CyberWalrus/cursor-rules-cli/internal/ui"
	"github.com/CyberWalrus/cursor-rules-cli/internal/version"
)

// ReplaceAllCommand выполняет команду полной замены правил
func ReplaceAllCommand(targetDir string) error {
	existingConfig, err := config.ReadConfig(targetDir)
	if err != nil {
		return fmt.Errorf("failed to read config: %w", err)
	}

	latestVersion, err := github.GetLatestPromptsVersion()
	if err != nil {
		if existingConfig != nil {
			fmt.Println("⚠️ Failed to fetch latest version from GitHub. No internet connection or GitHub API unavailable.")
			confirmed, askErr := ui.AskConfirmation("Use current local version?")
			if askErr != nil {
				return fmt.Errorf("failed to ask confirmation: %w", askErr)
			}
			if !confirmed {
				return fmt.Errorf("operation cancelled by user")
			}
			latestVersion = config.GetCurrentPromptsVersion(existingConfig)
		} else {
			return fmt.Errorf("failed to fetch latest prompts version from GitHub. No internet connection or GitHub API unavailable")
		}
	}

	tempDir, err := helpers.CreateTempDir()
	if err != nil {
		return fmt.Errorf("failed to create temp directory: %w", err)
	}
	defer helpers.CleanupTempDir(tempDir)

	extractedDir, err := github.DownloadAndExtractTarball(latestVersion, tempDir)
	if err != nil {
		return fmt.Errorf("failed to download and extract tarball: %w", err)
	}

	if err := fileops.DeleteRules(targetDir); err != nil {
		return fmt.Errorf("failed to delete old rules: %w", err)
	}

	ignoreList := []string{}
	if existingConfig != nil && existingConfig.IgnoreList != nil {
		ignoreList = existingConfig.IgnoreList
	}

	if err := fileops.CopyRules(extractedDir, targetDir, ignoreList); err != nil {
		return fmt.Errorf("failed to copy new rules: %w", err)
	}

	if existingConfig != nil && existingConfig.FileOverrides != nil {
		for _, override := range existingConfig.FileOverrides {
			filePath := fmt.Sprintf(".cursor/%s", override.File)
			fullPath := fmt.Sprintf("%s/%s", targetDir, filePath)
			if err := fileops.ApplyYAMLOverrides(fullPath, override.YAMLOverrides); err != nil {
				if _, statErr := os.Stat(fullPath); os.IsNotExist(statErr) {
					continue
				}
				return fmt.Errorf("failed to apply YAML overrides for %s: %w", override.File, err)
			}
		}
	}

	cliVersion := version.GetPackageVersion()
	now := time.Now().UTC().Format(time.RFC3339)

	var newConfig *config.RulesConfig
	if existingConfig != nil {
		newConfig = existingConfig
		newConfig.PromptsVersion = latestVersion
		newConfig.CliVersion = cliVersion
		newConfig.UpdatedAt = now
	} else {
		newConfig = &config.RulesConfig{
			CliVersion:     cliVersion,
			ConfigVersion:  "1.0.0",
			InstalledAt:    now,
			UpdatedAt:      now,
			Source:         "cursor-rules",
			PromptsVersion: latestVersion,
			Settings: config.Settings{
				Language: "ru",
			},
			RuleSets: []config.RuleSet{
				{
					ID:     "base",
					Update: true,
				},
			},
		}
	}

	if err := config.WriteConfig(targetDir, newConfig); err != nil {
		return fmt.Errorf("failed to write config: %w", err)
	}

	fmt.Printf("✓ Replaced prompts to version %s\n", latestVersion)

	return nil
}

