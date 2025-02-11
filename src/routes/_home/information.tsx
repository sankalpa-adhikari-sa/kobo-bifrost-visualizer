import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_home/information')({
  component: InformationPage,
})

function InformationPage() {
  return <div>Hello "/(home)/_home/information"!</div>
}
