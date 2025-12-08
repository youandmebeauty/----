import { LoadingAnimation } from "@/components/ui/loading-animation"

export default function Loading() {
  return (
    <div className="container min-h-[50vh] flex items-center justify-center">
      <LoadingAnimation className="text-primary" />
    </div>
  )
}
