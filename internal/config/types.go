package config

// RulesConfig представляет конфигурацию правил
type RulesConfig struct {
	Schema        string        `json:"$schema,omitempty"`
	CliVersion    string        `json:"cliVersion"`
	ConfigVersion string        `json:"configVersion"`
	InstalledAt   string        `json:"installedAt"`
	UpdatedAt     string        `json:"updatedAt"`
	Source        string        `json:"source"`
	PromptsVersion string       `json:"promptsVersion"`
	Settings      Settings      `json:"settings"`
	RuleSets      []RuleSet     `json:"ruleSets"`
	IgnoreList    []string      `json:"ignoreList,omitempty"`
	FileOverrides []FileOverride `json:"fileOverrides,omitempty"`
	Version       string        `json:"version,omitempty"` // deprecated, используйте promptsVersion
}

// Settings представляет настройки конфигурации
type Settings struct {
	Language string `json:"language"` // "ru" или "en"
}

// RuleSet представляет набор правил
type RuleSet struct {
	ID          string `json:"id"`
	Update      bool   `json:"update"`
	FixedVersion string `json:"fixedVersion,omitempty"`
}

// FileOverride представляет переопределение параметров файла
type FileOverride struct {
	File          string                 `json:"file"`
	YAMLOverrides map[string]interface{} `json:"yamlOverrides"`
}

// VersionDiff представляет diff между версиями
type VersionDiff struct {
	ToAdd    []string `json:"toAdd"`
	ToUpdate []string `json:"toUpdate"`
	ToDelete []string `json:"toDelete"`
}

// FileHashMap представляет карту путей файлов и их хешей
type FileHashMap map[string]string

