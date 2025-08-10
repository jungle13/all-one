import type { InternalFieldState, InternalFormState, FieldState } from "./types";
/**
 * Converts internal field state to published field state
 */
declare function publishFieldState<FormValues = Record<string, any>>(formState: InternalFormState<FormValues>, field: InternalFieldState): FieldState;
export default publishFieldState;
