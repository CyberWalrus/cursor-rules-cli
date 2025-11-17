package fileops

import (
	"fmt"

	"github.com/CyberWalrus/cursor-rules-cli/internal/config"
)

// CalculateDiff вычисляет diff между двумя директориями
func CalculateDiff(sourceDir, targetDir string) (*config.VersionDiff, error) {
	sourceMap, err := ScanDirectory(sourceDir)
	if err != nil {
		return nil, fmt.Errorf("failed to scan source directory: %w", err)
	}

	targetMap, err := ScanDirectory(targetDir)
	if err != nil {
		return nil, fmt.Errorf("failed to scan target directory: %w", err)
	}

	diff := &config.VersionDiff{
		ToAdd:    []string{},
		ToUpdate: []string{},
		ToDelete: []string{},
	}

	for sourcePath, sourceHash := range sourceMap {
		targetHash, exists := targetMap[sourcePath]
		if !exists {
			diff.ToAdd = append(diff.ToAdd, sourcePath)
		} else if sourceHash != targetHash {
			diff.ToUpdate = append(diff.ToUpdate, sourcePath)
		}
	}

	for targetPath := range targetMap {
		if _, exists := sourceMap[targetPath]; !exists {
			diff.ToDelete = append(diff.ToDelete, targetPath)
		}
	}

	return diff, nil
}

