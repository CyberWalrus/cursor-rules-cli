package version

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
)

var semverRegex = regexp.MustCompile(`^(\d+)\.(\d+)\.(\d+)$`)

// CompareSemver сравнивает две semver версии и возвращает тип изменения
// Возвращает: "major", "minor", "patch", "none"
func CompareSemver(current, target string) (string, error) {
	currentParts := semverRegex.FindStringSubmatch(current)
	targetParts := semverRegex.FindStringSubmatch(target)

	if currentParts == nil {
		return "", fmt.Errorf("invalid semver format for current version: %s", current)
	}
	if targetParts == nil {
		return "", fmt.Errorf("invalid semver format for target version: %s", target)
	}

	currentMajor, _ := strconv.Atoi(currentParts[1])
	currentMinor, _ := strconv.Atoi(currentParts[2])
	currentPatch, _ := strconv.Atoi(currentParts[3])

	targetMajor, _ := strconv.Atoi(targetParts[1])
	targetMinor, _ := strconv.Atoi(targetParts[2])
	targetPatch, _ := strconv.Atoi(targetParts[3])

	if currentMajor == targetMajor && currentMinor == targetMinor && currentPatch == targetPatch {
		return "none", nil
	}

	if currentMajor > targetMajor ||
		(currentMajor == targetMajor && currentMinor > targetMinor) ||
		(currentMajor == targetMajor && currentMinor == targetMinor && currentPatch > targetPatch) {
		return "none", nil
	}

	if currentMajor != targetMajor {
		return "major", nil
	}
	if currentMinor != targetMinor {
		return "minor", nil
	}
	return "patch", nil
}

// ParseSemver парсит semver версию и возвращает компоненты
func ParseSemver(version string) (major, minor, patch int, err error) {
	parts := semverRegex.FindStringSubmatch(version)
	if parts == nil {
		return 0, 0, 0, fmt.Errorf("invalid semver format: %s", version)
	}

	major, _ = strconv.Atoi(parts[1])
	minor, _ = strconv.Atoi(parts[2])
	patch, _ = strconv.Atoi(parts[3])

	return major, minor, patch, nil
}

// IsValidSemver проверяет, является ли строка валидной semver версией
func IsValidSemver(version string) bool {
	return semverRegex.MatchString(version)
}

// NormalizeSemver нормализует версию (убирает пробелы, префиксы v)
func NormalizeSemver(version string) string {
	version = strings.TrimSpace(version)
	version = strings.TrimPrefix(version, "v")
	return version
}

