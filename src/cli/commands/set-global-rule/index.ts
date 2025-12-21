import { cancel, confirm, isCancel, text } from '@clack/prompts';

import {
    getMetaInfoTemplatePath,
    readUserRules,
    substituteTemplateVars,
    writeUserRules,
} from '../../../lib/cursor-rules';
import { t } from '../../../lib/i18n';
import type { TemplateVariables } from '../../../model';
import { extractVariablesFromContent } from './extract-variables-from-content';
import { promptVariables } from './prompt-variables';

const CANCELLED_MESSAGE_KEY = 'cli.interactive-menu.cancelled';

/** Команда установки глобального правила Cursor */
export async function setGlobalRuleCommand(): Promise<void> {
    const ruleNameInput = await text({
        message: t('command.set-global-rule.prompt.rule-name'),
        placeholder: 'meta-info.md',
    });

    if (isCancel(ruleNameInput)) {
        cancel(t(CANCELLED_MESSAGE_KEY));

        return;
    }

    const ruleName = ruleNameInput.trim();

    if (ruleName === '') {
        throw new Error(t('command.set-global-rule.error.empty-rule-name'));
    }

    const existingRules = await readUserRules();
    let existingVariables: Partial<TemplateVariables> = {};
    let existingRuleIndex = -1;

    if (existingRules !== null) {
        existingRuleIndex = existingRules.findIndex((rule) => rule.name === ruleName);

        if (existingRuleIndex >= 0) {
            const existingContent = existingRules[existingRuleIndex].content;
            existingVariables = extractVariablesFromContent(existingContent);
            const shouldUpdate = await confirm({
                initialValue: true,
                message: t('command.set-global-rule.prompt.update-existing'),
            });

            if (isCancel(shouldUpdate)) {
                cancel(t(CANCELLED_MESSAGE_KEY));

                return;
            }

            if (shouldUpdate === false) {
                cancel(t('command.set-global-rule.cancelled'));

                return;
            }
        }
    }

    const variables = await promptVariables(existingVariables);
    const templatePath = getMetaInfoTemplatePath();
    const substitutedContent = await substituteTemplateVars(templatePath, variables);

    const newRule = {
        content: substitutedContent,
        name: ruleName,
    };

    let updatedRules: Array<{ content: string; name: string }>;

    if (existingRules === null) {
        updatedRules = [newRule];
    } else if (existingRuleIndex >= 0) {
        updatedRules = existingRules.map((rule, index) => (index === existingRuleIndex ? newRule : rule));
    } else {
        updatedRules = [...existingRules, newRule];
    }

    await writeUserRules(updatedRules);

    console.log(t('command.set-global-rule.success', { ruleName }));
}
