package commands

import (
	"fmt"
	"time"

	"github.com/CyberWalrus/cursor-rules-cli/internal/config"
	"github.com/CyberWalrus/cursor-rules-cli/internal/github"
	"github.com/CyberWalrus/cursor-rules-cli/internal/fileops"
	"github.com/CyberWalrus/cursor-rules-cli/internal/helpers"
	"github.com/CyberWalrus/cursor-rules-cli/internal/version"
)

// InitCommand выполняет команду инициализации правил
func InitCommand(targetDir string) error {
	existingConfig, err := config.ReadConfig(targetDir)
	if err != nil {
		return fmt.Errorf("failed to read config: %w", err)
	}

	if existingConfig != nil {
		return fmt.Errorf("rules already initialized with version %s", config.GetCurrentPromptsVersion(existingConfig))
	}

	latestVersion, err := github.GetLatestPromptsVersion()
	if err != nil {
		return fmt.Errorf("failed to fetch latest prompts version from GitHub: %w", err)
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

	if err := fileops.CopyRules(extractedDir, targetDir, nil); err != nil {
		return fmt.Errorf("failed to copy rules: %w", err)
	}

	cliVersion := version.GetPackageVersion()
	now := time.Now().UTC().Format(time.RFC3339)
	newConfig := &config.RulesConfig{
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

	if err := config.WriteConfig(targetDir, newConfig); err != nil {
		return fmt.Errorf("failed to write config: %w", err)
	}

	fmt.Printf("✓ Initialized prompts version %s\n", latestVersion)

	return nil
}

