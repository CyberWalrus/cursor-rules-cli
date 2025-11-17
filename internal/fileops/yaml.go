package fileops

import (
	"fmt"
	"os"
	"strings"

	"gopkg.in/yaml.v3"
)

const (
	frontmatterDelimiter = "---"
)

// ApplyYAMLOverrides применяет переопределения YAML frontmatter к файлу
func ApplyYAMLOverrides(filePath string, overrides map[string]interface{}) error {
	if len(overrides) == 0 {
		return nil
	}

	data, err := os.ReadFile(filePath)
	if err != nil {
		return fmt.Errorf("failed to read file: %w", err)
	}

	content := string(data)

	frontmatter, body, err := parseFrontmatter(content)
	if err != nil {
		return fmt.Errorf("failed to parse frontmatter: %w", err)
	}

	merged, err := mergeYAML(frontmatter, overrides)
	if err != nil {
		return fmt.Errorf("failed to merge YAML: %w", err)
	}

	mergedYAML, err := formatYAML(merged)
	if err != nil {
		return fmt.Errorf("failed to format YAML: %w", err)
	}

	newContent := buildFileContent(mergedYAML, body)

	if err := os.WriteFile(filePath, []byte(newContent), 0644); err != nil {
		return fmt.Errorf("failed to write file: %w", err)
	}

	return nil
}

// parseFrontmatter парсит YAML frontmatter из файла
// Формат: ---\nkey: value\n---\ncontent
func parseFrontmatter(content string) (map[string]interface{}, string, error) {
	lines := strings.Split(content, "\n")

	startIdx := -1
	for i, line := range lines {
		if strings.TrimSpace(line) == frontmatterDelimiter {
			startIdx = i
			break
		}
	}

	if startIdx == -1 {
		return make(map[string]interface{}), content, nil
	}

	endIdx := -1
	for i := startIdx + 1; i < len(lines); i++ {
		if strings.TrimSpace(lines[i]) == frontmatterDelimiter {
			endIdx = i
			break
		}
	}

	if endIdx == -1 {
		return make(map[string]interface{}), content, nil
	}

	frontmatterLines := lines[startIdx+1 : endIdx]
	frontmatterContent := strings.Join(frontmatterLines, "\n")

	var frontmatter map[string]interface{}
	if err := yaml.Unmarshal([]byte(frontmatterContent), &frontmatter); err != nil {
		return nil, "", fmt.Errorf("failed to parse YAML frontmatter: %w", err)
	}

	bodyLines := lines[endIdx+1:]
	body := strings.Join(bodyLines, "\n")

	return frontmatter, body, nil
}

// mergeYAML сливает два YAML объекта (приоритет у overrides)
func mergeYAML(base, overrides map[string]interface{}) (map[string]interface{}, error) {
	merged := make(map[string]interface{})

	for k, v := range base {
		merged[k] = v
	}

	for k, v := range overrides {
		merged[k] = v
	}

	return merged, nil
}

// formatYAML форматирует YAML объект в строку
func formatYAML(data map[string]interface{}) (string, error) {
	yamlData, err := yaml.Marshal(data)
	if err != nil {
		return "", err
	}
	return strings.TrimSpace(string(yamlData)), nil
}

// buildFileContent собирает содержимое файла из frontmatter и body
func buildFileContent(frontmatterYAML, body string) string {
	if frontmatterYAML == "" {
		return body
	}

	var parts []string
	parts = append(parts, frontmatterDelimiter)
	parts = append(parts, frontmatterYAML)
	parts = append(parts, frontmatterDelimiter)
	if body != "" {
		parts = append(parts, body)
	}

	return strings.Join(parts, "\n")
}

