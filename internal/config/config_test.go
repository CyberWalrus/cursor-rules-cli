package config

import (
	"os"
	"testing"
	"time"
)

func TestReadWriteConfig(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "cursor-rules-test-*")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	now := time.Now().UTC().Format(time.RFC3339)
	testConfig := &RulesConfig{
		CliVersion:     "0.4.1",
		ConfigVersion:  "1.0.0",
		InstalledAt:    now,
		UpdatedAt:      now,
		Source:         "cursor-rules",
		PromptsVersion: "2025.11.7.1",
		Settings: Settings{
			Language: "ru",
		},
		RuleSets: []RuleSet{
			{
				ID:     "base",
				Update: true,
			},
		},
	}

	if err := WriteConfig(tempDir, testConfig); err != nil {
		t.Fatalf("Failed to write config: %v", err)
	}

	readConfig, err := ReadConfig(tempDir)
	if err != nil {
		t.Fatalf("Failed to read config: %v", err)
	}

	if readConfig == nil {
		t.Fatal("ReadConfig returned nil")
	}

	if readConfig.CliVersion != testConfig.CliVersion {
		t.Errorf("CliVersion = %v, want %v", readConfig.CliVersion, testConfig.CliVersion)
	}
	if readConfig.PromptsVersion != testConfig.PromptsVersion {
		t.Errorf("PromptsVersion = %v, want %v", readConfig.PromptsVersion, testConfig.PromptsVersion)
	}
}

func TestReadConfigNotExists(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "cursor-rules-test-*")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	config, err := ReadConfig(tempDir)
	if err != nil {
		t.Fatalf("ReadConfig should not return error for missing file: %v", err)
	}

	if config != nil {
		t.Error("ReadConfig should return nil for missing file")
	}
}

func TestValidateConfig(t *testing.T) {
	now := time.Now().UTC().Format(time.RFC3339)

	tests := []struct {
		name    string
		config  *RulesConfig
		wantErr bool
	}{
		{
			name: "valid config",
			config: &RulesConfig{
				CliVersion:     "0.4.1",
				ConfigVersion:  "1.0.0",
				InstalledAt:    now,
				UpdatedAt:      now,
				Source:         "cursor-rules",
				PromptsVersion: "2025.11.7.1",
				Settings: Settings{
					Language: "ru",
				},
				RuleSets: []RuleSet{
					{ID: "base", Update: true},
				},
			},
			wantErr: false,
		},
		{
			name:    "nil config",
			config:  nil,
			wantErr: true,
		},
		{
			name: "invalid semver",
			config: &RulesConfig{
				CliVersion:     "invalid",
				ConfigVersion:  "1.0.0",
				InstalledAt:    now,
				UpdatedAt:      now,
				Source:         "cursor-rules",
				PromptsVersion: "2025.11.7.1",
				Settings: Settings{
					Language: "ru",
				},
				RuleSets: []RuleSet{
					{ID: "base", Update: true},
				},
			},
			wantErr: true,
		},
		{
			name: "invalid language",
			config: &RulesConfig{
				CliVersion:     "0.4.1",
				ConfigVersion:  "1.0.0",
				InstalledAt:    now,
				UpdatedAt:      now,
				Source:         "cursor-rules",
				PromptsVersion: "2025.11.7.1",
				Settings: Settings{
					Language: "invalid",
				},
				RuleSets: []RuleSet{
					{ID: "base", Update: true},
				},
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateConfig(tt.config)
			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateConfig() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}
