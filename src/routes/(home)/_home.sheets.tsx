import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(home)/_home/sheets')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/home/sheets"!</div>
}
