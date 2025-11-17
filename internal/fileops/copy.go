package fileops

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"

	"github.com/gobwas/glob"
)

const (
	rulesDir   = ".cursor/rules"
	docsDir    = ".cursor/docs"
	commandsDir = ".cursor/commands"
)

// CopyRules копирует правила из источника в целевую директорию с применением ignoreList
func CopyRules(sourceDir, targetDir string, ignoreList []string) error {
	patterns := make([]glob.Glob, 0, len(ignoreList))
	for _, pattern := range ignoreList {
		normalizedPattern := normalizePattern(pattern)
		compiled, err := glob.Compile(normalizedPattern)
		if err != nil {
			return fmt.Errorf("invalid glob pattern %s: %w", pattern, err)
		}
		patterns = append(patterns, compiled)
	}

	dirsToCopy := []string{rulesDir, docsDir, commandsDir}
	for _, dir := range dirsToCopy {
		sourcePath := filepath.Join(sourceDir, dir)
		targetPath := filepath.Join(targetDir, dir)

		if err := copyDirectory(sourcePath, targetPath, patterns); err != nil {
			return fmt.Errorf("failed to copy %s: %w", dir, err)
		}
	}

	return nil
}

// copyDirectory рекурсивно копирует директорию с применением паттернов игнорирования
func copyDirectory(sourceDir, targetDir string, ignorePatterns []glob.Glob) error {
	return filepath.Walk(sourceDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		relPath, err := filepath.Rel(sourceDir, path)
		if err != nil {
			return fmt.Errorf("failed to get relative path: %w", err)
		}

		normalizedPath := strings.ReplaceAll(relPath, "\\", "/")

		for _, pattern := range ignorePatterns {
			if pattern.Match(normalizedPath) {
				if info.IsDir() {
					return filepath.SkipDir
				}
				return nil
			}
		}

		targetPath := filepath.Join(targetDir, relPath)

		if info.IsDir() {
			return os.MkdirAll(targetPath, info.Mode())
		}

		if err := os.MkdirAll(filepath.Dir(targetPath), 0755); err != nil {
			return fmt.Errorf("failed to create parent directory: %w", err)
		}

		return copyFile(path, targetPath, info.Mode())
	})
}

// copyFile копирует файл
func copyFile(source, target string, mode os.FileMode) error {
	srcFile, err := os.Open(source)
	if err != nil {
		return fmt.Errorf("failed to open source file: %w", err)
	}
	defer srcFile.Close()

	dstFile, err := os.Create(target)
	if err != nil {
		return fmt.Errorf("failed to create target file: %w", err)
	}
	defer dstFile.Close()

	if _, err := io.Copy(dstFile, srcFile); err != nil {
		return fmt.Errorf("failed to copy file content: %w", err)
	}

	return os.Chmod(target, mode)
}

// normalizePattern нормализует glob паттерн (относительно .cursor/)
func normalizePattern(pattern string) string {
	pattern = strings.TrimSpace(pattern)
	pattern = strings.TrimPrefix(pattern, ".cursor/")
	return pattern
}

