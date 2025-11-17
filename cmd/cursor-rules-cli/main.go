package main

import (
	"fmt"
	"os"

	"github.com/CyberWalrus/cursor-rules-cli/internal/commands"
	"github.com/CyberWalrus/cursor-rules-cli/internal/helpers"
	"github.com/CyberWalrus/cursor-rules-cli/internal/ui"
	"github.com/spf13/cobra"
)

var (
	version   = "dev"
	buildTime = "unknown"
	gitCommit = "unknown"
)

func main() {
	// Проверка обновлений в фоновом режиме
	go func() {
		_ = ui.CheckAndNotifyUpdate()
	}()

	rootCmd := &cobra.Command{
		Use:   "cursor-rules-cli",
		Short: "CLI tool for managing .cursor rules in projects",
		Long:  "CLI tool for managing .cursor rules in projects. Allows initialization, updating, and full replacement of rule sets from GitHub repository.",
		Version: fmt.Sprintf("%s (built at %s, commit %s)", version, buildTime, gitCommit),
	}

	rootCmd.AddCommand(initCmd())
	rootCmd.AddCommand(replaceAllCmd())
	rootCmd.AddCommand(upgradeCmd())

	if err := rootCmd.Execute(); err != nil {
		helpers.PrintError(err)
		os.Exit(1)
	}
}

func initCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "init",
		Short: "Initialize .cursor rules in the project",
		Long:  "Initialize .cursor rules in the project. Downloads the latest version from GitHub and creates configuration file.",
		RunE: func(cmd *cobra.Command, args []string) error {
			targetDir, err := helpers.GetTargetDir()
			if err != nil {
				return err
			}
			return commands.InitCommand(targetDir)
		},
	}
}

func replaceAllCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "replace-all",
		Short: "Replace all .cursor rules with the latest version",
		Long:  "Replace all .cursor rules with the latest version. Removes old rules and copies new ones without preserving user changes.",
		RunE: func(cmd *cobra.Command, args []string) error {
			targetDir, err := helpers.GetTargetDir()
			if err != nil {
				return err
			}
			return commands.ReplaceAllCommand(targetDir)
		},
	}
}

func upgradeCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "upgrade",
		Short: "Upgrade .cursor rules to the latest version",
		Long:  "Upgrade .cursor rules to the latest version. Incrementally updates rules while preserving user changes and applying overrides.",
		RunE: func(cmd *cobra.Command, args []string) error {
			targetDir, err := helpers.GetTargetDir()
			if err != nil {
				return err
			}
			return commands.UpgradeCommand(targetDir)
		},
	}
}

