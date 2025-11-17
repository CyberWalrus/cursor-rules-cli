package ui

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"time"

	"github.com/CyberWalrus/cursor-rules-cli/internal/version"
	"github.com/fatih/color"
)

const (
	npmRegistryURL = "https://registry.npmjs.org/cursor-rules-cli/latest"
	timeout        = 5 * time.Second
)

// NPMResponse представляет ответ npm registry
type NPMResponse struct {
	Version string `json:"version"`
}

// CheckAndNotifyUpdate проверяет обновления и выводит уведомление
func CheckAndNotifyUpdate() error {
	currentVersion := version.GetPackageVersion()
	if currentVersion == "dev" {
		return nil
	}

	client := &http.Client{
		Timeout: timeout,
	}

	resp, err := client.Get(npmRegistryURL)
	if err != nil {
		return nil
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil
	}

	var npmResp NPMResponse
	if err := json.NewDecoder(resp.Body).Decode(&npmResp); err != nil {
		return nil
	}

	latestVersion := npmResp.Version

	changeType, err := version.CompareSemver(currentVersion, latestVersion)
	if err != nil {
		return nil
	}

	if changeType == "none" {
		return nil
	}

	installMethod := detectInstallMethod()

	printUpdateNotification(currentVersion, latestVersion, installMethod)

	return nil
}

// detectInstallMethod определяет способ установки (npm или Homebrew)
func detectInstallMethod() string {
	execPath, err := os.Executable()
	if err != nil {
		return "unknown"
	}

	realPath, err := filepath.EvalSymlinks(execPath)
	if err != nil {
		realPath = execPath
	}

	execDir := strings.ToLower(filepath.Dir(realPath))

	if strings.Contains(execDir, "node_modules") ||
		strings.Contains(execDir, "npm") ||
		strings.Contains(execDir, "/usr/local/lib/node_modules") ||
		strings.Contains(execDir, "npm-global") {
		return "npm"
	}

	if strings.Contains(execDir, "/opt/homebrew/bin") ||
		strings.Contains(execDir, "/usr/local/bin") ||
		strings.Contains(execDir, "homebrew") {
		return "homebrew"
	}

	return "unknown"
}

// printUpdateNotification выводит уведомление об обновлении
func printUpdateNotification(currentVersion, latestVersion, installMethod string) {
	useColors := supportsColors()

	var header, commands string

	if useColors {
		cyan := color.New(color.FgCyan, color.Bold)
		red := color.New(color.FgRed)
		green := color.New(color.FgGreen)

		header = cyan.Sprint("A new version of cursor-rules-cli is available: ") +
			red.Sprint(currentVersion) + " → " + green.Sprint(latestVersion)
	} else {
		header = fmt.Sprintf("A new version of cursor-rules-cli is available: %s → %s", currentVersion, latestVersion)
	}

	var updateCommands []string

	if installMethod == "npm" {
		updateCommands = append(updateCommands, "  npm i -g cursor-rules-cli@latest")
	} else if installMethod == "homebrew" {
		updateCommands = append(updateCommands, "  brew upgrade cursor-rules-cli")
	} else {
		updateCommands = append(updateCommands, "  npm i -g cursor-rules-cli@latest")
		updateCommands = append(updateCommands, "  brew upgrade cursor-rules-cli")
	}

	updateCommands = append(updateCommands, "  Or visit: https://github.com/CyberWalrus/cursor-rules-cli/releases/latest")

	commands = strings.Join(updateCommands, "\n")

	fmt.Println()
	fmt.Println(header)
	fmt.Println()
	fmt.Println("To update, run:")
	fmt.Println(commands)
	fmt.Println()
}

// supportsColors проверяет поддержку цветов в терминале
func supportsColors() bool {
	if os.Getenv("NO_COLOR") != "" {
		return false
	}

	term := os.Getenv("TERM")
	if term == "" {
		return false
	}

	if term == "dumb" {
		return false
	}

	if !isTerminal(os.Stdout) {
		return false
	}

	return true
}

// isTerminal проверяет, является ли файл терминалом
func isTerminal(f *os.File) bool {
	if runtime.GOOS != "windows" {
		cmd := exec.Command("sh", "-c", "test -t 0")
		cmd.Stdin = f
		err := cmd.Run()
		return err == nil
	}

	return true
}

