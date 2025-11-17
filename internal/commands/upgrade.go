package commands

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/CyberWalrus/cursor-rules-cli/internal/config"
	"github.com/CyberWalrus/cursor-rules-cli/internal/fileops"
	"github.com/CyberWalrus/cursor-rules-cli/internal/github"
	"github.com/CyberWalrus/cursor-rules-cli/internal/helpers"
	"github.com/CyberWalrus/cursor-rules-cli/internal/ui"
	"github.com/CyberWalrus/cursor-rules-cli/internal/version"
)

// UpgradeCommand выполняет команду инкрементального обновления правил
func UpgradeCommand(targetDir string) error {
	existingConfig, err := config.ReadConfig(targetDir)
	if err != nil {
		return fmt.Errorf("failed to read config: %w", err)
	}

	if existingConfig == nil {
		return fmt.Errorf("configuration not found. Please run 'cursor-rules-cli init' first")
	}

	currentVersion := config.GetCurrentPromptsVersion(existingConfig)
	if currentVersion == "" {
		return fmt.Errorf("current prompts version not found in config")
	}

	var ruleSetsToUpdate []config.RuleSet
	for _, ruleSet := range existingConfig.RuleSets {
		if ruleSet.Update {
			ruleSetsToUpdate = append(ruleSetsToUpdate, ruleSet)
		}
	}

	if len(ruleSetsToUpdate) == 0 {
		fmt.Println("No rule sets to update (all rule sets have update: false)")
		return nil
	}

	knownRuleSets := []string{"base"}
	for _, ruleSet := range existingConfig.RuleSets {
		isKnown := false
		for _, known := range knownRuleSets {
			if ruleSet.ID == known {
				isKnown = true
				break
			}
		}
		if !isKnown {
			fmt.Printf("⚠️ Unknown rule set: %s. Continuing anyway.\n", ruleSet.ID)
		}
	}

	latestVersion, err := github.GetLatestPromptsVersion()
	if err != nil {
		fmt.Println("⚠️ Failed to fetch latest version from GitHub. No internet connection or GitHub API unavailable.")
		confirmed, askErr := ui.AskConfirmation("Use current local version?")
		if askErr != nil {
			return fmt.Errorf("failed to ask confirmation: %w", askErr)
		}
		if !confirmed {
			return fmt.Errorf("operation cancelled by user")
		}
		latestVersion = currentVersion
	}

	changeType, err := version.CompareCalver(currentVersion, latestVersion)
	if err != nil {
		return fmt.Errorf("failed to compare versions: %w", err)
	}

	if changeType == "none" {
		fmt.Println("Prompts are up to date")
		return nil
	}

	if currentVersion > latestVersion {
		fmt.Printf("⚠️ Local version (%s) is newer than GitHub version (%s)\n", currentVersion, latestVersion)
		confirmed, askErr := ui.AskConfirmation("Downgrade to GitHub version?")
		if askErr != nil {
			return fmt.Errorf("failed to ask confirmation: %w", askErr)
		}
		if !confirmed {
			return fmt.Errorf("operation cancelled by user")
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

	targetRulesDir := filepath.Join(targetDir, ".cursor")
	diff, err := fileops.CalculateDiff(extractedDir, targetRulesDir)
	if err != nil {
		return fmt.Errorf("failed to calculate diff: %w", err)
	}

	ignoreList := []string{}
	if existingConfig.IgnoreList != nil {
		ignoreList = existingConfig.IgnoreList
	}

	if err := fileops.CopyRules(extractedDir, targetDir, ignoreList); err != nil {
		return fmt.Errorf("failed to copy new rules: %w", err)
	}

	if existingConfig.FileOverrides != nil {
		for _, override := range existingConfig.FileOverrides {
			filePath := fmt.Sprintf(".cursor/%s", override.File)
			fullPath := filepath.Join(targetDir, filePath)
			if err := fileops.ApplyYAMLOverrides(fullPath, override.YAMLOverrides); err != nil {
				if _, statErr := os.Stat(fullPath); os.IsNotExist(statErr) {
					continue
				}
				return fmt.Errorf("failed to apply YAML overrides for %s: %w", override.File, err)
			}
		}
	}

	for _, fileToDelete := range diff.ToDelete {
		fullPath := filepath.Join(targetDir, ".cursor", fileToDelete)
		shouldIgnore := false
		normalizedPath := strings.ReplaceAll(fileToDelete, "\\", "/")
		for _, pattern := range ignoreList {
			normalizedPattern := strings.TrimPrefix(pattern, ".cursor/")
			if strings.Contains(normalizedPath, normalizedPattern) {
				shouldIgnore = true
				break
			}
		}
		if !shouldIgnore {
			if err := os.Remove(fullPath); err != nil && !os.IsNotExist(err) {
				return fmt.Errorf("failed to delete file %s: %w", fileToDelete, err)
			}
		}
	}

	cliVersion := version.GetPackageVersion()
	now := time.Now().UTC().Format(time.RFC3339)

	existingConfig.PromptsVersion = latestVersion
	existingConfig.CliVersion = cliVersion
	existingConfig.UpdatedAt = now

	if err := config.WriteConfig(targetDir, existingConfig); err != nil {
		return fmt.Errorf("failed to write config: %w", err)
	}

	fmt.Printf("✓ Upgraded from %s to %s\n", currentVersion, latestVersion)

	return nil
}

