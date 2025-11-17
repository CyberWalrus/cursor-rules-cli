package fileops

import (
	"fmt"
	"os"
	"path/filepath"
)

// DeleteRules рекурсивно удаляет директории правил
func DeleteRules(targetDir string) error {
	dirsToDelete := []string{
		filepath.Join(targetDir, ".cursor", "rules"),
		filepath.Join(targetDir, ".cursor", "docs"),
		filepath.Join(targetDir, ".cursor", "commands"),
	}

	for _, dir := range dirsToDelete {
		if err := deleteDirectory(dir); err != nil {
			if !os.IsNotExist(err) {
				return fmt.Errorf("failed to delete %s: %w", dir, err)
			}
		}
	}

	return nil
}

// deleteDirectory рекурсивно удаляет директорию
func deleteDirectory(dir string) error {
	return os.RemoveAll(dir)
}

