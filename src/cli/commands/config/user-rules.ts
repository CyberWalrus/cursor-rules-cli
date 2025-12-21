import { cancel, confirm, isCancel, select, text } from '@clack/prompts';

import { readUserRules, writeUserRules } from '../../../lib/cursor-rules';
import { t } from '../../../lib/i18n';
import type { UserRule } from '../../../model/types/main';

const CANCELLED_MESSAGE_KEY = 'cli.interactive-menu.cancelled';

/** Выводит список правил */
function listRules(rules: UserRule[]): void {
    if (rules.length === 0) {
        console.log('Нет правил.');

        return;
    }

    console.log('Список правил:');
    rules.forEach((rule, index) => {
        console.log(`${index + 1}. ${rule.name}`);
    });
}

/** Добавляет новое правило */
async function addRule(rules: UserRule[]): Promise<void> {
    const ruleNameInput = await text({
        message: 'Введите имя правила:',
        placeholder: 'meta-info.md',
    });

    if (isCancel(ruleNameInput)) {
        cancel(t(CANCELLED_MESSAGE_KEY));

        return;
    }

    const ruleName = ruleNameInput.trim();

    if (ruleName === '') {
        throw new Error('Имя правила не может быть пустым');
    }

    if (rules.some((rule) => rule.name === ruleName)) {
        throw new Error(`Правило с именем "${ruleName}" уже существует`);
    }

    const contentInput = await text({
        message: 'Введите содержимое правила:',
        placeholder: 'Содержимое правила...',
    });

    if (isCancel(contentInput)) {
        cancel(t(CANCELLED_MESSAGE_KEY));

        return;
    }

    const newRule: UserRule = {
        content: contentInput,
        name: ruleName,
    };

    await writeUserRules([...rules, newRule]);
    console.log(`✓ Правило "${ruleName}" успешно добавлено`);
}

/** Редактирует существующее правило */
async function editRule(rules: UserRule[]): Promise<void> {
    if (rules.length === 0) {
        console.log('Нет правил для редактирования.');

        return;
    }

    const ruleOptions = rules.map((rule) => ({
        label: rule.name,
        value: rule.name,
    }));

    const selectedRuleName = await select<string>({
        message: 'Выберите правило для редактирования:',
        options: ruleOptions,
    });

    if (isCancel(selectedRuleName)) {
        cancel(t(CANCELLED_MESSAGE_KEY));

        return;
    }

    const ruleIndex = rules.findIndex((rule) => rule.name === selectedRuleName);

    if (ruleIndex < 0) {
        throw new Error(`Правило "${selectedRuleName}" не найдено`);
    }

    const currentContent = rules[ruleIndex].content;
    const contentInput = await text({
        initialValue: currentContent,
        message: 'Введите новое содержимое правила:',
        placeholder: 'Содержимое правила...',
    });

    if (isCancel(contentInput)) {
        cancel(t(CANCELLED_MESSAGE_KEY));

        return;
    }

    const updatedRules = rules.map((rule, index) => (index === ruleIndex ? { ...rule, content: contentInput } : rule));

    await writeUserRules(updatedRules);
    console.log(`✓ Правило "${selectedRuleName}" успешно обновлено`);
}

/** Удаляет правило */
async function deleteRule(rules: UserRule[]): Promise<void> {
    if (rules.length === 0) {
        console.log('Нет правил для удаления.');

        return;
    }

    const ruleOptions = rules.map((rule) => ({
        label: rule.name,
        value: rule.name,
    }));

    const selectedRuleName = await select<string>({
        message: 'Выберите правило для удаления:',
        options: ruleOptions,
    });

    if (isCancel(selectedRuleName)) {
        cancel(t(CANCELLED_MESSAGE_KEY));

        return;
    }

    const shouldDelete = await confirm({
        initialValue: false,
        message: `Удалить правило "${selectedRuleName}"?`,
    });

    if (isCancel(shouldDelete)) {
        cancel(t(CANCELLED_MESSAGE_KEY));

        return;
    }

    if (shouldDelete === false) {
        cancel('Операция отменена');

        return;
    }

    const updatedRules = rules.filter((rule) => rule.name !== selectedRuleName);

    await writeUserRules(updatedRules);
    console.log(`✓ Правило "${selectedRuleName}" успешно удалено`);
}

/** Управление User Rules в настройках Cursor */
export async function manageUserRulesCommand(): Promise<void> {
    const existingRules = await readUserRules();
    const rules = existingRules ?? [];

    const action = await select<'add' | 'delete' | 'edit' | 'list'>({
        message: 'Выберите действие:',
        options: [
            { label: 'Добавить новое правило', value: 'add' },
            { label: 'Редактировать существующее правило', value: 'edit' },
            { label: 'Удалить правило', value: 'delete' },
            { label: 'Список правил', value: 'list' },
        ],
    });

    if (isCancel(action)) {
        cancel(t(CANCELLED_MESSAGE_KEY));

        return;
    }

    if (action === 'list') {
        listRules(rules);

        return;
    }

    if (action === 'add') {
        await addRule(rules);

        return;
    }

    if (action === 'edit') {
        await editRule(rules);

        return;
    }

    if (action === 'delete') {
        await deleteRule(rules);
    }
}
