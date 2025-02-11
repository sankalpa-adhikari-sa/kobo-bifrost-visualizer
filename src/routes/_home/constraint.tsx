import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_home/constraint')({
  component: ConstraintPage,
})

function ConstraintPage() {
  return <div>Hello "/(home)/_home/constraint"!</div>
}
