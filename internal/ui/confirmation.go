package ui

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

// AskConfirmation запрашивает подтверждение у пользователя
func AskConfirmation(question string) (bool, error) {
	fmt.Printf("%s (y/n): ", question)

	reader := bufio.NewReader(os.Stdin)
	answer, err := reader.ReadString('\n')
	if err != nil {
		return false, fmt.Errorf("failed to read input: %w", err)
	}

	answer = strings.TrimSpace(answer)
	answer = strings.ToLower(answer)

	return answer == "y" || answer == "yes", nil
}
