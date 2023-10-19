export const pipelineBreak: unique symbol;

import { PipelineFor } from '../pipelineFor';

export const pipeline: PipelineFor<typeof pipelineBreak>;
