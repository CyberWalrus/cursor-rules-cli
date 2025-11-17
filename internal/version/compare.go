package version

import (
	"fmt"
	"strings"
)

// CompareVersions сравнивает две версии и возвращает тип изменения
// Автоматически определяет формат версии (semver или CalVer)
func CompareVersions(current, target string) (string, error) {
	current = NormalizeVersion(current)
	target = NormalizeVersion(target)

	if IsValidSemver(current) && IsValidSemver(target) {
		return CompareSemver(current, target)
	}

	if IsValidCalver(current) && IsValidCalver(target) {
		return CompareCalver(current, target)
	}

	return "", fmt.Errorf("versions must be in the same format (both semver or both CalVer): current=%s, target=%s", current, target)
}

// NormalizeVersion нормализует версию (убирает пробелы, префиксы)
func NormalizeVersion(version string) string {
	version = strings.TrimSpace(version)
	version = strings.TrimPrefix(version, "prompts/v")
	version = strings.TrimPrefix(version, "v")
	return version
}

