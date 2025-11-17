package helpers

import (
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"strings"
)

// GetPackageDir определяет директорию пакета на основе расположения исполняемого файла
func GetPackageDir() (string, error) {
	execPath, err := os.Executable()
	if err != nil {
		return "", fmt.Errorf("failed to get executable path: %w", err)
	}

	realPath, err := filepath.EvalSymlinks(execPath)
	if err != nil {
		realPath = execPath
	}

	execDir := filepath.Dir(realPath)
	execDir = strings.ReplaceAll(execDir, "\\", "/")

	if strings.HasSuffix(execDir, "/dist") || strings.HasSuffix(execDir, "/bin") {
		return filepath.Dir(execDir), nil
	}

	parent := execDir
	for i := 0; i < 3; i++ {
		parent = filepath.Dir(parent)
	}

	return parent, nil
}

// GetTargetDir возвращает текущую рабочую директорию
func GetTargetDir() (string, error) {
	wd, err := os.Getwd()
	if err != nil {
		return "", fmt.Errorf("failed to get working directory: %w", err)
	}
	return wd, nil
}

// NormalizePath нормализует путь (замена обратных слешей на прямые)
func NormalizePath(path string) string {
	if runtime.GOOS == "windows" {
		return strings.ReplaceAll(path, "\\", "/")
	}
	return path
}

