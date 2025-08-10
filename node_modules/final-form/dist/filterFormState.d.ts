import type { FormState, FormSubscription } from "./types";
/**
 * Filters items in a FormState based on a FormSubscription
 */
export default function filterFormState<FormValues = Record<string, any>, InitialFormValues extends Partial<FormValues> = Partial<FormValues>>(state: FormState<FormValues, InitialFormValues>, previousState: FormState<FormValues, InitialFormValues> | undefined, subscription: FormSubscription, force: boolean): FormState<FormValues, InitialFormValues> | undefined;
