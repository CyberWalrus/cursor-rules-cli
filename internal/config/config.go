package config

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

const (
	configFileName = "cursor-rules-config.json"
	configDirName  = ".cursor"
)

// ReadConfig читает конфигурацию из файла
func ReadConfig(targetDir string) (*RulesConfig, error) {
	configPath := filepath.Join(targetDir, configDirName, configFileName)

	data, err := os.ReadFile(configPath)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to read config file: %w", err)
	}

	var config RulesConfig
	if err := json.Unmarshal(data, &config); err != nil {
		return nil, fmt.Errorf("failed to parse config JSON: %w", err)
	}

	if err := ValidateConfig(&config); err != nil {
		return nil, fmt.Errorf("config validation failed: %w", err)
	}

	return &config, nil
}

// WriteConfig записывает конфигурацию в файл
func WriteConfig(targetDir string, config *RulesConfig) error {
	if config == nil {
		return fmt.Errorf("config is nil")
	}

	if err := ValidateConfig(config); err != nil {
		return fmt.Errorf("config validation failed: %w", err)
	}

	configDir := filepath.Join(targetDir, configDirName)
	if err := os.MkdirAll(configDir, 0755); err != nil {
		return fmt.Errorf("failed to create config directory: %w", err)
	}

	if config.Schema == "" {
		config.Schema = fmt.Sprintf(
			"https://raw.githubusercontent.com/CyberWalrus/cursor-rules-cli/main/.cursor/cursor-rules-config-%s.schema.json",
			config.ConfigVersion,
		)
	}

	configPath := filepath.Join(configDir, configFileName)

	data, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal config to JSON: %w", err)
	}

	if err := os.WriteFile(configPath, data, 0644); err != nil {
		return fmt.Errorf("failed to write config file: %w", err)
	}

	return nil
}

// GetCurrentPromptsVersion получает текущую версию промптов из конфигурации
func GetCurrentPromptsVersion(config *RulesConfig) string {
	if config == nil {
		return ""
	}

	if config.PromptsVersion != "" {
		return config.PromptsVersion
	}
	return config.Version
}

