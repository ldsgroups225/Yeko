import type {
  WorkflowEvent,
  WorkflowStep,
} from 'cloudflare:workers'
import type { ExampleWorkflowParams } from 'worker-configuration'
import {
  WorkflowEntrypoint,
} from 'cloudflare:workers'

export class ExampleWorkflow extends WorkflowEntrypoint<
  Env,
  ExampleWorkflowParams
> {
  override async run(
    event: Readonly<WorkflowEvent<ExampleWorkflowParams>>,
    step: WorkflowStep,
  ) {
    const randomNumber = await step.do('Get random number', async () => {
      return Math.floor(Math.random() * 10) + 1
    })

    await step.sleep(
      'Wait for random number of seconds',
      `${randomNumber} seconds`,
    )

    await step.do('Log data in payload', async () => {
      console.warn(event.payload)
    })
  }
}
