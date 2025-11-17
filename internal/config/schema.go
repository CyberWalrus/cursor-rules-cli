package config

import (
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"
)

var (
	semverRegex   = regexp.MustCompile(`^\d+\.\d+\.\d+$`)
	calverRegex   = regexp.MustCompile(`^\d{4}\.\d{1,2}\.\d{1,2}\.\d+$`)
	validLanguages = []string{"ru", "en"}
)

// ValidateConfig валидирует конфигурацию согласно схеме
func ValidateConfig(config *RulesConfig) error {
	if config == nil {
		return errors.New("config is nil")
	}

	if !semverRegex.MatchString(config.CliVersion) {
		return fmt.Errorf("cliVersion must be in semver format (x.y.z), got: %s", config.CliVersion)
	}

	if !semverRegex.MatchString(config.ConfigVersion) {
		return fmt.Errorf("configVersion must be in semver format (x.y.z), got: %s", config.ConfigVersion)
	}

	if !calverRegex.MatchString(config.PromptsVersion) {
		return fmt.Errorf("promptsVersion must be in CalVer format (YYYY.M.D.N), got: %s", config.PromptsVersion)
	}

	if _, err := time.Parse(time.RFC3339, config.InstalledAt); err != nil {
		return fmt.Errorf("installedAt must be a valid ISO 8601 datetime, got: %s", config.InstalledAt)
	}

	if _, err := time.Parse(time.RFC3339, config.UpdatedAt); err != nil {
		return fmt.Errorf("updatedAt must be a valid ISO 8601 datetime, got: %s", config.UpdatedAt)
	}

	validLang := false
	for _, lang := range validLanguages {
		if config.Settings.Language == lang {
			validLang = true
			break
		}
	}
	if !validLang {
		return fmt.Errorf("settings.language must be \"ru\" or \"en\", got: %s", config.Settings.Language)
	}

	if len(config.RuleSets) == 0 {
		return errors.New("at least one rule set is required")
	}
	for i, ruleSet := range config.RuleSets {
		if strings.TrimSpace(ruleSet.ID) == "" {
			return fmt.Errorf("ruleSets[%d].id cannot be empty", i)
		}
		if ruleSet.FixedVersion != "" && !semverRegex.MatchString(ruleSet.FixedVersion) {
			return fmt.Errorf("ruleSets[%d].fixedVersion must be in semver format (x.y.z), got: %s", i, ruleSet.FixedVersion)
		}
	}

	for i, override := range config.FileOverrides {
		if strings.TrimSpace(override.File) == "" {
			return fmt.Errorf("fileOverrides[%d].file cannot be empty", i)
		}
	}

	if config.Version != "" && !semverRegex.MatchString(config.Version) {
		return fmt.Errorf("version (deprecated) must be in semver format (x.y.z), got: %s", config.Version)
	}

	if strings.TrimSpace(config.Source) == "" {
		return errors.New("source cannot be empty")
	}

	return nil
}

