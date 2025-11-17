package version

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
)

var calverRegex = regexp.MustCompile(`^(\d{4})\.(\d{1,2})\.(\d{1,2})\.(\d+)$`)

// CompareCalver сравнивает две CalVer версии и возвращает тип изменения
// Формат: YYYY.M.D.N
// Логика:
//   - Изменение года или месяца → "major"
//   - Изменение дня → "minor"
//   - Изменение инкремента → "patch"
//   - Обратное сравнение (локальная новее) → "none"
func CompareCalver(current, target string) (string, error) {
	currentParts := calverRegex.FindStringSubmatch(current)
	targetParts := calverRegex.FindStringSubmatch(target)

	if currentParts == nil {
		return "", fmt.Errorf("invalid CalVer format for current version: %s", current)
	}
	if targetParts == nil {
		return "", fmt.Errorf("invalid CalVer format for target version: %s", target)
	}

	currentYear, _ := strconv.Atoi(currentParts[1])
	currentMonth, _ := strconv.Atoi(currentParts[2])
	currentDay, _ := strconv.Atoi(currentParts[3])
	currentIncrement, _ := strconv.Atoi(currentParts[4])

	targetYear, _ := strconv.Atoi(targetParts[1])
	targetMonth, _ := strconv.Atoi(targetParts[2])
	targetDay, _ := strconv.Atoi(targetParts[3])
	targetIncrement, _ := strconv.Atoi(targetParts[4])

	if currentYear == targetYear && currentMonth == targetMonth &&
		currentDay == targetDay && currentIncrement == targetIncrement {
		return "none", nil
	}

	if currentYear > targetYear ||
		(currentYear == targetYear && currentMonth > targetMonth) ||
		(currentYear == targetYear && currentMonth == targetMonth && currentDay > targetDay) ||
		(currentYear == targetYear && currentMonth == targetMonth &&
			currentDay == targetDay && currentIncrement > targetIncrement) {
		return "none", nil
	}

	if currentYear != targetYear || currentMonth != targetMonth {
		return "major", nil
	}
	if currentDay != targetDay {
		return "minor", nil
	}
	return "patch", nil
}

// ParseCalver парсит CalVer версию и возвращает компоненты
func ParseCalver(version string) (year, month, day, increment int, err error) {
	parts := calverRegex.FindStringSubmatch(version)
	if parts == nil {
		return 0, 0, 0, 0, fmt.Errorf("invalid CalVer format: %s", version)
	}

	year, _ = strconv.Atoi(parts[1])
	month, _ = strconv.Atoi(parts[2])
	day, _ = strconv.Atoi(parts[3])
	increment, _ = strconv.Atoi(parts[4])

	return year, month, day, increment, nil
}

// IsValidCalver проверяет, является ли строка валидной CalVer версией
func IsValidCalver(version string) bool {
	return calverRegex.MatchString(version)
}

// NormalizeCalver нормализует версию (убирает пробелы, префиксы prompts/v)
func NormalizeCalver(version string) string {
	version = strings.TrimSpace(version)
	version = strings.TrimPrefix(version, "prompts/v")
	version = strings.TrimPrefix(version, "v")
	return version
}

