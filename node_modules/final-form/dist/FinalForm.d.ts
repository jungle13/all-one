import { Config, ConfigKey, FormApi } from "./types";
export { version } from "./version";
export declare const configOptions: ConfigKey[];
declare function createForm<FormValues = Record<string, any>, InitialFormValues extends Partial<FormValues> = Partial<FormValues>>(config: Config<FormValues, InitialFormValues>): FormApi<FormValues, InitialFormValues>;
export default createForm;
