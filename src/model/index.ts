export { GITHUB_REPO, RULES_DIRS, VERSION_FILE_NAME } from './constants/main';
export {
    type InitCommandParams,
    initCommandParamsSchema,
    type ReplaceAllCommandParams,
    replaceAllCommandParamsSchema,
    type UpgradeCommandParams,
    upgradeCommandParamsSchema,
} from './schemas/command-params';
export { rulesConfigSchema } from './schemas/main';
export type {
    CheckAndUpdateOptions,
    CommandType,
    FileOverride,
    RulesConfig,
    RuleSet,
    UserConfig,
    VersionComparison,
    VersionDiff,
} from './types/main';
