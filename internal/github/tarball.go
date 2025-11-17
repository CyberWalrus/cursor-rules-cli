package github

import (
	"archive/tar"
	"compress/gzip"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

const (
	tarballURL = "https://github.com/%s/%s/archive/refs/tags/prompts/v%s.tar.gz"
)

// DownloadAndExtractTarball скачивает и распаковывает tarball с правилами
func DownloadAndExtractTarball(version string, tempDir string) (string, error) {
	url := fmt.Sprintf(tarballURL, githubRepoOwner, githubRepoName, version)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("User-Agent", userAgent)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to download tarball: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to download tarball: HTTP %d", resp.StatusCode)
	}

	extractDir := filepath.Join(tempDir, "extracted")
	if err := os.MkdirAll(extractDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create extract directory: %w", err)
	}

	gzReader, err := gzip.NewReader(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to create gzip reader: %w", err)
	}
	defer gzReader.Close()

	tarReader := tar.NewReader(gzReader)

	skipFirstDir := true
	var baseDir string

	for {
		header, err := tarReader.Next()
		if err == io.EOF {
			break
		}
		if err != nil {
			return "", fmt.Errorf("failed to read tar archive: %w", err)
		}

		if skipFirstDir && header.Typeflag == tar.TypeDir {
			baseDir = header.Name
			skipFirstDir = false
			continue
		}

		if baseDir != "" && strings.HasPrefix(header.Name, baseDir) {
			relativePath := strings.TrimPrefix(header.Name, baseDir)
			relativePath = strings.TrimPrefix(relativePath, "/")
			targetPath := filepath.Join(extractDir, relativePath)

			switch header.Typeflag {
			case tar.TypeDir:
				if err := os.MkdirAll(targetPath, os.FileMode(header.Mode)); err != nil {
					return "", fmt.Errorf("failed to create directory: %w", err)
				}

			case tar.TypeReg:
				if err := os.MkdirAll(filepath.Dir(targetPath), 0755); err != nil {
					return "", fmt.Errorf("failed to create parent directory: %w", err)
				}

				outFile, err := os.Create(targetPath)
				if err != nil {
					return "", fmt.Errorf("failed to create file: %w", err)
				}

				if _, err := io.Copy(outFile, tarReader); err != nil {
					outFile.Close()
					return "", fmt.Errorf("failed to write file: %w", err)
				}
				outFile.Close()

				if err := os.Chmod(targetPath, os.FileMode(header.Mode)); err != nil {
					return "", fmt.Errorf("failed to set file permissions: %w", err)
				}
			}
		}
	}

	return extractDir, nil
}

