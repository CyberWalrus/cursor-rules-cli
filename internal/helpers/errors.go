package helpers

import (
	"fmt"
	"os"
)

// ErrorType представляет тип ошибки
type ErrorType string

const (
	ErrorTypeCritical ErrorType = "critical"
	ErrorTypeWarning  ErrorType = "warning"
	ErrorTypeSuccess  ErrorType = "success"
)

// CLIError представляет ошибку CLI с типом
type CLIError struct {
	Type    ErrorType
	Message string
}

func (e *CLIError) Error() string {
	return e.Message
}

// NewCriticalError создает критическую ошибку
func NewCriticalError(format string, args ...interface{}) *CLIError {
	return &CLIError{
		Type:    ErrorTypeCritical,
		Message: fmt.Sprintf("Error: %s", fmt.Sprintf(format, args...)),
	}
}

// NewWarning создает предупреждение
func NewWarning(format string, args ...interface{}) *CLIError {
	return &CLIError{
		Type:    ErrorTypeWarning,
		Message: fmt.Sprintf("⚠️ %s", fmt.Sprintf(format, args...)),
	}
}

// NewSuccess создает сообщение об успехе
func NewSuccess(format string, args ...interface{}) *CLIError {
	return &CLIError{
		Type:    ErrorTypeSuccess,
		Message: fmt.Sprintf("✓ %s", fmt.Sprintf(format, args...)),
	}
}

// PrintError выводит ошибку в соответствующий поток
func PrintError(err error) {
	if cliErr, ok := err.(*CLIError); ok {
		switch cliErr.Type {
		case ErrorTypeCritical:
			fmt.Fprintf(os.Stderr, "%s\n", cliErr.Message)
		case ErrorTypeWarning:
			fmt.Fprintf(os.Stdout, "%s\n", cliErr.Message)
		case ErrorTypeSuccess:
			fmt.Fprintf(os.Stdout, "%s\n", cliErr.Message)
		}
	} else {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
	}
}

