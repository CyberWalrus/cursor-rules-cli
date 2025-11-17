package helpers

import (
	"fmt"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"
)

var tempDirs []string

func init() {
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGINT)
	go func() {
		<-sigChan
		CleanupAllTempDirs()
		os.Exit(1)
	}()
}

// CreateTempDir создает временную директорию
func CreateTempDir() (string, error) {
	tempBase := os.TempDir()
	timestamp := time.Now().Format("20060102150405")
	dirName := fmt.Sprintf("cursor-rules-%s", timestamp)
	tempDir := filepath.Join(tempBase, dirName)

	if err := os.MkdirAll(tempDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create temp directory: %w", err)
	}

	tempDirs = append(tempDirs, tempDir)

	return tempDir, nil
}

// CleanupTempDir удаляет временную директорию
func CleanupTempDir(dir string) error {
	if dir == "" {
		return nil
	}

	if err := os.RemoveAll(dir); err != nil {
		return fmt.Errorf("failed to remove temp directory: %w", err)
	}

	for i, d := range tempDirs {
		if d == dir {
			tempDirs = append(tempDirs[:i], tempDirs[i+1:]...)
			break
		}
	}

	return nil
}

// CleanupAllTempDirs удаляет все временные директории
func CleanupAllTempDirs() {
	for _, dir := range tempDirs {
		_ = os.RemoveAll(dir)
	}
	tempDirs = []string{}
}

