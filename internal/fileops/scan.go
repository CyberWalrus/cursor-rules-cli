package fileops

import (
	"crypto/sha256"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
)

// ScanDirectory рекурсивно сканирует директорию и вычисляет SHA-256 хеш для каждого файла
func ScanDirectory(dir string) (map[string]string, error) {
	fileMap := make(map[string]string)

	if _, err := os.Stat(dir); os.IsNotExist(err) {
		return fileMap, nil
	}

	err := filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if info.IsDir() {
			return nil
		}

		relPath, err := filepath.Rel(dir, path)
		if err != nil {
			return fmt.Errorf("failed to get relative path: %w", err)
		}

		relPath = strings.ReplaceAll(relPath, "\\", "/")

		hash, err := calculateFileHash(path)
		if err != nil {
			return fmt.Errorf("failed to calculate hash for %s: %w", path, err)
		}

		fileMap[relPath] = hash
		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to scan directory: %w", err)
	}

	return fileMap, nil
}

// calculateFileHash вычисляет SHA-256 хеш файла
func calculateFileHash(filePath string) (string, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	hash := sha256.New()
	if _, err := io.Copy(hash, file); err != nil {
		return "", err
	}

	return fmt.Sprintf("%x", hash.Sum(nil)), nil
}

