package version

// GetPackageVersion возвращает версию пакета из встроенной переменной
// Версия должна быть установлена при сборке через -ldflags
var GetPackageVersion = func() string {
	return "dev" // По умолчанию, если не установлена при сборке
}

// SetPackageVersion устанавливает функцию получения версии пакета
// Используется для тестирования или установки версии при сборке
func SetPackageVersion(fn func() string) {
	GetPackageVersion = fn
}

